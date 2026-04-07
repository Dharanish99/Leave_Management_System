import React, { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, required, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
            {required && <span className="text-status-rejected ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              'w-full h-12 rounded-lg border bg-surface-card text-text-primary placeholder:text-text-muted text-sm',
              'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              error ? 'border-status-rejected ring-1 ring-status-rejected/20' : 'border-surface-border',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-status-rejected flex items-center gap-1 animate-fade-in">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
