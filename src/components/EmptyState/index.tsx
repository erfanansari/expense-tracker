import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional CTA (e.g. a Button opening the matching drawer). */
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={twMerge('flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center', className)}>
    <div className="border-border-subtle bg-background-secondary rounded-full border p-3">
      <Icon className="text-text-muted h-6 w-6" aria-hidden="true" />
    </div>
    <div className="space-y-1">
      <p className="text-text-primary text-sm font-medium">{title}</p>
      {description && <p className="text-text-muted text-xs">{description}</p>}
    </div>
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export default EmptyState;
