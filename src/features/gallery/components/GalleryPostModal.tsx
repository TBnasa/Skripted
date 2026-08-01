import React, { useState, useRef } from 'react';
import { GalleryClientService } from '@/services/client/gallery.client';
import { GalleryPostSchema } from '@/types/schemas';
import { useAuth } from '@clerk/nextjs';
import { X, UploadCloud, Loader2, CheckCircle2, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/useTranslation';
import { CATEGORY_IDS, CATEGORY_ICONS } from '@/features/gallery/data/gallery-categories';

interface GalleryPostModalProps {
  readonly code: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (postId: string) => void;
}

export default function GalleryPostModal({ code, isOpen, onClose, onSuccess }: GalleryPostModalProps) {
  const { t, mounted } = useTranslation();
  const { userId, getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (images.length + newFiles.length > 5) {
        toast.error(t('gallery.max_images_error'));
        return;
      }
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    toast.info(t('gallery.image_removed'));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/[^a-zA-Z0-9çğışüöÇĞİŞÜÖ]/g, '');
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags(prev => [...prev, val]);
        setTagInput('');
      } else if (tags.length >= 5) {
        toast.error(t('gallery.max_tags_error'));
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error(t('dashboard.please_login'));
      return;
    }

    // Client-side validation using Zod
    const validation = GalleryPostSchema.omit({ imageUrls: true }).safeParse({
      title,
      description: description || null,
      category,
      tags,
      codeSnippet: code,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsUploading(true);
    setProgress(5);
    setUploadStatus(t('gallery.upload_starting'));

    try {
      const token = await getToken({ template: 'supabase' });

      const data = await GalleryClientService.createPostWithImages(
        validation.data,
        images,
        userId,
        token || '',
        (newProgress: number, newStatus: string) => {
          setProgress(newProgress);
          // Use translation keys if matched
          if (newStatus === 'Starting upload...') setUploadStatus(t('gallery.upload_starting'));
          else if (newStatus.includes('Compressing')) setUploadStatus(newStatus.replace('Compressing image...', t('gallery.image_compressing')));
          else if (newStatus.includes('Uploading')) setUploadStatus(newStatus.replace('Uploading image...', t('gallery.image_uploading')));
          else if (newStatus === 'Creating post...') setUploadStatus(t('gallery.creating_post'));
          else if (newStatus === 'Success') setUploadStatus(t('general.success'));
          else setUploadStatus(newStatus);
        }
      );
      setProgress(100);
      setUploadStatus(t('general.success'));
      toast.success(t('gallery.post_success'));
      
      setTimeout(() => {
        setIsUploading(false);
        onClose();
        if (onSuccess) onSuccess(data.id);
      }, 800);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('general.error'));
      setIsUploading(false);
      setProgress(0);
      setUploadStatus('');
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] w-full max-w-lg rounded-xl ink-shadow-lg overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('gallery.modal.share_title')}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 hover:bg-[var(--color-accent-glow)] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t('gallery.modal.title_label')} <span className="text-[var(--color-accent-error)]/60">*</span></label>
            <input 
              type="text" 
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-active)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-all font-medium"
              placeholder={t('gallery.modal.title_label')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t('gallery.modal.category_label')}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-active)] text-[var(--color-text-primary)] transition-all appearance-none cursor-pointer"
              >
                {CATEGORY_IDS.map(id => (
                  <option key={id} value={id} className="bg-[var(--color-bg-elevated)]">{CATEGORY_ICONS[id]} {t(`gallery.categories.${id}`)}</option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t('gallery.modal.tags_label')}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="admin, chat..."
                  className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-active)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tags List */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent-glow)] border border-[var(--color-border-active)] rounded-lg text-[var(--color-accent-primary)] text-xs font-bold">
                  <Hash size={10} />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-[var(--color-text-primary)] transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t('gallery.modal.desc_label')}</label>
            <textarea 
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-active)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] min-h-[100px] resize-none transition-all text-sm leading-relaxed"
              placeholder={t('gallery.modal.desc_label')}
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between items-center">
              <span>{t('gallery.modal.server_images')}</span>
              <span className={`text-[10px] font-bold tracking-widest uppercase ${images.length === 5 ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                {images.length} / 5
              </span>
            </label>
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group ${
                isUploading ? 'opacity-50 cursor-not-allowed border-[var(--color-border)]' : 'border-[var(--color-border)] hover:border-[var(--color-border-active)] hover:bg-[var(--color-accent-glow)] cursor-pointer'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)]" />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-bold">{t('gallery.modal.drop_images')}</p>
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
              <div className="flex flex-wrap gap-2">
                {images.map((file, idx) => (
                  <div key={idx} className="relative w-[calc(25%-6px)] aspect-square rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] overflow-hidden group ink-shadow-sm">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
                    {!isUploading && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center text-[var(--color-text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--color-border)] hover:bg-[var(--color-accent-error)] hover:text-[var(--color-bg-primary)]"
                      >
                        <X size={10} />
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
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-primary)] flex items-center gap-2 tracking-widest">
                  <Loader2 size={12} className="animate-spin" />
                  {uploadStatus}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden border border-[var(--color-border)]">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-30"
            >
              {t('general.cancel')}
            </button>
            <button 
              type="submit"
              disabled={isUploading || !title}
              className="btn-forge px-8 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? t('gallery.sharing') : t('gallery.share_now')}
              {!isUploading && <CheckCircle2 size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
