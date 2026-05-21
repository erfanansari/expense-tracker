import { twMerge } from 'tailwind-merge';

interface ChartTooltipProps {
  primary: string;
  secondary?: string;
  accent?: { text: string; tone?: 'blue' | 'success' };
}

const ChartTooltip = ({ primary, secondary, accent }: ChartTooltipProps) => (
  <div className="border-border-subtle bg-background rounded-lg border p-4 shadow-lg">
    <p className="text-text-primary text-lg font-bold">{primary}</p>
    {secondary && <p className="text-text-muted mt-1.5 text-sm font-medium">{secondary}</p>}
    {accent && (
      <p className={twMerge('mt-2 text-sm font-medium', accent.tone === 'success' ? 'text-success' : 'text-blue')}>
        {accent.text}
      </p>
    )}
  </div>
);

export default ChartTooltip;
