'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

const tiers = [
  {
    key: 'starter',
    titleKey: 'free_starter',
    priceKey: 'free_price',
    descKey: 'starter_desc',
    periodKey: 'starter_period',
    ctaKey: 'current_plan',
    features: ['usage_limit', 'feature_gallery', 'feature_support', 'feature_model', 'feature_cloud'],
    disabled: true,
  },
  {
    key: 'pro',
    titleKey: 'pro_title',
    priceKey: 'pro_price',
    descKey: 'pro_desc',
    periodKey: 'pro_period',
    ctaKey: 'pro_cta',
    features: ['pro_feature1', 'pro_feature2', 'pro_feature3', 'pro_feature4', 'pro_feature5', 'pro_feature6'],
    recommended: true,
  },
  {
    key: 'business',
    titleKey: 'business_title',
    priceKey: 'business_price',
    descKey: 'business_desc',
    periodKey: 'business_period',
    ctaKey: 'business_cta',
    features: ['business_feature1', 'business_feature2', 'business_feature3', 'business_feature4', 'business_feature5', 'business_feature6', 'business_feature7'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-[var(--color-bg-primary)] pt-32 pb-20 px-6">
      <div className="absolute inset-0 line-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white"
          >
            {t('pricing.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.key}
              variants={cardVariants}
              className={`relative flex flex-col rounded-2xl p-8 h-full transition-all duration-300 ${
                tier.recommended
                  ? 'bg-[var(--color-bg-secondary)] border-2 border-[var(--color-accent-primary)]/40 shadow-[0_0_32px_-8px_rgba(0,224,158,0.15)] md:scale-[1.02]'
                  : 'bg-[var(--color-bg-secondary)] border border-white/6'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap">
                    {t('pricing.recommended')}
                  </div>
                </div>
              )}

              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {t(`pricing.${tier.titleKey}`)}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  {t(`pricing.${tier.descKey}`)}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-black ${
                      tier.key === 'starter'
                        ? 'text-[var(--color-accent-primary)]'
                        : 'text-white'
                    }`}
                  >
                    {t(`pricing.${tier.priceKey}`)}
                  </span>
                  <span className="text-[var(--color-text-muted)] font-medium text-sm">
                    {t(`pricing.${tier.periodKey}`)}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 mb-10 flex-grow">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20">
                      <Check className="w-3 h-3 text-[var(--color-accent-primary)]" />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {t(`pricing.${feature}`)}
                    </span>
                  </div>
                ))}
              </div>

              {tier.disabled ? (
                <button
                  disabled
                  className="w-full py-4 px-6 rounded-2xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] font-bold border border-white/5 cursor-not-allowed transition-all"
                >
                  {t(`pricing.${tier.ctaKey}`)}
                </button>
              ) : (
                <button
                  className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-250 active:scale-[0.97] ${
                    tier.recommended
                      ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] shadow-[0_0_20px_rgba(0,224,158,0.15)] hover:brightness-110 hover:shadow-[0_0_28px_rgba(0,224,158,0.25)]'
                      : 'border border-white/10 text-[var(--color-text-secondary)] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {t(`pricing.${tier.ctaKey}`)}
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 pt-10 border-t border-white/5 text-center"
        >
          <p className="text-[var(--color-text-muted)] text-sm max-w-xl mx-auto leading-relaxed">
            {t('status.legal_disclaimer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
