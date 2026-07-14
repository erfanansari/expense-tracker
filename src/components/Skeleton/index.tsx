import { useTranslations } from 'next-intl';

import { twMerge } from 'tailwind-merge';

const Pulse = ({ className }: { className?: string }) => {
  const t = useTranslations('common');
  return (
    <div
      className={twMerge('bg-border-default h-6 w-full animate-pulse rounded-sm', className)}
      aria-label={t('loading')}
    />
  );
};

export default Pulse;
