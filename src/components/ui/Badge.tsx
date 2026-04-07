import { cn } from '../../lib/utils';

export interface BadgeProps {
  variant?: 'pending' | 'approved' | 'rejected' | 'hod_approved' | 'cancelled' | 'info';
  children?: React.ReactNode;
  className?: string;
  roleBadge?: boolean;
}

const STATUS_CONFIG: Record<string, any> = {
  pending:      { dot: '#F59E0B', text: 'Pending',       bg: '#FFFBEB', color: '#92400E' },
  approved:     { dot: '#059669', text: 'Approved',      bg: '#ECFDF5', color: '#065F46' },
  rejected:     { dot: '#DC2626', text: 'Rejected',      bg: '#FEF2F2', color: '#991B1B' },
  hod_approved: { dot: '#E8630A', text: 'HoD Approved',  bg: '#FFF0E6', color: '#7C3500' },
  cancelled:    { dot: '#9CA3AF', text: 'Cancelled',     bg: '#F9FAFB', color: '#4B5563' },
  info:         { dot: '#E8630A', text: 'Info',          bg: '#FAFAF7', color: '#2E2E28' },
};

export function Badge({ variant = 'info', children, className, roleBadge }: BadgeProps) {
  if (roleBadge) {
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap', className)}>
        {children}
      </span>
    );
  }

  const config = STATUS_CONFIG[variant] || STATUS_CONFIG.info;

  return (
    <span 
      className={className}
      style={{ 
        background: config.bg, 
        color: config.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: config.dot,
        flexShrink: 0,
        display: 'inline-block'
      }} />
      {children || config.text}
    </span>
  );
}
