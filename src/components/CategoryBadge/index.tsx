'use client';

import { createElement } from 'react';

import { getCategoryColor, getCategoryIcon } from '@constants/categories';
import { twMerge } from 'tailwind-merge';

import type { Category } from '@/@types/expense';

interface CategoryBadgeProps {
  category: Pick<Category, 'name' | 'icon' | 'color'>;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

const CategoryBadge = ({ category, size = 'sm', className, showIcon = true }: CategoryBadgeProps) => {
  const iconComp = getCategoryIcon(category.icon);
  const color = getCategoryColor(category.color);

  const isMd = size === 'md';

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        color.pill,
        isMd ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs',
        className
      )}
    >
      {showIcon &&
        createElement(iconComp, {
          className: twMerge('shrink-0', isMd ? 'h-3.5 w-3.5' : 'h-3 w-3'),
          'aria-hidden': true,
        })}
      <span className="min-w-0 truncate">{category.name}</span>
    </span>
  );
};

export default CategoryBadge;
