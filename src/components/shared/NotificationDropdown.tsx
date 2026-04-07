import { useEffect, useRef } from 'react';
import { FileText, CheckCircle, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { timeAgo, cn } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!user) return null;

  // Take top 5 recent notifications from API (already user-scoped by backend)
  const recentNotifs = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'leave_applied': return <FileText className="w-4 h-4 text-status-info" />;
      case 'leave_approved': return <CheckCircle className="w-4 h-4 text-status-approved" />;
      case 'leave_rejected': return <AlertCircle className="w-4 h-4 text-status-rejected" />;
      case 'leave_forwarded': return <RefreshCw className="w-4 h-4 text-accent" />;
      case 'user_added': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-80 bg-surface-card rounded-xl shadow-dropdown border border-surface-border z-50 animate-slide-up origin-top-right overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface/50">
        <h3 className="font-semibold text-text-primary text-sm">Notifications</h3>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-[11px] text-accent hover:text-accent-hover font-medium p-1"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {recentNotifs.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {recentNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif.id);
                  if (notif.linkTo) {
                    navigate(notif.linkTo);
                    onClose();
                  }
                }}
                className={cn(
                  'p-4 hover:bg-surface-muted/50 transition-colors cursor-pointer',
                  !notif.isRead && 'bg-accent-[0.02]'
                )}
              >
                <div className="flex gap-3">
                  <div className="pt-0.5 shrink-0">
                    {getIconForType(notif.type)}
                  </div>
                  <div>
                    <p className={cn('text-sm mb-1', !notif.isRead ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-text-muted font-medium">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-text-muted text-sm">
            No new notifications
          </div>
        )}
      </div>

      <div className="p-2 border-t border-surface-border">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block w-full text-center text-xs font-medium text-text-secondary py-2 hover:bg-surface-muted rounded-md transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
