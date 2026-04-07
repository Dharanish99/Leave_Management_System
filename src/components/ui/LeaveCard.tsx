import type { LeaveApplication } from '../../types';
import { formatDate } from '../../lib/utils';
import { LEAVE_TYPES } from '../../lib/constants';
import { BASE_URL } from '../../lib/api';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Paperclip } from 'lucide-react';

export interface LeaveCardProps {
  leave: LeaveApplication;
  actions?: React.ReactNode;
}

export function LeaveCard({ leave, actions }: LeaveCardProps) {
  const typeLabel = LEAVE_TYPES[leave.leaveType]?.label || 'Leave';

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={leave.applicantName} size="md" />
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{leave.applicantName}</h4>
            <p className="text-xs text-text-muted">
              {leave.applicantRole === 'student' ? 'Student' : 'Staff'} • {leave.department}
            </p>
          </div>
        </div>
        <Badge variant={leave.status}>{leave.status.replace('_', ' ')}</Badge>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-text-primary mb-1">
          {typeLabel} • {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
        </div>
        <div className="text-xs text-text-secondary">
          {formatDate(leave.fromDate)} 
          {leave.fromDate !== leave.toDate && ` - ${formatDate(leave.toDate)}`}
        </div>
      </div>

      <div className="bg-surface-muted rounded p-3 mb-4">
        <p className="text-sm text-text-secondary line-clamp-2" title={leave.reason}>
          "{leave.reason}"
        </p>
        
        {leave.attachmentUrl && (
          <div className="mt-2 pt-2 border-t border-surface-border/50">
            <a 
              href={`${BASE_URL.replace('/api', '')}${leave.attachmentUrl}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline bg-accent/5 px-2 py-1 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <Paperclip className="w-3.5 h-3.5" />
              Attachment
            </a>
          </div>
        )}
      </div>

      {(leave.hodRemark || leave.principalRemark) && (
        <div className="mb-4 space-y-2">
          {leave.hodRemark && (
            <div className="text-xs">
              <span className="font-medium text-text-primary">HoD:</span>{' '}
              <span className="text-text-secondary">{leave.hodRemark}</span>
            </div>
          )}
          {leave.principalRemark && (
            <div className="text-xs">
              <span className="font-medium text-text-primary">Principal:</span>{' '}
              <span className="text-text-secondary">{leave.principalRemark}</span>
            </div>
          )}
        </div>
      )}

      {actions && (
        <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
