'use client';

import { createElement, type ReactNode } from 'react';

import { getCategoryColor, getCategoryIcon } from '@constants/categories';
import { twMerge } from 'tailwind-merge';

import type { Category } from '@/@types/expense';

/**
 * A category as it appears in a list you *pick* from — a tinted icon tile
 * followed by the name on a shared baseline.
 *
 * This is the counterpart to `CategoryBadge`, and the split is deliberate:
 *
 *   • `CategoryBadge` (pill) is for surfaces you **read** — the expenses table,
 *     the details drawer, chart legends. A scanned column of tinted pills lets
 *     colour do the sorting, which is the fastest cue in a dense table.
 *   • `CategoryTile` (this) is for surfaces you **pick** from — dropdown
 *     options, the chosen value, the settings list, the reassign list. Names
 *     stay left-aligned on one grid so the eye can run straight down them; a
 *     column of sixteen pills reads as confetti and sorts nothing.
 *
 * Before these two existed the same category was drawn six different ways with
 * three different icon sizes. Reach for one of them rather than hand-rolling a
 * seventh.
 */
interface CategoryTileProps {
  category: Pick<Category, 'name' | 'icon' | 'color'>;
  /** sm = menus and compact rows (default); md = settings list. */
  size?: 'sm' | 'md';
  /** Emphasise the name — used for the currently selected/active row. */
  emphasis?: boolean;
  /** Secondary line under the name (e.g. "used in 12 expenses"). */
  subtitle?: ReactNode;
  className?: string;
}

const CategoryTile = ({ category, size = 'sm', emphasis = false, subtitle, className }: CategoryTileProps) => {
  const iconComp = getCategoryIcon(category.icon);
  const color = getCategoryColor(category.color);
  const isMd = size === 'md';

  return (
    <span className={twMerge('flex min-w-0 items-center', isMd ? 'gap-3' : 'gap-2.5', className)}>
      <span
        className={twMerge(
          'flex shrink-0 items-center justify-center rounded-lg border',
          color.pill,
          isMd ? 'h-9 w-9' : 'h-6 w-6'
        )}
      >
        {createElement(iconComp, { className: isMd ? 'h-4 w-4' : 'h-3 w-3', 'aria-hidden': true })}
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={twMerge(
            'min-w-0 truncate',
            isMd ? 'text-sm' : 'text-[13px]',
            emphasis ? 'text-text-primary font-medium' : 'text-text-secondary'
          )}
        >
          {category.name}
        </span>
        {subtitle && <span className="text-text-muted truncate text-xs">{subtitle}</span>}
      </span>
    </span>
  );
};

export default CategoryTile;
