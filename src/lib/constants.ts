import type { LeaveTypeConfig, LeaveStatusConfig, NavItem, Role } from '../types';

// ═══════════════════════════════════════
// LEAVE TYPES
// ═══════════════════════════════════════

export const LEAVE_TYPES: Record<string, LeaveTypeConfig> = {
  medical:   { label: 'Medical Leave',   maxDays: 12 },
  personal:  { label: 'Personal Leave',  maxDays: 6 },
  emergency: { label: 'Emergency Leave', maxDays: 3 },
  academic:  { label: 'Academic Leave',  maxDays: 5 },
  other:     { label: 'Other Leave',     maxDays: 4 },
};

// ═══════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════

export const DEPARTMENTS: string[] = [
  'Computer Science',
  'Mathematics',
  'Science',
  'English',
  'Physical Education',
  'Administration',
];

// ═══════════════════════════════════════
// ROLE LABELS
// ═══════════════════════════════════════

export const ROLE_LABELS: Record<Role, string> = {
  principal: 'Principal',
  hod:       'Head of Department',
  staff:     'Staff',
  student:   'Student',
};

// ═══════════════════════════════════════
// LEAVE STATUS CONFIG
// ═══════════════════════════════════════

export const LEAVE_STATUS_CONFIG: Record<string, LeaveStatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'text-status-pending',
    bg:    'bg-amber-50',
  },
  hod_approved: {
    label: 'HoD Approved',
    color: 'text-status-info',
    bg:    'bg-blue-50',
  },
  approved: {
    label: 'Approved',
    color: 'text-status-approved',
    bg:    'bg-emerald-50',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-status-rejected',
    bg:    'bg-red-50',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-text-muted',
    bg:    'bg-surface-muted',
  },
};

// ═══════════════════════════════════════
// NAVIGATION ITEMS PER ROLE
// ═══════════════════════════════════════

export const NAV_ITEMS: NavItem[] = [
  // Dashboards
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    path: '/dashboard/principal',
    roles: ['principal'],
  },
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    path: '/dashboard/hod',
    roles: ['hod'],
  },
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    path: '/dashboard/staff',
    roles: ['staff'],
  },
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    path: '/dashboard/student',
    roles: ['student'],
  },

  // Leave application (staff + student)
  {
    icon: 'FilePlus2',
    label: 'Apply Leave',
    path: '/leaves/apply',
    roles: ['staff', 'student'],
  },
  {
    icon: 'FileText',
    label: 'My Leaves',
    path: '/leaves/my',
    roles: ['staff', 'student'],
  },

  // Leave review (hod + principal)
  {
    icon: 'ClipboardCheck',
    label: 'Review Leaves',
    path: '/leaves/review',
    roles: ['hod', 'principal'],
  },

  // User management (principal + hod)
  {
    icon: 'Users',
    label: 'Manage Users',
    path: '/users',
    roles: ['principal', 'hod'],
  },
  {
    icon: 'UserPlus',
    label: 'Add User',
    path: '/users/add',
    roles: ['principal', 'hod'],
  },

  // Notifications (all)
  {
    icon: 'Bell',
    label: 'Notifications',
    path: '/notifications',
    roles: ['principal', 'hod', 'staff', 'student'],
  },

  // Profile (all)
  {
    icon: 'UserCircle',
    label: 'Profile',
    path: '/profile',
    roles: ['principal', 'hod', 'staff', 'student'],
  },

  // Audit log (principal only)
  {
    icon: 'ScrollText',
    label: 'Audit Log',
    path: '/audit',
    roles: ['principal'],
  },
];

// ═══════════════════════════════════════
// HELPER: get nav items for a specific role
// ═══════════════════════════════════════

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
