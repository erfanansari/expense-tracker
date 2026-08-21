'use client';

import { useLocale } from 'next-intl';

import { twMerge } from 'tailwind-merge';

interface ChartTooltipProps {
  primary: string;
  secondary?: string;
  accent?: { text: string; tone?: 'blue' | 'success' };
}

/**
 * Every chart body is wrapped in `dir="ltr"` — Recharts lays its axes and its
 * tooltip position out along that axis, and flipping it mirrors the plot. The
 * tooltip is a text panel, though, not part of the plot, so under Farsi it has
 * to opt back into RTL explicitly: inheriting `ltr` left the amount stranded on
 * the wrong edge of the panel, reading left-to-right in a right-to-left UI.
 *
 * `dir` is set on the panel itself rather than the chart wrapper so only the
 * text flips; the plot keeps the direction Recharts needs.
 */
const ChartTooltip = ({ primary, secondary, accent }: ChartTooltipProps) => {
  const isRtl = useLocale() === 'fa';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="border-border-subtle bg-background rounded-lg border p-4 text-start shadow-lg"
    >
      <p className="text-text-primary text-lg font-bold">{primary}</p>
      {secondary && <p className="text-text-muted mt-1.5 text-sm font-medium">{secondary}</p>}
      {accent && (
        <p className={twMerge('mt-2 text-sm font-medium', accent.tone === 'success' ? 'text-success' : 'text-blue')}>
          {accent.text}
        </p>
      )}
    </div>
  );
};

export default ChartTooltip;
