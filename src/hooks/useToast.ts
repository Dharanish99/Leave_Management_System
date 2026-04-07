import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper functions for easy usage anywhere (even outside components)
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, variant: 'success' }),
  error: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, variant: 'error' }),
  warning: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, variant: 'warning' }),
  info: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, variant: 'info' }),
};
