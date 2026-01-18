'use client';

import { cloneElement, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { twMerge } from 'tailwind-merge';

interface ChildProps {
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  'aria-describedby'?: string;
}

interface TooltipProps {
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactElement<ChildProps>;
  className?: string;
}

const Tooltip = ({ content, position = 'top', children, className }: TooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Check if there's actual content
  const hasContent = content && (typeof content === 'string' ? content.trim().length > 0 : true);
  // Show tooltip only when user is interacting AND there's content
  const isVisible = hasContent && (isHovered || isFocused);

  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow position classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-primary',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-primary',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-primary',
  };

  // Extract original handlers from children props
  const originalOnFocus = children.props.onFocus;
  const originalOnBlur = children.props.onBlur;

  // Clone the child element and add event handlers
  const childWithHandlers = cloneElement(children, {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setIsFocused(true);
      originalOnFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      setIsFocused(false);
      originalOnBlur?.(e);
    },
    'aria-describedby': hasContent ? 'toman-tooltip' : undefined,
  });

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {childWithHandlers}

      {/* Tooltip - only render when there's content */}
      {hasContent && (
        <div
          id="toman-tooltip"
          role="tooltip"
          aria-live="polite"
          className={twMerge(
            'bg-primary pointer-events-none absolute z-50 min-w-max rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-200',
            positionClasses[position],
            isVisible ? 'opacity-100' : 'opacity-0',
            className
          )}
        >
          {content}

          {/* Arrow */}
          <div className={twMerge('absolute', arrowClasses[position])} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
