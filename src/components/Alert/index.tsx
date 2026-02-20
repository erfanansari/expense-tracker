import type { ReactNode } from 'react';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-blue-light text-blue',
    iconClass: 'text-blue opacity-60',
    icon: Info,
  },
  success: {
    container: 'bg-success-light text-success',
    iconClass: 'text-success opacity-60',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-warning-light text-warning',
    iconClass: 'text-warning opacity-60',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-danger-light text-danger',
    iconClass: 'text-danger opacity-60',
    icon: XCircle,
  },
};

export default function Alert({ variant = 'info', description, action, className = '' }: AlertProps) {
  const { container, iconClass, icon: Icon } = variantStyles[variant];

  return (
    <div role="alert" className={`flex items-center gap-3 rounded-xl px-4 py-3 ${container} ${className}`}>
      <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">{description}</p>
      {action && <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
