'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  children: ReactNode;
  className?: string;
}

const baseStyles =
  'px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const variantStyles = {
  primary: 'bg-[#000000] hover:bg-[#171717] text-white',
  outline: 'bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] text-[#525252] hover:text-[#171717]',
  danger:
    'bg-white hover:bg-[#fef2f2] border border-[#e5e5e5] hover:border-[#ef4444] text-[#525252] hover:text-[#ef4444]',
};
// <button className="px-4 py-2.5 border border-[#e5e5e5] hover:bg-[#f5f5f5] rounded-lg text-sm font-medium text-[#525252] transition-all"></button>

export const getButtonClasses = (variant: 'primary' | 'outline' | 'danger' = 'primary', className = '') => {
  return twMerge(baseStyles, variantStyles[variant], className);
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className = '', ...props }, ref) => {
    return (
      <button ref={ref} className={getButtonClasses(variant, className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
