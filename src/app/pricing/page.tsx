'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '@/features/shared/components/ui/Button';

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
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-4xl md:text-5xl font-black tracking-tight mb-4 text-[var(--color-text-primary)]"
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

          {/* spec index strip */}
          <div className="mx-auto mt-8 flex w-fit items-center gap-4 border-y border-dashed border-[var(--color-border)] py-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent-primary)]">
              Pricing Spec
            </span>
            <span className="h-px w-10 bg-[var(--color-border)]" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Sheet 01/01 · Rev 2.1 · 3 Tiers
            </span>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start"
        >
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.key}
              variants={cardVariants}
              className={`relative flex flex-col overflow-hidden rounded-xl transition-all duration-300 ${
                tier.recommended
                  ? 'border-2 border-[var(--color-accent-primary)]/40 bg-[var(--color-bg-secondary)] ink-shadow md:scale-[1.02]'
                  : 'border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ink-shadow-sm'
              }`}
            >
              {/* sheet header strip */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-5 py-2.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                  Tier 0{idx + 1} · Spec
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1 w-1 rounded-full ${tier.recommended ? 'bg-[var(--color-accent-primary)] animate-subtle-pulse' : 'bg-[var(--color-text-muted)]'}`} />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                    {t(`pricing.${tier.titleKey}`)}
                  </span>
                </span>
              </div>

              {tier.recommended && (
                <span className="stamp absolute right-4 top-14 z-10 hidden md:inline-block">Recommended Rev</span>
              )}

              <div className="p-8">
                <div className="mb-6">
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    {t(`pricing.${tier.descKey}`)}
                  </p>
                  <div className="flex items-baseline gap-1 border-b border-dashed border-[var(--color-border)] pb-4">
                    <span
                      className={`font-mono text-4xl font-black tabular-nums ${
                        tier.key === 'starter'
                          ? 'text-[var(--color-accent-primary)]'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {t(`pricing.${tier.priceKey}`)}
                    </span>
                    <span className="text-[var(--color-text-muted)] font-medium text-sm">
                      {t(`pricing.${tier.periodKey}`)}
                    </span>
                  </div>
                </div>

                <div className="space-y-0 mb-8">
                  {tier.features.map((feature, fidx) => (
                    <div
                      key={fidx}
                      className={`flex items-start gap-3 py-3 ${
                        fidx === tier.features.length - 1 ? '' : 'border-b border-dashed border-[var(--color-border)]'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-lg bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20">
                        <Check className="w-3 h-3 text-[var(--color-accent-primary)]" />
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {t(`pricing.${feature}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {tier.disabled ? (
                  <Button disabled variant="secondary" className="w-full py-4 text-sm cursor-not-allowed">
                    {t(`pricing.${tier.ctaKey}`)}
                  </Button>
                ) : (
                  <Button
                    variant={tier.recommended ? 'primary' : 'outline'}
                    size="lg"
                    className={`w-full py-4 text-sm ${
                      tier.recommended
                        ? 'ink-shadow-sm hover:brightness-110 hover:ink-shadow'
                        : ''
                    }`}
                  >
                    {t(`pricing.${tier.ctaKey}`)}
                  </Button>
                )}
              </div>

              {/* title block */}
              <div className="flex items-stretch border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                <span className="border-r border-[var(--color-border)] px-3 py-2">Dwg: Plan-0{idx + 1}</span>
                <span className="ml-auto px-3 py-2 text-[var(--color-accent-primary)]">Rev 2.1</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 pt-10 border-t border-[var(--color-border)] text-center"
        >
          <p className="text-[var(--color-text-muted)] text-sm max-w-xl mx-auto leading-relaxed">
            {t('status.legal_disclaimer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
