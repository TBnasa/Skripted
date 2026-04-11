import imageCompression from 'browser-image-compression';

/**
 * Compresses an image to a WebP format under 500KB with a max dimension of 1920px.
 */
export async function processImageForGallery(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob to File, keeping the original name but modifying the extension
    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    
    return new File([compressedBlob], newName, {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
}

/**
 * PLACEHOLDER: Uploads an image to an external provider (e.g., Cloudinary, Imgur, AWS S3).
 * To finalize this:
 * 1. Create a Cloudinary account and get your Cloud Name, API Key, and Upload Preset.
 * 2. Add these to your .env.local file.
 * 3. Use the Cloudinary Upload API (POST to https://api.cloudinary.com/v1_1/[cloud_name]/image/upload).
 */
export async function uploadToExternalProvider(file: File): Promise<string> {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('Cloudinary credentials missing, using internal storage fallback.');
    throw new Error('EXTERNAL_PROVIDER_NOT_CONFIGURED');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Cloudinary upload failed');
    
    const data = await response.json();
    console.log('Successfully uploaded to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error in external provider upload:', error);
    throw error;
  }
}
