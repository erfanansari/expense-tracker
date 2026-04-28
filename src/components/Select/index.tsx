'use client';

import { ChevronDown } from 'lucide-react';
import ReactSelect, { components } from 'react-select';
import type { CSSObjectWithLabel, DropdownIndicatorProps, StylesConfig } from 'react-select';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectStyles: StylesConfig<any, any, any> = {
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
};

const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption, false>) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown
      className={twMerge(
        'text-text-muted h-4 w-4 shrink-0 transition-transform duration-200',
        props.selectProps.menuIsOpen && 'rotate-180'
      )}
    />
  </components.DropdownIndicator>
);

const Select = ({ value, onChange, options, placeholder, disabled, className }: SelectProps) => {
  const selectedOption = options.find((o) => o.value === value) ?? null;

  return (
    <ReactSelect<SelectOption, false>
      value={selectedOption}
      onChange={(opt) => onChange(opt?.value ?? '')}
      options={options}
      placeholder={placeholder ?? 'Select...'}
      isDisabled={disabled}
      isSearchable={false}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      unstyled
      styles={selectStyles}
      components={{ DropdownIndicator, IndicatorSeparator: () => null }}
      className={className}
      classNames={{
        control: ({ isFocused, isDisabled }) =>
          twMerge(
            'border-border-subtle bg-background flex w-full items-center rounded-lg border px-3 py-2 text-sm transition-all cursor-pointer',
            isFocused && 'border-blue',
            isDisabled && 'bg-background-secondary text-text-muted cursor-not-allowed opacity-60'
          ),
        menu: () => 'border-border-subtle bg-background mt-1 rounded-lg border py-1 shadow-lg',
        option: ({ isFocused, isSelected }) =>
          twMerge(
            'text-text-primary cursor-pointer px-3 py-1.5 text-xs transition-colors',
            isFocused && 'bg-background-elevated',
            isSelected && 'font-medium'
          ),
        placeholder: () => 'text-text-muted text-sm',
        singleValue: () => 'text-text-primary text-sm',
        dropdownIndicator: () => 'ml-2',
        noOptionsMessage: () => 'text-text-muted px-4 py-3 text-xs',
        loadingMessage: () => 'text-text-muted px-4 py-3 text-xs',
      }}
    />
  );
};

export default Select;
