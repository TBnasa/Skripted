# SQL Migration & Database Optimization

Based on the suggestions in `öneri.md`, the following indices and optimizations should be applied to the Supabase database.

## 🚀 DB Indexing

To improve query performance for gallery searches and user-specific views:

```sql
-- Gallery Posts indexing for performance
CREATE INDEX IF NOT EXISTS idx_gallery_posts_is_public ON gallery_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_user_id ON gallery_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_category ON gallery_posts(category);
CREATE INDEX IF NOT EXISTS idx_gallery_posts_created_at ON gallery_posts(created_at DESC);

-- Compound index for filtered gallery views
CREATE INDEX IF NOT EXISTS idx_gallery_posts_public_category_date 
ON gallery_posts(is_public, category, created_at DESC);

-- Comments indexing
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- Likes indexing
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id);
```

## 🛡️ Security

Ensure that Row Level Security (RLS) is correctly set for all tables. The current application assumes these tables exist:

- `gallery_posts`
- `post_comments`
- `post_likes`
- `user_scripts`
- `user_script_versions`

## 📈 Aggregation

The `downloads_count` is updated via an RPC. Ensure this function is defined:

```sql
CREATE OR REPLACE FUNCTION increment_download_count(post_id_to_increment UUID)
RETURNS void AS $$
BEGIN
  UPDATE gallery_posts
  SET downloads_count = downloads_count + 1
  WHERE id = post_id_to_increment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
