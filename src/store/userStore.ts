import { create } from 'zustand';
import type { User } from '../types';
import { api } from '../lib/api';
import { mapUser } from '../lib/mappers';

interface UserState {
  users: User[];
  total: number;
  isLoading: boolean;
  fetchUsers: (filters?: Record<string, string>) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bulkImport: (file: File) => Promise<{ total: number; created: number; failed: any[] }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  total: 0,
  isLoading: false,

  fetchUsers: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/users?${params}`);
      const mapped = (res.data || []).map(mapUser);
      set({ users: mapped, total: res.total || mapped.length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addUser: async (userData) => {
    try {
      const body: any = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department_id: userData.departmentId,
        phone: userData.phone || undefined,
        class_section: userData.class || undefined,
        employee_id: userData.employeeId || undefined,
      };
      if (userData.password) body.password = userData.password;

      const res = await api.post('/users', body);
      const newUser = mapUser(res.data);
      set((state) => ({ users: [newUser, ...state.users], total: state.total + 1 }));
      return newUser;
    } catch (err: any) {
      throw err;
    }
  },

  updateUser: async (id, data) => {
    try {
      const body: any = {};
      if (data.name) body.name = data.name;
      if (data.email) body.email = data.email;
      if (data.phone !== undefined) body.phone = data.phone;
      if (data.class !== undefined) body.class_section = data.class;
      if (data.departmentId) body.department_id = data.departmentId;
      if (data.role) body.role = data.role;

      const res = await api.put(`/users/${id}`, body);
      const updated = mapUser(res.data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  deactivateUser: async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);
      const updated = mapUser(res.data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  activateUser: async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);
      const updated = mapUser(res.data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        total: state.total - 1,
      }));
    } catch (err: any) {
      throw err;
    }
  },

  bulkImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.upload('/users/bulk-import', formData);
    // Refresh the user list after import
    await get().fetchUsers();
    return res.data;
  },
}));
