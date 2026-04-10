import React, { useState, useCallback, useRef } from 'react';
import { processImageForGallery } from '@/lib/image-processor';
import { uploadGalleryImage } from '@/lib/supabase-browser';
import { useAuth } from '@clerk/nextjs';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

interface GalleryPostModalProps {
  readonly code: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (postId: string) => void;
}

export default function GalleryPostModal({ code, isOpen, onClose, onSuccess }: GalleryPostModalProps) {
  const { userId } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setImages(prev => [...prev, ...newFiles].slice(0, 5)); // max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to post.');
      return;
    }
    if (title.length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      // Process and Upload Images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        setProgress(10 + Math.round((i / images.length) * 40)); // 10-50% for processing
        const compressedFile = await processImageForGallery(file);
        
        setProgress(50 + Math.round((i / images.length) * 40)); // 50-90% for uploading
        const url = await uploadGalleryImage(compressedFile, userId);
        uploadedUrls.push(url);
      }

      setProgress(95);

      // Submit Post
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          codeSnippet: code,
          imageUrls: uploadedUrls,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create post');
      }

      const data = await res.json();
      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        onClose();
        if (onSuccess) onSuccess(data.id);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setIsUploading(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f11] border border-white/[0.08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white">Share to Gallery</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Title <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-zinc-600 transition-colors"
              placeholder="e.g., Advanced Economy System"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea 
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-zinc-600 min-h-[100px] resize-y transition-colors"
              placeholder="Explain how it works, commands, permissions..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex justify-between">
              <span>Server Screenshots</span>
              <span className="text-zinc-500 text-xs">{images.length} / 5</span>
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/[0.1] hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 mb-2 transition-colors" />
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">Click to upload images</p>
              <p className="text-xs text-zinc-600 mt-1">WebP, PNG, JPG (Max 500KB auto-compressed)</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg bg-black/50 border border-white/[0.1] overflow-hidden group">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full opacity-80" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 m-auto w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isUploading || !title}
              className="relative px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 overflow-hidden"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Share to Gallery'
              )}
              
              {/* Progress bar overlay inside button */}
              {isUploading && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
