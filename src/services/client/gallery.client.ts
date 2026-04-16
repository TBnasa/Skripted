import { createClerkClient, uploadGalleryImage } from '@/lib/supabase-browser';
import { processImageForGallery } from '@/lib/image-processor';
import { GalleryPostInput, GalleryCommentInput } from '@/types/schemas/gallery';

export class GalleryClientService {
  /**
   * Fetches all gallery posts with optional filters.
   */
  static async getPosts(params: { limit?: number; filter?: string; category?: string } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.filter) query.set('filter', params.filter);
    if (params.category && params.category !== 'All') query.set('category', params.category);

    const res = await fetch(`/api/gallery?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  }

  /**
   * Fetches a single post by ID.
   */
  static async getPost(id: string) {
    const res = await fetch(`/api/gallery/${id}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return await res.json();
  }

  /**
   * Checks if a post is liked by the current user.
   */
  static async checkLikeStatus(postId: string, userId: string, token: string): Promise<boolean> {
    const supabase = createClerkClient(token);
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking like status:', error);
      return false;
    }
    return !!data;
  }

  /**
   * Fetches comments for a post.
   */
  static async getComments(postId: string) {
    const res = await fetch(`/api/gallery/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return await res.json();
  }

  /**
   * Submits a new comment for a post.
   */
  static async submitComment(postId: string, commentData: GalleryCommentInput) {
    const res = await fetch(`/api/gallery/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit comment');
    return data;
  }

  /**
   * Toggles the like status of a post.
   */
  static async toggleLike(postId: string) {
    const res = await fetch(`/api/gallery/${postId}/like`, { method: 'POST' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle like');
    return result;
  }

  /**
   * Increments download count.
   */
  static async incrementDownload(postId: string) {
    try {
      const res = await fetch(`/api/gallery/${postId}/download`, { method: 'POST' });
      return res.ok;
    } catch (error) {
      console.error('Failed to increment download count:', error);
      return false;
    }
  }

  /**
   * Triggers file download in the browser.
   */
  static triggerFileDownload(codeSnippet: string, title: string) {
    const blob = new Blob([codeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sk`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Translates the post description.
   */
  static async translateDescription(text: string, targetLang: string) {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed');
    return data.translation;
  }

  /**
   * Updates an existing post.
   */
  static async updatePost(postId: string, updateData: Partial<GalleryPostInput>) {
    const res = await fetch(`/api/gallery/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  }

  /**
   * Deletes a post.
   */
  static async deletePost(postId: string) {
    const res = await fetch(`/api/gallery/${postId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return true;
  }

  /**
   * Uploads images and creates a new post.
   */
  static async createPostWithImages(
    data: Omit<GalleryPostInput, 'imageUrls'>,
    images: File[],
    userId: string,
    token: string,
    onProgress: (progress: number, status: string) => void
  ) {
    onProgress(5, 'Starting upload...');
    const uploadedUrls: string[] = [];

    // Process and Upload Images
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      onProgress(10 + Math.round((i / images.length) * 35), `${i + 1}/${images.length} Compressing image...`);
      const compressedFile = await processImageForGallery(file);
      
      onProgress(45 + Math.round((i / images.length) * 35), `${i + 1}/${images.length} Uploading image...`);
      const url = await uploadGalleryImage(compressedFile, userId, token);
      uploadedUrls.push(url);
    }

    onProgress(85, 'Creating post...');

    // Submit Post
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        imageUrls: uploadedUrls,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Post creation failed');
    }

    onProgress(100, 'Success');
    return await res.json();
  }
}
