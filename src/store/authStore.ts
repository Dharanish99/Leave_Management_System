import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';
import { api, registerTokenGetter } from '../lib/api';
import { mapUser } from '../lib/mappers';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const res = await api.post('/auth/login', { email, password });
          const userData = mapUser(res.data.user);

          set({
            user: userData,
            token: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, role: userData.role };
        } catch (err: any) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.message || 'Invalid credentials. Please check your email and password.',
          };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // Silently fail — we still clear local state
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },

      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
    }),
    {
      name: 'lms_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Register live token getter so api.ts can read token even before persist flushes
registerTokenGetter(() => useAuthStore.getState().token);
