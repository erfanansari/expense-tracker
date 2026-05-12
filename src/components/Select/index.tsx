'use client';

import { Check, ChevronDown } from 'lucide-react';
import ReactSelect, { components } from 'react-select';
import type {
  CSSObjectWithLabel,
  DropdownIndicatorProps,
  MenuListProps,
  OptionProps,
  StylesConfig,
} from 'react-select';
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
  // Allow the menu to grow wider than the control so long labels never wrap.
  menu: (base: CSSObjectWithLabel) => ({ ...base, width: 'max-content', minWidth: '100%' }),
};

const MenuList = (props: MenuListProps<SelectOption, false>) => (
  <components.MenuList
    {...props}
    innerProps={{
      ...props.innerProps,
      onWheel: (e) => e.stopPropagation(),
      onTouchMove: (e) => e.stopPropagation(),
    }}
  />
);

const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption, false>) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown
      className={twMerge(
        'text-text-muted h-3.5 w-3.5 shrink-0 transition-transform duration-200',
        props.selectProps.menuIsOpen && 'rotate-180'
      )}
    />
  </components.DropdownIndicator>
);

const Option = (props: OptionProps<SelectOption, false>) => (
  <components.Option {...props}>
    <div className="flex items-center justify-between gap-6">
      <span className="truncate">{props.children}</span>
      {props.isSelected && <Check className="text-blue h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </div>
  </components.Option>
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
      menuPlacement="auto"
      unstyled
      styles={selectStyles}
      components={{ DropdownIndicator, MenuList, Option, IndicatorSeparator: () => null }}
      className={className}
      classNames={{
        control: ({ isFocused, isDisabled, menuIsOpen }) =>
          twMerge(
            'border-border-subtle bg-background flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all duration-150',
            'hover:border-border-default hover:bg-background-secondary',
            (isFocused || menuIsOpen) && 'border-blue hover:border-blue ring-2 ring-blue/15 bg-background',
            isDisabled &&
              'bg-background-secondary text-text-muted cursor-not-allowed opacity-60 hover:bg-background-secondary hover:border-border-subtle'
          ),
        menu: () =>
          'border-border-subtle bg-background mt-1.5 rounded-xl border p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] animate-dropdown-pop overflow-hidden',
        menuList: () => 'flex flex-col gap-0.5 max-h-80 overflow-y-auto',
        option: ({ isFocused, isSelected }) =>
          twMerge(
            'text-text-secondary cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-100',
            isFocused && 'bg-background-elevated text-text-primary',
            isSelected && 'text-text-primary font-medium'
          ),
        placeholder: () => 'text-text-muted text-sm',
        singleValue: () => 'text-text-primary text-sm font-medium',
        valueContainer: () => 'py-0',
        dropdownIndicator: () => 'ml-1 text-text-muted',
        noOptionsMessage: () => 'text-text-muted px-3 py-3 text-sm',
        loadingMessage: () => 'text-text-muted px-3 py-3 text-sm',
      }}
    />
  );
};

export default Select;
