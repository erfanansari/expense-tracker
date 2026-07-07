'use client';

import { useToastStore } from '@stores/toast';

import { ToastContainer } from './index';

/** Render-only bridge between the toast store and the toast UI. */
const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const closeToast = useToastStore((state) => state.closeToast);

  return <ToastContainer toasts={toasts} onClose={closeToast} />;
};

export default Toaster;
