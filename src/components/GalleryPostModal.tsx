import React, { useState, useCallback, useRef } from 'react';
import { processImageForGallery } from '@/lib/image-processor';
import { uploadGalleryImage } from '@/lib/supabase-browser';
import { useAuth } from '@clerk/nextjs';
import { X, UploadCloud, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryPostModalProps {
  readonly code: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (postId: string) => void;
}

export default function GalleryPostModal({ code, isOpen, onClose, onSuccess }: GalleryPostModalProps) {
  const { userId, getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (images.length + newFiles.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Giriş yapmalısınız!');
      return;
    }
    if (title.length < 3) {
      toast.error('Başlık en az 3 karakter olmalıdır.');
      return;
    }

    setIsUploading(true);
    setProgress(5);
    setUploadStatus('Başlatılıyor...');

    try {
      const uploadedUrls: string[] = [];
      const token = await getToken({ template: 'supabase' });

      // Process and Upload Images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        setUploadStatus(`${i + 1}/${images.length} Görsel sıkıştırılıyor...`);
        const compressedFile = await processImageForGallery(file);
        
        setProgress(10 + Math.round((i / images.length) * 70));
        setUploadStatus(`${i + 1}/${images.length} Sunucuya yükleniyor...`);
        const url = await uploadGalleryImage(compressedFile, userId, token || '');
        uploadedUrls.push(url);
      }

      setProgress(85);
      setUploadStatus('Gönderi oluşturuluyor...');

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
        throw new Error(errData.error || 'Gönderi oluşturulurken hata oluştu');
      }

      const data = await res.json();
      setProgress(100);
      setUploadStatus('Başarılı!');
      toast.success('Skript başarıyla galeriye eklendi!');
      
      setTimeout(() => {
        setIsUploading(false);
        onClose();
        if (onSuccess) onSuccess(data.id);
      }, 800);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Beklenmedik bir hata oluştu');
      setIsUploading(false);
      setProgress(0);
      setUploadStatus('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f11] border border-white/[0.08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white">Galeriye Paylaş</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Başlık <span className="text-red-500/50">*</span></label>
            <input 
              type="text" 
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-zinc-600 transition-all"
              placeholder="Örn: Gelişmiş Ekonomi Sistemi"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Açıklama</label>
            <textarea 
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-zinc-600 min-h-[120px] resize-none transition-all"
              placeholder="Skriptin özellikleri, gereksinimleri ve kullanımı hakkında bilgi verin..."
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400 flex justify-between items-center">
              <span>Sunucu Görselleri</span>
              <span className={`text-xs ${images.length === 5 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {images.length} / 5
              </span>
            </label>
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all group ${
                isUploading ? 'opacity-50 cursor-not-allowed border-white/[0.05]' : 'border-white/[0.1] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] cursor-pointer'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-zinc-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">Görsel Seçmek İçin Tıklayın</p>
              <p className="text-[11px] text-zinc-500 mt-1">WebP, PNG, JPG (Maks 500KB - Otomatik Sıkıştırılır)</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-[calc(20%-8px)] aspect-square rounded-xl bg-black/50 border border-white/[0.05] overflow-hidden group shadow-lg">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
                    {!isUploading && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress / Status */}
          {isUploading && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  {uploadStatus}
                </span>
                <span className="text-xs font-bold text-emerald-500">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={isUploading || !title}
              className="btn-premium px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isUploading ? 'Paylaşılıyor...' : 'Galeriye Aktar'}
              {!isUploading && <CheckCircle2 size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
