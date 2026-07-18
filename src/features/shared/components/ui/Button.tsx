import React from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: 'button';
}

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as: 'a';
}

type PolymorphicButtonProps = ButtonProps | LinkButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-secondary)] shadow-[0_0_20px_rgba(255,255,255,0.08)]',
  secondary:
    'bg-white/5 text-white hover:bg-white/10 border border-[var(--color-border)]',
  ghost:
    'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5',
  outline:
    'bg-transparent border border-[var(--color-border-hover)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border-active)]',
  danger:
    'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  icon: 'p-2 rounded-xl',
};

export function Button(props: PolymorphicButtonProps) {
  const {
    className,
    variant = 'primary',
    size = 'md',
    as,
    ...rest
  } = props;

  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (as === 'a') {
    const { ...anchorProps } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a className={classes} {...anchorProps} />;
  }

  const { ...buttonProps } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return <button className={classes} {...buttonProps} />;
}
