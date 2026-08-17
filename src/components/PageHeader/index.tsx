import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered opposite the title — a primary button, filters, a date range. */
  action?: ReactNode;
}

/**
 * The title block every dashboard page opens with.
 *
 * There is exactly one `<h1>` per page and it lives here, so the heading
 * outline stays predictable: page `<h1>` then section `<h2>`s below it.
 *
 * The header stacks below `sm` and turns into a row above it. Side-by-side on a
 * phone crams a long Persian title against its action button, which is why the
 * overview page had already diverged into a stacking variant of its own.
 */
const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0 flex-1">
      <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">{title}</h1>
      {subtitle && <p className="text-text-muted mt-1 text-xs sm:text-sm">{subtitle}</p>}
    </div>

    {action && <div className="flex shrink-0 items-center gap-2 sm:gap-3">{action}</div>}
  </div>
);

export default PageHeader;
