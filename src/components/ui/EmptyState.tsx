import type { ReactNode, ComponentType } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center animate-fade-in', className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center mb-4 text-text-muted">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
