import { create } from 'zustand';
import type { LeaveState, LeaveStatus } from '../types';
import { api } from '../lib/api';
import { mapLeave, mapBalance } from '../lib/mappers';
import { toast } from '../hooks/useToast';

export const useLeaveStore = create<LeaveState>()((set, get) => ({
  leaves: [],
  balances: [],
  isLoading: false,

  fetchLeaves: async (filters: Record<string, string> = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/leaves?${params}`);
      const mapped = (res.data || []).map(mapLeave);
      set({ leaves: mapped, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMyLeaves: async (filters: Record<string, string> = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/leaves/my?${params}`);
      const mapped = (res.data || []).map(mapLeave);
      set({ leaves: mapped, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchBalance: async (userId?: string) => {
    try {
      const path = userId ? `/leaves/balance/${userId}` : '/leaves/balance';
      const res = await api.get(path);
      if (res.data) {
        const mapped = mapBalance(res.data);
        set((state) => {
          const existing = state.balances.filter((b) => b.userId !== mapped.userId);
          return { balances: [...existing, mapped] };
        });
      }
    } catch {
      // Balance might not exist yet for new users
    }
  },

  applyLeave: (data) => {
    let requestPromise;

    if (data.attachment) {
      const formData = new FormData();
      formData.append('leave_type', data.leaveType);
      formData.append('from_date', data.fromDate);
      formData.append('to_date', data.toDate);
      formData.append('reason', data.reason);
      if (data.substituteId) formData.append('substitute_id', data.substituteId);
      formData.append('attachment', data.attachment);
      
      requestPromise = api.upload('/leaves', formData);
    } else {
      const body = {
        leave_type: data.leaveType,
        from_date: data.fromDate,
        to_date: data.toDate,
        reason: data.reason,
        substitute_id: data.substituteId || undefined,
      };
      requestPromise = api.post('/leaves', body);
    }

    requestPromise
      .then((res: any) => {
        const newLeave = mapLeave(res.data);
        set((state) => ({ leaves: [newLeave, ...state.leaves] }));
        toast.success('Leave Applied', 'Your leave application has been submitted successfully.');
        // Refresh balance
        get().fetchBalance?.();
      })
      .catch((err: any) => {
        toast.error('Application Failed', err.message || 'Could not submit leave application.');
      });
  },

  approveLeave: (id: string, remark: string, _by: 'hod' | 'principal') => {
    api.patch(`/leaves/${id}/approve`, { remark })
      .then((res) => {
        const updated = mapLeave(res.data);
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? updated : l)),
        }));
        toast.success('Leave Approved', 'The leave application has been approved.');
      })
      .catch((err) => {
        toast.error('Approval Failed', err.message || 'Could not approve leave.');
      });
  },

  rejectLeave: (id: string, remark: string, _by: 'hod' | 'principal') => {
    api.patch(`/leaves/${id}/reject`, { remark })
      .then((res) => {
        const updated = mapLeave(res.data);
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? updated : l)),
        }));
        toast.warning('Leave Rejected', 'The leave application has been rejected.');
      })
      .catch((err) => {
        toast.error('Rejection Failed', err.message || 'Could not reject leave.');
      });
  },

  forwardLeave: (id: string, remark: string) => {
    // Forward = HoD approves → becomes hod_approved, which the principal then sees
    api.patch(`/leaves/${id}/approve`, { remark })
      .then((res) => {
        const updated = mapLeave(res.data);
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? updated : l)),
        }));
        toast.info('Leave Forwarded', 'The application was forwarded to the Principal.');
      })
      .catch((err) => {
        toast.error('Forward Failed', err.message || 'Could not forward leave.');
      });
  },

  cancelLeave: (id: string) => {
    api.patch(`/leaves/${id}/cancel`)
      .then((res) => {
        const updated = mapLeave(res.data);
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? updated : l)),
        }));
        toast.success('Leave Cancelled', 'Your leave application has been cancelled.');
        get().fetchBalance?.();
      })
      .catch((err) => {
        toast.error('Cancel Failed', err.message || 'Could not cancel leave.');
      });
  },

  updateLeaveStatus: (
    leaveId: string,
    status: LeaveStatus,
    remark: string,
    reviewerRole: 'hod' | 'principal'
  ) => {
    // Legacy compat — delegates to approve/reject
    if (status === 'approved' || status === 'hod_approved') {
      get().approveLeave(leaveId, remark, reviewerRole);
    } else if (status === 'rejected') {
      get().rejectLeave(leaveId, remark, reviewerRole);
    }
  },

  getLeavesByUser: (userId: string) => {
    return get().leaves.filter((l) => l.applicantId === userId);
  },

  getLeavesByDepartment: (department: string) => {
    return get().leaves.filter((l) => l.department === department);
  },

  getPendingLeaves: () => {
    return get().leaves.filter((l) => l.status === 'pending' || l.status === 'hod_approved');
  },

  getBalanceByUser: (userId: string) => {
    return get().balances.find((b) => b.userId === userId);
  },
}));
