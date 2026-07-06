import { twMerge } from 'tailwind-merge';

const Pulse = ({ className }: { className?: string }) => {
  return (
    <div className={twMerge('bg-border-default h-6 w-full animate-pulse rounded-sm', className)} aria-label="Loading" />
  );
};

export default Pulse;
