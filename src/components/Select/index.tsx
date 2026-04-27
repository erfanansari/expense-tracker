'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { Check, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Select = ({ value, onChange, options, placeholder, disabled, className }: SelectProps) => {
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Variables
  const selectedOption = options.find((o) => o.value === value);

  // Callbacks
  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    setDropdownPos(null);
  }, []);

  const openDropdown = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const GAP = 4;
      const MIN_HEIGHT = 120;
      const PREFERRED_HEIGHT = 240;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom - GAP;
      const spaceAbove = rect.top - GAP;

      const openBelow = spaceBelow >= MIN_HEIGHT || spaceBelow >= spaceAbove;
      const maxHeight = Math.min(PREFERRED_HEIGHT, openBelow ? spaceBelow : spaceAbove);

      if (openBelow) {
        setDropdownPos({ top: rect.bottom + GAP, left: rect.left, width: rect.width, maxHeight });
      } else {
        setDropdownPos({ bottom: viewportHeight - rect.top + GAP, left: rect.left, width: rect.width, maxHeight });
      }
    }
    setIsOpen(true);
    const idx = options.findIndex((o) => o.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
  }, [options, value]);

  const toggle = () => {
    if (disabled) return;
    if (isOpen) {
      close();
    } else {
      openDropdown();
    }
  };

  const select = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  // Effects
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideTrigger = containerRef.current?.contains(target);
      const clickedInsideList = listRef.current?.contains(target);
      if (!clickedInsideTrigger && !clickedInsideList) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          select(options[highlightedIndex].value);
        } else {
          toggle();
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
    }
  };

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const dropdown =
    isOpen && dropdownPos
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="border-border-subtle bg-background fixed z-[9999] overflow-auto rounded-lg border py-1 shadow-lg"
            style={{
              top: dropdownPos.top,
              bottom: dropdownPos.bottom,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: dropdownPos.maxHeight,
            }}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={twMerge(
                  'text-text-primary flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors',
                  index === highlightedIndex && 'bg-background-elevated',
                  option.value === value && 'font-medium'
                )}
                onClick={() => select(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="text-blue ml-2 h-4 w-4 shrink-0" />}
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className={twMerge('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={twMerge(
          'border-border-subtle bg-background text-text-primary flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all focus:outline-none',
          isOpen && 'border-blue',
          disabled && 'bg-background-secondary text-text-muted cursor-not-allowed opacity-60',
          !selectedOption && placeholder && 'text-text-muted'
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : (placeholder ?? 'Select...')}</span>
        <ChevronDown
          className={twMerge(
            'text-text-muted ml-2 h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {dropdown}
    </div>
  );
};

export default Select;
