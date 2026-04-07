import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { CheckCheck, FileText, CheckCircle, XCircle, Info, Clock, BellOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Notification } from '../../types';

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'leave_applied':
    case 'leave_forwarded':
      return <FileText className="w-5 h-5 text-accent" />;
    case 'leave_approved':
      return <CheckCircle className="w-5 h-5 text-status-approved" />;
    case 'leave_rejected':
      return <XCircle className="w-5 h-5 text-status-rejected" />;
    case 'system':
    default:
      return <Info className="w-5 h-5 text-text-muted" />;
  }
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications, unreadCount } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'Unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  const userUnreadCount = unreadCount;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.linkTo) {
      navigate(notif.linkTo);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Notifications" 
          subtitle="Stay updated with your latest leave alerts and system messages." 
        />
        {userUnreadCount > 0 && (
          <Button variant="secondary" onClick={() => markAllAsRead()} className="whitespace-nowrap shadow-sm">
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="card w-full p-0 flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-surface-border px-6 pt-4 shrink-0">
          {(['All', 'Unread'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2 px-1 relative',
                activeTab === tab 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-text-muted hover:text-text-primary'
              )}
            >
              {tab}
              {tab === 'Unread' && userUnreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white">
                  {userUnreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-surface-card custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted p-12">
              <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
                <BellOff className="w-8 h-8 text-text-muted/50" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">No notifications yet</h3>
              <p className="text-sm text-center max-w-[250px]">When you receive updates about your leave applications or system changes, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border flex flex-col">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition-colors cursor-pointer group',
                    !notif.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-surface-muted',
                  )}
                >
                  <div className={cn(
                    'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                    !notif.isRead ? 'bg-surface shadow-sm ring-1 ring-surface-border' : 'bg-surface-muted opacity-80'
                  )}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                      <h4 className={cn(
                        'text-sm truncate pr-2',
                        !notif.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
                      )}>
                        {notif.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className={cn(
                      'text-sm line-clamp-2 md:line-clamp-none',
                      !notif.isRead ? 'text-text-primary/90' : 'text-text-muted'
                    )}>
                      {notif.message}
                    </p>
                  </div>
                  
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--color-accent),0.5)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
