import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getNavItemsForRole } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  return (
    <aside
      className={cn(
        'relative bg-ink-950 text-warm-50 border-r border-ink-800 flex flex-col transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        className
      )}
    >
      <div style={{ borderTop: '4px solid #E8630A' }} />
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-surface border border-surface-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary z-50 shadow-sm"
      >
        <LucideIcons.ChevronLeft
          className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')}
        />
      </button>

      {/* Top Section */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-ink-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-ember-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wide">LMS</span>
          </div>
          <span
            className={cn(
              'text-warm-50 font-medium text-sm tracking-wide whitespace-nowrap transition-opacity duration-200',
              collapsed ? 'opacity-0 w-0' : 'opacity-100'
            )}
          >
            Sri Eshwar College of Engineering
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group',
                  isActive
                    ? 'bg-ember-500/15 text-ember-100 border-l-[3px] border-ember-500 font-medium -ml-px'
                    : 'text-ink-400 hover:text-ink-200 hover:bg-ink-900',
                  collapsed ? 'justify-center' : ''
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] shrink-0',
                      isActive ? 'text-ember-400' : 'text-ink-400'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="border-t border-ink-800 mx-3 mb-3" />
        <div className={cn('flex items-center gap-3 px-3 pb-4', collapsed ? 'justify-center' : '')}>
          <div className="relative">
            <Avatar name={user.name} size="sm" src={user.avatar} className="ring-2 ring-ink-800" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-approved rounded-full border-2 border-ink-950" />
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-warm-50 text-xs font-medium truncate">{user.name}</p>
              <p className="text-ember-400 text-[10px] lowercase font-medium tracking-wider">{user.role}</p>
            </div>
          )}

          <button
            onClick={logout}
            className="p-1.5 text-ink-400 hover:text-warm-50 hover:bg-ink-900 rounded-md transition-colors"
            title="Log out"
          >
            <LucideIcons.LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
