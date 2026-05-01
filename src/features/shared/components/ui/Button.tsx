import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/5",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
    premium: "btn-premium btn-primary",
    outline: "bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-2xl",
    icon: "p-2 rounded-xl"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
