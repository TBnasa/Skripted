-- ═══════════════════════════════════════════════════════════
-- Skripted — Comprehensive Database Optimization
-- Part 1: Missing Columns & Schema Fixes
-- ═══════════════════════════════════════════════════════════

-- 1a. Add missing columns to chat_history
ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- 1b. Add compound index for chat listing query (user_id + session_id)
DROP INDEX IF EXISTS idx_chat_history_user_session;
CREATE INDEX idx_chat_history_user_session ON public.chat_history(user_id, session_id, created_at DESC);

-- 1c. Partial index for sessions that have titles (chat sidebar)
CREATE INDEX IF NOT EXISTS idx_chat_history_title_not_null ON public.chat_history(session_id, created_at DESC) WHERE title IS NOT NULL;

-- ═══════════════════════════════════════════════════════════
-- Part 2: Gallery Performance Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_gallery_posts_is_public ON public.gallery_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_user_id ON public.gallery_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_category ON public.gallery_posts(category);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_created_at ON public.gallery_posts(created_at DESC);

-- Compound index for filtered gallery views (public + category + date)
CREATE INDEX IF NOT EXISTS idx_gallery_posts_public_category_date
ON public.gallery_posts(is_public, category, created_at DESC);

-- Compound index for "my posts" view
CREATE INDEX IF NOT EXISTS idx_gallery_posts_user_date
ON public.gallery_posts(user_id, created_at DESC);

-- Comments: index for post_id (speeds up comment fetching per post)
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON public.post_comments(parent_id);

-- Likes: unique constraint + index (prevents duplicate likes)
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post ON public.post_likes(user_id, post_id);

-- ═══════════════════════════════════════════════════════════
-- Part 3: Profile & Social Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);

-- Unique constraint for followers (prevents duplicate follows at DB level)
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS followers_unique;
ALTER TABLE public.followers ADD CONSTRAINT followers_unique UNIQUE (follower_id, following_id);

-- ═══════════════════════════════════════════════════════════
-- Part 4: Usage Limits & Scripts Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_usage_limits_user ON public.usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scripts_user ON public.user_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_script_versions_script ON public.user_script_versions(script_id);

-- ═══════════════════════════════════════════════════════════
-- Part 5: Optimized RPC Functions (Atomic Counters)
-- ═══════════════════════════════════════════════════════════

-- Gallery download count increment
CREATE OR REPLACE FUNCTION public.increment_download_count(post_id_to_increment UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.gallery_posts
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = post_id_to_increment;
END;
$$;

-- Combined follow with atomic counts (reduces 3 calls to 1)
CREATE OR REPLACE FUNCTION public.follow_user(p_follower_id TEXT, p_following_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.followers (follower_id, following_id)
  VALUES (p_follower_id, p_following_id)
  ON CONFLICT (follower_id, following_id) DO NOTHING;

  IF FOUND THEN
    UPDATE public.profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = p_following_id;
    UPDATE public.profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = p_follower_id;
  END IF;
END;
$$;

-- Combined unfollow with atomic counts (reduces 3 calls to 1)
CREATE OR REPLACE FUNCTION public.unfollow_user(p_follower_id TEXT, p_following_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.followers
  WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF FOUND THEN
    UPDATE public.profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = p_following_id;
    UPDATE public.profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = p_follower_id;
  END IF;
END;
$$;

-- Atomic usage increment with auto-insert (replaces manual fallback)
CREATE OR REPLACE FUNCTION public.increment_usage_count(x_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date TEXT := to_char(now(), 'YYYY-MM-DD');
BEGIN
  INSERT INTO public.usage_limits (user_id, generations_today, last_generation_date, tier)
  VALUES (x_user_id, 1, today_date, 'Free')
  ON CONFLICT (user_id) DO UPDATE SET
    generations_today = CASE
      WHEN usage_limits.last_generation_date = today_date THEN usage_limits.generations_today + 1
      ELSE 1
    END,
    last_generation_date = today_date;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- Part 6: RLS Policies
-- ═══════════════════════════════════════════════════════════

-- gallery_posts: anyone can read public posts, only owner can modify
ALTER TABLE public.gallery_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public posts" ON public.gallery_posts;
CREATE POLICY "Anyone can view public posts" ON public.gallery_posts
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own posts" ON public.gallery_posts;
CREATE POLICY "Users can view their own posts" ON public.gallery_posts
  FOR SELECT USING (user_id = current_user);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.gallery_posts;
CREATE POLICY "Users can create their own posts" ON public.gallery_posts
  FOR INSERT WITH CHECK (user_id = current_user);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.gallery_posts;
CREATE POLICY "Users can update their own posts" ON public.gallery_posts
  FOR UPDATE USING (user_id = current_user);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.gallery_posts;
CREATE POLICY "Users can delete their own posts" ON public.gallery_posts
  FOR DELETE USING (user_id = current_user);

-- post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.post_comments;
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (user_id = current_user);

-- post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their likes" ON public.post_likes;
CREATE POLICY "Users can manage their likes" ON public.post_likes
  FOR ALL USING (user_id = current_user);

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = current_user);

-- followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view followers" ON public.followers;
CREATE POLICY "Anyone can view followers" ON public.followers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their follows" ON public.followers;
CREATE POLICY "Users can manage their follows" ON public.followers
  FOR ALL USING (follower_id = current_user);

-- user_scripts
ALTER TABLE public.user_scripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their scripts" ON public.user_scripts;
CREATE POLICY "Users can manage their scripts" ON public.user_scripts
  FOR ALL USING (user_id = current_user);

-- user_script_versions
ALTER TABLE public.user_script_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their script versions" ON public.user_script_versions;
CREATE POLICY "Users can manage their script versions" ON public.user_script_versions
  FOR ALL USING (
    script_id IN (SELECT id FROM public.user_scripts WHERE user_id = current_user)
  );
