import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-in-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-ember-500 hover:bg-ember-600 text-white shadow-ember border border-transparent',
      secondary: 'bg-warm-50 text-ink-900 border border-warm-300 hover:bg-warm-100 hover:text-ember-600',
      ghost: 'bg-transparent text-warm-600 hover:bg-warm-100 hover:text-ink-900',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
