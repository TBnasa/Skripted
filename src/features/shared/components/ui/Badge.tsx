import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'zinc' | 'red' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
    zinc: "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border-[var(--color-border-active)]",
    red: "bg-[var(--color-accent-error)]/10 text-[var(--color-accent-error)] border-[var(--color-accent-error)]/30",
    outline: "bg-transparent border-[var(--color-border-hover)] text-[var(--color-text-secondary)]"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
