import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Upload an image to the 'gallery-images' bucket
 */
export async function uploadGalleryImage(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}.webp`;

  const { data, error } = await supabase.storage
    .from('gallery-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/webp'
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(error.message);
  }

  const { data: publicData } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}
