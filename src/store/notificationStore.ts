import { create } from 'zustand';
import type { Notification } from '../types';
import { api } from '../lib/api';
import { mapNotification } from '../lib/mappers';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (filters?: Record<string, string>) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/notifications?${params}`);
      const mapped = (res.data || []).map(mapNotification);
      const unread = mapped.filter((n: Notification) => !n.isRead).length;
      set({ notifications: mapped, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data?.count || 0 });
    } catch {
      // silent
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const newNotifs = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: newNotifs,
          unreadCount: newNotifs.filter((n: Notification) => !n.isRead).length,
        };
      });
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },
}));
