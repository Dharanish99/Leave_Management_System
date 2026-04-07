// ═══════════════════════════════════════
// ROLE & STATUS ENUMS
// ═══════════════════════════════════════

export type Role = 'principal' | 'hod' | 'staff' | 'student';

export type LeaveStatus = 'pending' | 'hod_approved' | 'approved' | 'rejected' | 'cancelled';

export type LeaveType = 'medical' | 'personal' | 'emergency' | 'academic' | 'other';

// ═══════════════════════════════════════
// CORE ENTITIES
// ═══════════════════════════════════════

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  departmentId?: string;
  employeeId?: string;
  studentId?: string;
  class?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: 'staff' | 'student';
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  hodRemark?: string;
  principalRemark?: string;
  substituteId?: string;
  attachmentUrl?: string;
  appliedAt: string;
  updatedAt: string;
  hodReviewedAt?: string;
  principalReviewedAt?: string;
}

export interface LeaveBalance {
  userId: string;
  medical: number;
  personal: number;
  emergency: number;
  academic: number;
  other: number;
  totalAllotted: number;
  totalUsed: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'leave_applied' | 'leave_approved' | 'leave_rejected' | 'leave_forwarded' | 'leave_cancelled' | 'user_added' | 'user_deactivated';
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string;
  targetType: 'user' | 'leave' | string;
  detail: string;
  timestamp: string;
}

// ═══════════════════════════════════════
// STORE TYPES
// ═══════════════════════════════════════

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: Role; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export interface LeaveState {
  leaves: LeaveApplication[];
  balances: LeaveBalance[];
  isLoading: boolean;
  fetchLeaves: (filters?: Record<string, string>) => Promise<void>;
  fetchMyLeaves: (filters?: Record<string, string>) => Promise<void>;
  fetchBalance: (userId?: string) => Promise<void>;
  applyLeave: (data: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt' | 'updatedAt' | 'totalDays'> & { attachment?: File }) => void;
  approveLeave: (id: string, remark: string, by: 'hod' | 'principal') => void;
  rejectLeave: (id: string, remark: string, by: 'hod' | 'principal') => void;
  forwardLeave: (id: string, remark: string) => void;
  updateLeaveStatus: (
    leaveId: string,
    status: LeaveStatus,
    remark: string,
    reviewerRole: 'hod' | 'principal'
  ) => void;
  cancelLeave: (leaveId: string) => void;
  getLeavesByUser: (userId: string) => LeaveApplication[];
  getLeavesByDepartment: (department: string) => LeaveApplication[];
  getPendingLeaves: () => LeaveApplication[];
  getBalanceByUser: (userId: string) => LeaveBalance | undefined;
}

// ═══════════════════════════════════════
// UI / NAVIGATION TYPES
// ═══════════════════════════════════════

export interface NavItem {
  icon: string;
  label: string;
  path: string;
  roles: Role[];
}

export interface LeaveStatusConfig {
  label: string;
  color: string;
  bg: string;
}

export interface LeaveTypeConfig {
  label: string;
  maxDays: number;
}
