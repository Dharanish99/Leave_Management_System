import React, { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, leftIcon, required, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1.5">
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
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={cn(
              'w-full h-12 rounded-lg border bg-surface-card text-text-primary text-sm appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200',
              leftIcon ? 'pl-11' : 'pl-4',
              'pr-10', // Space for chevron
              error ? 'border-status-rejected ring-1 ring-status-rejected/20' : 'border-surface-border',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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
Select.displayName = 'Select';
