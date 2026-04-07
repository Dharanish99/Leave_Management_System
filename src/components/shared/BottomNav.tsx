import { NavLink } from 'react-router-dom';
import { Home, FileText, CheckSquare, Bell, User as UserIcon, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { cn } from '../../lib/utils';

export function BottomNav({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    switch (role) {
      case 'principal':
        return [
          { icon: Home, label: 'Home', path: '/dashboard/principal' },
          { icon: CheckSquare, label: 'Review', path: '/leaves/review' },
          { icon: Users, label: 'Users', path: '/users' },
          { icon: Bell, label: 'Notifs', path: '/notifications', badge: true },
          { icon: UserIcon, label: 'Profile', path: '/profile' },
        ];
      case 'hod':
        return [
          { icon: Home, label: 'Home', path: '/dashboard/hod' },
          { icon: CheckSquare, label: 'Review', path: '/leaves/review' },
          { icon: FileText, label: 'My Leaves', path: '/leaves/my' },
          { icon: Bell, label: 'Notifs', path: '/notifications', badge: true },
          { icon: UserIcon, label: 'Profile', path: '/profile' },
        ];
      case 'staff':
        return [
          { icon: Home, label: 'Home', path: '/dashboard/staff' },
          { icon: FileText, label: 'Apply', path: '/leaves/apply' },
          { icon: CheckSquare, label: 'My Leaves', path: '/leaves/my' },
          { icon: Bell, label: 'Notifs', path: '/notifications', badge: true },
          { icon: UserIcon, label: 'Profile', path: '/profile' },
        ];
      case 'student':
        return [
          { icon: Home, label: 'Home', path: '/dashboard/student' },
          { icon: FileText, label: 'Apply', path: '/leaves/apply' },
          { icon: CheckSquare, label: 'My Leaves', path: '/leaves/my' },
          { icon: Bell, label: 'Notifs', path: '/notifications', badge: true },
          { icon: UserIcon, label: 'Profile', path: '/profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav
      className={cn(className)}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        background: '#0F1724',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 active:scale-95 transition-transform duration-200',
                  isActive ? 'text-accent font-medium' : 'text-white/45'
                )
              }
            >
              <div className="relative">
                <Icon className="w-[22px] h-[22px]" />
                {item.badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-[14px] min-w-[14px] px-[3px] items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow ring-1 ring-[#0F1724]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
