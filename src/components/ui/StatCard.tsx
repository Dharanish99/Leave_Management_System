import type { ComponentType } from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'accent' | 'emerald' | 'amber' | 'blue' | 'rose';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'accent',
  className,
}: StatCardProps) {
  const accent = color === 'accent';

  return (
    <div className={cn("bg-warm-100 rounded-xl p-5 border border-warm-300 shadow-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="table-header text-warm-600 mb-2">{title}</p>
          <p className={accent ? 'stat-number-accent' : 'stat-number'}>
            {value}
          </p>
          {trend && trendValue && (
            <p className="text-xs text-warm-600 mt-1.5">
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? 'bg-ember-50' : 'bg-warm-200'}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-ember-500' : 'text-warm-800'}`} />
        </div>
      </div>
    </div>
  );
}
