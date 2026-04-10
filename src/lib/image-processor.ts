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
