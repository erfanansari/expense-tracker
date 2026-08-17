import { twMerge } from 'tailwind-merge';

import ZapBolt from './ZapBolt';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LogoProps {
  size?: LogoSize;
  /** Rendered next to the mark when provided — pass `t('common.appName')`. */
  wordmark?: string;
  wordmarkClassName?: string;
  className?: string;
}

// Radii are pinned rather than taken from the rounded-* scale: the tile has to
// hold the ~26% corner of the generated app icon at every size, and a shared
// scale step would round the small lockups into circles.
const SIZES: Record<LogoSize, { tile: string; bolt: string; wordmark: string }> = {
  sm: { tile: 'h-8 w-8 rounded-[9px]', bolt: 'h-4 w-4', wordmark: 'text-base font-semibold' },
  md: { tile: 'h-9 w-9 rounded-[10px]', bolt: 'h-5 w-5', wordmark: 'text-xl font-bold' },
  lg: { tile: 'h-12 w-12 rounded-[13px]', bolt: 'h-6 w-6', wordmark: 'text-2xl font-bold' },
  xl: { tile: 'h-20 w-20 rounded-[22px]', bolt: 'h-10 w-10', wordmark: 'text-3xl font-bold' },
};

const Logo = ({ size = 'md', wordmark, wordmarkClassName, className }: LogoProps) => {
  const styles = SIZES[size];

  return (
    <span className={twMerge('flex items-center gap-2', className)}>
      <span
        className={twMerge('bg-primary text-primary-foreground flex shrink-0 items-center justify-center', styles.tile)}
      >
        <ZapBolt className={styles.bolt} />
      </span>
      {wordmark && (
        <span className={twMerge('text-text-primary tracking-tight', styles.wordmark, wordmarkClassName)}>
          {wordmark}
        </span>
      )}
    </span>
  );
};

export default Logo;
