import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className, glass = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "corner-ticks rounded-xl border border-[var(--color-border)] p-6",
        glass ? "glass-panel" : "bg-[var(--color-bg-elevated)]",
        className
      )}
      {...props}
    />
  );
}
