import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, id, minRows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
            {required && <span className="text-status-rejected ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            required={required}
            rows={minRows}
            className={cn(
              'w-full p-4 rounded-lg border bg-surface-card text-text-primary placeholder:text-text-muted text-sm resize-y',
              'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200',
              error ? 'border-status-rejected ring-1 ring-status-rejected/20' : 'border-surface-border',
              className
            )}
            {...props}
          />
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
Textarea.displayName = 'Textarea';
