'use client';

import React, { useState } from 'react';
import { Camera, X, Loader2, User, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/useTranslation';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    username: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  };
  onUpdate: (newData: any) => void;
}

export default function ProfileEditModal({ isOpen, onClose, initialData, onUpdate }: ProfileEditModalProps) {
  const { t, mounted } = useTranslation();
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUpdate(data);
      toast.success(t('profile.updated'));
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <User size={20} className="text-emerald-500" />
                  {t('profile.edit_profile')}
               </h2>
               <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               {/* Avatar Upload Placeholder */}
               <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                     <div className="w-24 h-24 rounded-[2rem] bg-[#121214] border border-white/10 flex items-center justify-center overflow-hidden">
                        {formData.avatar_url ? (
                           <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <User size={40} className="text-zinc-700" />
                        )}
                     </div>
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2rem] cursor-pointer">
                        <Camera size={24} className="text-white" />
                     </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder={t('profile.avatar_url_placeholder')} 
                    value={formData.avatar_url || ''}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    className="text-[10px] w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 focus:outline-none text-zinc-500 font-mono text-center"
                  />
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('profile.username_label')}</label>
                     <div className="relative">
                        <input 
                           type="text"
                           value={formData.username}
                           onChange={(e) => setFormData({...formData, username: e.target.value})}
                           className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                        />
                        <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('profile.fullname_label')}</label>
                     <input 
                        type="text"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                        placeholder={t('profile.fullname_placeholder')}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('profile.bio_label')}</label>
                     <textarea 
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all min-h-[100px] resize-none font-medium italic"
                        placeholder={t('profile.bio_placeholder')}
                     />
                  </div>
               </div>

               <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {t('general.save_changes').toUpperCase()}
               </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
