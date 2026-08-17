import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

export interface SectionCardProps {
  /** Decorative — it repeats the title, so it is hidden from assistive tech. */
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /**
   * The card body. Supply your own padding: some bodies are forms that want
   * `p-6`, others are full-bleed tables that must reach the card edge.
   */
  children: ReactNode;
}

/**
 * A titled card — the surface every settings section is built from.
 *
 * This exists because the same eleven lines of icon-box-plus-heading markup
 * were copy-pasted into all ten sections, which is how the padding and
 * font-weight drifted apart in the first place. The `<h2>` here sits under the
 * page's single `<h1>`.
 */
const SectionCard = ({ icon: Icon, title, subtitle, children }: SectionCardProps) => (
  <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
    <div className="border-border-subtle border-b p-6">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
          <Icon className="text-text-secondary h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-text-muted text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>

    {children}
  </div>
);

export default SectionCard;
