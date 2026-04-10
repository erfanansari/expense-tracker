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
  'px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-[background-color,border-color,color] duration-200 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const variantStyles = {
  primary: 'bg-button-primary-bg enabled:hover:bg-button-primary-bg-hover text-button-primary-text',
  outline:
    'bg-background enabled:hover:bg-button-outline-bg-hover border border-button-outline-border text-button-outline-text enabled:hover:text-button-outline-text-hover',
  danger:
    'bg-background enabled:hover:bg-danger/10 border border-button-outline-border enabled:hover:border-danger text-button-outline-text enabled:hover:text-danger',
};

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
