import { getSupabaseAdmin } from './supabase-server';
import crypto from 'crypto';

const BUCKET_NAME = 'code-snippets';
const LARGE_TEXT_THRESHOLD = 2000; // 2KB

/**
 * Skripted — Storage Archiver Utility
 * 
 * Offloads large text blobs to Supabase Storage to save Database space (500MB limit).
 * Supabase Storage provides 5GB free, which is 10x more than the DB.
 */
export class StorageArchiver {
  /**
   * Archives text to Storage if it exceeds the threshold.
   * Returns a reference string or the original text.
   */
  static async archiveIfLarge(text: string, pathPrefix: string = 'blobs'): Promise<string> {
    if (!text || text.length < LARGE_TEXT_THRESHOLD) return text;

    try {
      const supabase = getSupabaseAdmin();
      const hash = crypto.createHash('md5').update(text).digest('hex');
      const filename = `${pathPrefix}/${hash}.sk`;

      // Upload to Storage
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, text, {
          contentType: 'text/plain',
          upsert: true
        });

      if (error) {
        console.error('[Archiver] Upload failed:', error);
        return text; // Fallback to DB storage on error
      }

      return `__BLOB__:${filename}`;
    } catch (err) {
      console.error('[Archiver] Error:', err);
      return text;
    }
  }

  /**
   * Resolves a reference string back to the original text from Storage.
   */
  static async resolveText(ref: string): Promise<string> {
    if (!ref.startsWith('__BLOB__:')) return ref;

    try {
      const supabase = getSupabaseAdmin();
      const filename = ref.replace('__BLOB__:', '');

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filename);

      if (error || !data) {
        console.error('[Archiver] Download failed:', error);
        return '[Error: Blob not found]';
      }

      return await data.text();
    } catch (err) {
      console.error('[Archiver] Resolve error:', err);
      return '[Error: Storage resolve failure]';
    }
  }

  /**
   * Recursively scans an object (like Chat messages) and archives large strings.
   */
  static async archiveObject(obj: any): Promise<any> {
    if (typeof obj === 'string') {
      return await this.archiveIfLarge(obj);
    }
    
    if (Array.isArray(obj)) {
      return await Promise.all(obj.map(item => this.archiveObject(item)));
    }

    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = await this.archiveObject(value);
      }
      return newObj;
    }

    return obj;
  }

  /**
   * Recursively scans an object and hydrates __BLOB__ references.
   */
  static async hydrateObject(obj: any): Promise<any> {
    if (typeof obj === 'string') {
      return await this.resolveText(obj);
    }

    if (Array.isArray(obj)) {
      return await Promise.all(obj.map(item => this.hydrateObject(item)));
    }

    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = await this.hydrateObject(value);
      }
      return newObj;
    }

    return obj;
  }
}
