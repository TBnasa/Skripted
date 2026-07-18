import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'zinc' | 'red' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-[var(--color-text-secondary)] border-[var(--color-border)]",
    zinc: "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] border-[var(--color-border-hover)]",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    outline: "bg-transparent border-[var(--color-border-hover)] text-text-secondary"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
