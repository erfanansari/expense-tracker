import { twMerge } from 'tailwind-merge';

const Pulse = ({ className }: { className?: string }) => {
  return <div className={twMerge('h-6 w-full animate-pulse rounded-sm bg-zinc-300', className)} aria-label="Loading" />;
};

export default Pulse;
