import type { User, LeaveApplication, LeaveBalance, Notification, AuditLog } from '../types';

// ── API → Frontend Mappers ────────────────────────────────

export function mapUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department_name || '',
    departmentId: u.department_id,
    employeeId: u.employee_id,
    phone: u.phone || undefined,
    class: u.class_section || undefined,
    isActive: u.is_active,
    createdAt: u.created_at,
    createdBy: u.created_by || 'system',
  };
}

export function mapLeave(l: any): LeaveApplication {
  return {
    id: l.id,
    applicantId: l.applicant_id,
    applicantName: l.applicant_name || '',
    applicantRole: l.applicant_role === 'student' ? 'student' : 'staff',
    department: l.department_name || '',
    leaveType: l.leave_type,
    fromDate: l.from_date?.split('T')[0] || l.from_date,
    toDate: l.to_date?.split('T')[0] || l.to_date,
    totalDays: l.total_days,
    reason: l.reason,
    status: l.status,
    hodRemark: l.hod_remark || undefined,
    principalRemark: l.principal_remark || undefined,
    substituteId: l.substitute_id || undefined,
    attachmentUrl: l.attachment_url || undefined,
    appliedAt: l.applied_at,
    updatedAt: l.updated_at,
    hodReviewedAt: l.hod_reviewed_at || undefined,
    principalReviewedAt: l.principal_reviewed_at || undefined,
  };
}

export function mapBalance(b: any): LeaveBalance {
  const med = b.medical ?? 0;
  const per = b.personal ?? 0;
  const emer = b.emergency ?? 0;
  const acad = b.academic ?? 0;
  const oth = b.other ?? 0;
  const remaining = med + per + emer + acad + oth;

  // Default allotments from DB: medical=12, personal=6, emergency=3, academic=5, other=4
  const totalAllotted = 12 + 6 + 3 + 5 + 4;

  return {
    userId: b.user_id,
    medical: med,
    personal: per,
    emergency: emer,
    academic: acad,
    other: oth,
    totalAllotted,
    totalUsed: totalAllotted - remaining,
  };
}

export function mapNotification(n: any): Notification {
  return {
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.is_read,
    createdAt: n.created_at,
    linkTo: n.link_to || undefined,
  };
}

export function mapAuditLog(a: any): AuditLog {
  return {
    id: a.id,
    actorId: a.actor_id || '',
    actorName: a.actor_name,
    action: a.action,
    targetId: a.target_id || '',
    targetType: a.target_type || 'user',
    detail: typeof a.detail === 'object' ? JSON.stringify(a.detail) : (a.detail || ''),
    timestamp: a.created_at,
  };
}
