import { useTranslations } from 'next-intl';

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorState = ({
  title,
  description,
  icon: Icon = AlertTriangle,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) => {
  const t = useTranslations('errors.generic');
  return (
    <div
      className={twMerge(
        'relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center',
        className
      )}
    >
      <span className="text-border-default absolute top-3 left-3 text-lg font-light select-none">+</span>
      <span className="text-border-default absolute top-3 right-3 text-lg font-light select-none">+</span>
      <span className="text-border-default absolute bottom-3 left-3 text-lg font-light select-none">+</span>
      <span className="text-border-default absolute right-3 bottom-3 text-lg font-light select-none">+</span>

      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="border-border-subtle absolute inset-0 rotate-12 rounded-xl border-2 border-dashed" />
        <div className="bg-danger relative z-10 translate-x-1.5 translate-y-1.5 rounded-lg p-2.5">
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      </div>

      <div className="flex max-w-sm flex-col items-center gap-1.5">
        <p className="text-text-primary text-base font-semibold">{title ?? t('title')}</p>
        <p className="text-text-muted text-xs break-words">{description ?? t('description')}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {retryLabel ?? t('retry')}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
