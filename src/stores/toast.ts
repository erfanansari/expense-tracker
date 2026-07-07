import { useStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { Toast, ToastType } from '@components/Toast';

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  closeToast: (id: string) => void;
}

// Vanilla store so non-React code (e.g. the unauthorized handler) can toast
// via toastStore.getState().showToast(...).
const toastStore = createStore<ToastState>()(
  devtools((set) => ({
    toasts: [],
    showToast: (message, type = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({ toasts: [...state.toasts, { id, message, type }] }), undefined, 'showToast');
    },
    closeToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }), undefined, 'closeToast'),
  }))
);

export const useToastStore = <T>(selector: (state: ToastState) => T): T => useStore(toastStore, selector);

/** Drop-in replacement for the old ToastProvider's useToast(). */
export const useToast = () => {
  const showToast = useToastStore((state) => state.showToast);
  return { showToast };
};

export default toastStore;
