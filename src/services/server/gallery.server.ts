import { getSupabaseAdmin } from '@/lib/supabase-server';
import { 
  GalleryPostSchema, 
  GalleryPostInput, 
  GalleryCommentSchema, 
  GalleryCommentInput,
  GalleryFilterOptions 
} from '@/types/schemas';
import { sanitizeHtml } from '@/lib/utils/sanitize';

export class GalleryService {
  private static supabase = getSupabaseAdmin();

  static async getPosts(options: GalleryFilterOptions) {
    const { limit = 50, filter, category, userId } = options;

    let query = this.supabase
      .from('gallery_posts')
      .select('id, user_id, author_name, title, description, image_urls, likes_count, downloads_count, created_at, is_public, category, tags');

    if (filter === 'mine') {
      if (!userId) {
        throw new Error('User ID is required for filtered view');
      }
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getPostById(id: string) {
    const { data, error } = await this.supabase
      .from('gallery_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createPost(userId: string, authorName: string, postData: GalleryPostInput) {
    const result = GalleryPostSchema.safeParse(postData);
    if (!result.success) {
      throw new Error(`Invalid post data: ${result.error.message}`);
    }

    const { title, description, codeSnippet, imageUrls, category, tags } = result.data;

    // Sanitize input
    const sanitizedTitle = stripHtmlTags(title);
    const sanitizedDescription = description ? stripHtmlTags(description) : null;

    const { data, error } = await this.supabase
      .from('gallery_posts')
      .insert({
        user_id: userId,
        author_name: authorName,
        title: sanitizedTitle,
        description: sanitizedDescription,
        code_snippet: codeSnippet,
        image_urls: imageUrls || [],
        category: category || 'Other',
        tags: tags || [],
        is_public: true,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePost(id: string, userId: string, updateData: Partial<GalleryPostInput>) {
    const validation = GalleryPostSchema.partial().safeParse(updateData);
    if (!validation.success) {
      throw new Error(`Invalid update data: ${validation.error.message}`);
    }

    // Check ownership
    const post = await this.getPostById(id);
    if (post.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Sanitize if present
    if (validation.data.title) {
      validation.data.title = stripHtmlTags(validation.data.title);
    }
    if (validation.data.description) {
      validation.data.description = stripHtmlTags(validation.data.description);
    }

    const { data, error } = await this.supabase
      .from('gallery_posts')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePost(id: string, userId: string) {
    const post = await this.getPostById(id);
    if (post.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { error } = await this.supabase
      .from('gallery_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  static async toggleLike(postId: string, userId: string) {
    const { data: existingLike, error: selectError } = await this.supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingLike) {
      const { error: deleteError } = await this.supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      return { success: true, action: 'unliked' };
    } else {
      const { error: insertError } = await this.supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) throw insertError;
      return { success: true, action: 'liked' };
    }
  }

  static async incrementDownload(postId: string) {
    const { error } = await this.supabase.rpc('increment_download_count', {
      post_id_to_increment: postId,
    });

    if (error) throw error;
    return { success: true };
  }

  static async getComments(postId: string) {
    const { data, error } = await this.supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async addComment(postId: string, userId: string, authorName: string, commentData: GalleryCommentInput) {
    const result = GalleryCommentSchema.safeParse(commentData);
    if (!result.success) {
      throw new Error(`Invalid comment data: ${result.error.message}`);
    }

    const { content, parentId } = result.data;
    const sanitizedContent = stripHtmlTags(content);

    const { data, error } = await this.supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        author_name: authorName,
        content: sanitizedContent,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}
