'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LimitModal({ isOpen, onClose }: LimitModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header Gradient */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-10 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Daily Limit Reached
              </h2>
              
              <p className="text-zinc-400 mb-8 leading-relaxed">
                You've reached your daily limit of 50 AI generations. 
                Upgrade to a Pro plan to continue creating without limits.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Unlimited Generations</p>
                    <p className="text-[10px] text-zinc-500">No more daily resets or waiting.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/10"
                >
                  View Pricing Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 text-zinc-500 font-bold hover:text-white transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
