import { getSupabaseAdmin } from '@/lib/supabase-server';
import { 
  GalleryPostSchema, 
  GalleryPostInput, 
  GalleryCommentSchema, 
  GalleryCommentInput,
  GalleryFilterOptions 
} from '@/types/schemas';
import { stripHtmlTags } from '@/lib/utils/sanitize';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Custom error class for Gallery Service operations to provide better error context.
 */
class GalleryServiceError extends Error {
  constructor(message: string, public originalError?: PostgrestError | Error) {
    super(message);
    this.name = 'GalleryServiceError';
  }
}

/**
 * GalleryService handles all server-side operations for the gallery, 
 * including posts, comments, likes, and downloads.
 * 
 * Architecture: Clean Service Pattern with static orchestration.
 */
export class GalleryService {
  private static readonly supabase = getSupabaseAdmin();
  private static readonly TABLE_POSTS = 'gallery_posts';
  private static readonly TABLE_COMMENTS = 'post_comments';
  private static readonly TABLE_LIKES = 'post_likes';

  /**
   * Retrieves a list of gallery posts based on filter options.
   */
  static async getPosts(options: GalleryFilterOptions) {
    const { limit = 50, filter, category, userId } = options;

    let query = this.supabase
      .from(this.TABLE_POSTS)
      .select('id, user_id, author_name, title, description, image_urls, likes_count, downloads_count, created_at, is_public, category, tags');

    if (filter === 'mine') {
      if (!userId) throw new GalleryServiceError('User ID is required for filtered view');
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

    if (error) throw new GalleryServiceError('Failed to fetch gallery posts', error);
    return data;
  }

  /**
   * Retrieves a single post by its unique identifier.
   */
  static async getPostById(id: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_POSTS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new GalleryServiceError(`Post not found: ${id}`, error);
    return data;
  }

  /**
   * Creates a new gallery post after validating and sanitizing input.
   */
  static async createPost(userId: string, authorName: string, postData: GalleryPostInput) {
    const validated = this.validateData(GalleryPostSchema, postData);
    const sanitized = this.sanitizePostData(validated);

    const { data, error } = await this.supabase
      .from(this.TABLE_POSTS)
      .insert({
        ...sanitized,
        user_id: userId,
        author_name: authorName,
        is_public: true,
      })
      .select('id')
      .single();

    if (error) throw new GalleryServiceError('Failed to create gallery post', error);
    return data;
  }

  /**
   * Updates an existing post, verifying ownership and re-validating data.
   */
  static async updatePost(id: string, userId: string, updateData: Partial<GalleryPostInput>) {
    const validated = this.validateData(GalleryPostSchema.partial(), updateData);
    
    // Ownership check (Security boundary)
    const post = await this.getPostById(id);
    if (post.user_id !== userId) throw new GalleryServiceError('Unauthorized: Ownership required');

    const sanitized = this.sanitizePostData(validated as Partial<GalleryPostInput>);

    const { data, error } = await this.supabase
      .from(this.TABLE_POSTS)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new GalleryServiceError('Failed to update gallery post', error);
    return data;
  }

  /**
   * Deletes a post, verifying ownership before execution.
   */
  static async deletePost(id: string, userId: string) {
    const post = await this.getPostById(id);
    if (post.user_id !== userId) throw new GalleryServiceError('Unauthorized: Ownership required');

    const { error } = await this.supabase
      .from(this.TABLE_POSTS)
      .delete()
      .eq('id', id);

    if (error) throw new GalleryServiceError('Failed to delete gallery post', error);
    return { success: true };
  }

  /**
   * Toggles a user's like status on a post.
   * Optimized to minimize database round-trips where possible.
   */
  static async toggleLike(postId: string, userId: string) {
    const { data: existingLike, error: selectError } = await this.supabase
      .from(this.TABLE_LIKES)
      .select('id')
      .match({ post_id: postId, user_id: userId })
      .maybeSingle();

    if (selectError) throw new GalleryServiceError('Error checking like status', selectError);

    if (existingLike) {
      const { error: deleteError } = await this.supabase
        .from(this.TABLE_LIKES)
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (deleteError) throw new GalleryServiceError('Failed to remove like', deleteError);
      return { success: true, action: 'unliked' };
    }

    const { error: insertError } = await this.supabase
      .from(this.TABLE_LIKES)
      .insert({ post_id: postId, user_id: userId });

    if (insertError) throw new GalleryServiceError('Failed to add like', insertError);
    return { success: true, action: 'liked' };
  }

  /**
   * Atomically increments the download counter for a post via RPC.
   */
  static async incrementDownload(postId: string) {
    const { error } = await this.supabase.rpc('increment_download_count', {
      post_id_to_increment: postId,
    });

    if (error) throw new GalleryServiceError('Failed to increment download count', error);
    return { success: true };
  }

  /**
   * Retrieves comments for a specific post.
   */
  static async getComments(postId: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_COMMENTS)
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw new GalleryServiceError('Failed to fetch comments', error);
    return data;
  }

  /**
   * Adds a comment to a post with validation and sanitization.
   */
  static async addComment(postId: string, userId: string, authorName: string, commentData: GalleryCommentInput) {
    const validated = this.validateData(GalleryCommentSchema, commentData);
    const sanitizedContent = stripHtmlTags(validated.content);

    const { data, error } = await this.supabase
      .from(this.TABLE_COMMENTS)
      .insert({
        post_id: postId,
        user_id: userId,
        author_name: authorName,
        content: sanitizedContent,
        parent_id: validated.parentId ?? null,
      })
      .select()
      .single();

    if (error) throw new GalleryServiceError('Failed to add comment', error);
    return data;
  }

  /**
   * Private helper to validate data against a schema.
   */
  private static validateData<T>(schema: { safeParse: (data: unknown) => { success: boolean, data?: T, error?: any } }, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new GalleryServiceError(`Validation failed: ${result.error.message}`);
    }
    return result.data as T;
  }

  /**
   * Private helper to sanitize post data fields.
   */
  private static sanitizePostData(data: Partial<GalleryPostInput>): Partial<GalleryPostInput> {
    const sanitized = { ...data };
    if (sanitized.title) sanitized.title = stripHtmlTags(sanitized.title);
    if (sanitized.description) sanitized.description = stripHtmlTags(sanitized.description);
    return sanitized;
  }
}

