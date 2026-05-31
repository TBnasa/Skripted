'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Shield, Sparkles, Globe, MessageSquare, Database } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

export default function PricingPage() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const features = [
    { icon: Zap, label: t('pricing.usage_limit') },
    { icon: Globe, label: t('pricing.feature_gallery') },
    { icon: MessageSquare, label: t('pricing.feature_support') },
    { icon: Sparkles, label: t('pricing.feature_model') },
    { icon: Database, label: t('pricing.feature_cloud') },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white"
          >
            {t('pricing.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        {/* Pricing Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          <motion.div 
            variants={itemVariants}
            className="relative group w-full max-w-md"
          >

            
            <div className="relative flex flex-col bg-[var(--color-bg-secondary)] border border-white/10 rounded-2xl p-8 h-full shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-white">{t('pricing.free_starter')}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[var(--color-accent-primary)]">{t('pricing.free_price')}</span>
                    <span className="text-zinc-500 font-medium">{t('pricing.free_period')}</span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-accent-primary)]/10 rounded-2xl border border-[var(--color-accent-primary)]/20">
                  <Shield className="w-6 h-6 text-[var(--color-accent-primary)]" />
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-zinc-300">
                    <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20">
                      <Check className="w-3 h-3 text-[var(--color-accent-primary)]" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled
                className="w-full py-4 px-6 rounded-2xl bg-[var(--color-bg-tertiary)] text-zinc-400 font-bold border border-white/5 cursor-not-allowed transition-all"
              >
                {t('pricing.current_plan')}
              </button>
            </div>
          </motion.div>

          {/* Pro Card (Locked/Transparent) */}
          <motion.div 
            variants={itemVariants}
            className="relative group w-full max-w-md hidden md:block opacity-40 hover:opacity-70 transition-all duration-500"
          >
            <div className="relative flex flex-col bg-[var(--color-bg-secondary)]/50 border border-white/5 rounded-2xl p-8 h-full">
              <div className="absolute top-6 right-6 px-3 py-1 bg-[var(--color-accent-primary)]/15 rounded-full border border-[var(--color-accent-primary)]/25">
                <span className="text-[10px] font-black uppercase text-[var(--color-accent-primary)] tracking-widest">{t('pricing.coming_soon')}</span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-1 text-zinc-400">Pro Power</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-600">$19.99</span>
                  <span className="text-zinc-700 font-medium">{t('pricing.free_period')}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {[1, 2, 3, 4, 5].map((_, idx) => (
                  <div key={idx} className="h-4 shimmer-bg rounded-lg w-full"></div>
                ))}
              </div>

              <button className="w-full py-4 px-6 rounded-2xl bg-[var(--color-accent-primary)] text-black font-bold transition-all">
                {t('pricing.upgrade')}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 pt-10 border-t border-white/5 text-center"
        >
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            {t('status.legal_disclaimer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
