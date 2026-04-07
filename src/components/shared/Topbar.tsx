import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, UserCircle, Settings, LogOut } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui/Avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { getNavItemsForRole } from '../../lib/constants';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);
  
  // Find current page title based on path
  const currentNavItem = navItems.find((item) => {
    if (item.path === `/dashboard/${user.role}`) {
      return location.pathname === item.path || location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  });
  
  const pageTitle = currentNavItem ? currentNavItem.label : 'Leave Management';

  return (
    <header className="h-16 bg-ink-950 border-b border-ink-800 shrink-0 px-6 flex items-center justify-between z-10 shadow-sm relative">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button (hidden on desktop) */}
        <button className="md:hidden text-ink-400 hover:text-warm-50">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-warm-50 tracking-tight">
            {pageTitle}
          </h2>
          {/* Simple breadcrumb */}
          <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-ink-400">Home</span>
            <span className="text-ink-400">/</span>
            <span className="text-ember-400">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="p-2 w-9 h-9 flex items-center justify-center rounded-lg text-ink-400 hover:text-warm-50 hover:bg-ink-900 transition-colors">
          <Search className="w-4.5 h-4.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 w-9 h-9 flex items-center justify-center rounded-lg text-ink-400 hover:text-warm-50 hover:bg-ink-900 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-ember-500 rounded-full ring-2 ring-ink-950" />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="h-6 w-px bg-ink-800 mx-2" />

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-full"
          >
            <Avatar name={user.name} src={user.avatar} size="sm" className="ring-2 ring-ember-500/40" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-card rounded-xl shadow-dropdown border border-surface-border z-50 animate-slide-up origin-top-right overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-surface-border mb-1">
                <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
              
              <Link 
                to="/profile" 
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </Link>
              <button 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors text-left"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <div className="border-t border-surface-border my-1" />
              
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-status-rejected hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
