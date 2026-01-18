'use client';

import { useEffect } from 'react';

import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const styles = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-white',
    info: 'bg-blue text-white',
  };

  return (
    <div
      className={`${styles[toast.type]} animate-slide-up flex max-w-md min-w-[320px] items-center gap-3 rounded-lg px-4 py-3 shadow-lg`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 rounded p-1 transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6">
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};
