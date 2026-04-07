import { create } from 'zustand';
import type { AuditLog } from '../types';
import { api } from '../lib/api';
import { mapAuditLog } from '../lib/mappers';

interface AuditLogState {
  logs: AuditLog[];
  total: number;
  isLoading: boolean;
  fetchLogs: (filters?: Record<string, string>) => Promise<void>;
  exportCSV: (filters?: Record<string, string>) => Promise<void>;
}

export const useAuditLogStore = create<AuditLogState>((set) => ({
  logs: [],
  total: 0,
  isLoading: false,

  fetchLogs: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/audit?${params}`);
      const mapped = (res.data || []).map(mapAuditLog);
      set({ logs: mapped, total: res.total || mapped.length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  exportCSV: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const csv = await api.get<string>(`/audit/export?${params}`);
      // Trigger download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  },
}));
