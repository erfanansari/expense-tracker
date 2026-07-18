'use client';

import { useMemo } from 'react';

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
  /** Custom per-option rendering (react-select). Lets callers show a compact
   *  value in the control but a richer label in the menu. */
  formatOptionLabel?: (option: SelectOption, meta: { context: 'menu' | 'value' }) => React.ReactNode;
  /** Borderless control for embedding inside an input group (e.g. MoneyInput).
   *  The surrounding container owns the border/focus ring. */
  bare?: boolean;
  /** Horizontal edge of the control the portalled menu aligns to. Use 'right'
   *  when the control sits near the right viewport edge (e.g. CurrencySelect
   *  inside MoneyInput) so a wide menu grows leftward instead of off-screen. */
  menuAlign?: 'left' | 'right';
  /** Id for react-select's focusable input so an external <label htmlFor> can
   *  target this control. */
  inputId?: string;
  /** Accessible name for controls with no visible <label> (e.g. the compact
   *  currency picker inside MoneyInput). */
  ariaLabel?: string;
}

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

const Select = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
  formatOptionLabel,
  bare,
  menuAlign,
  inputId,
  ariaLabel,
}: SelectProps) => {
  const selectedOption = options.find((o) => o.value === value) ?? null;

  const selectStyles = useMemo<StylesConfig<SelectOption, false>>(
    () => ({
      menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
      // Allow the menu to grow wider than the control so long labels never
      // wrap, but never wider than the viewport.
      menu: (base: CSSObjectWithLabel) => ({
        ...base,
        width: 'max-content',
        minWidth: '100%',
        maxWidth: 'calc(100vw - 16px)',
        ...(menuAlign === 'right' ? { right: 0, left: 'auto' } : {}),
      }),
      // react-select's default single-value crossfade uses `display: grid` +
      // `gridArea: 1/1/2/3` on the value container, which can collapse to
      // zero visible width under dir="rtl" (implicit grid columns don't
      // reliably get sized without an explicit template). Swap to a plain
      // flex row — no crossfade animation, but the selected label always renders.
      // Non-searchable selects render react-select's DummyInput as the focus
      // holder; its `position: relative; left: -100px; gridArea` is hardcoded
      // in the library (not exposed through `styles.input`), and under RTL it
      // ends up displacing this now-flex singleValue while focused — patched
      // globally in globals.css since there's no prop-level hook for it.
      valueContainer: (base: CSSObjectWithLabel) => ({ ...base, display: 'flex' }),
      singleValue: (base: CSSObjectWithLabel) => ({ ...base, position: 'static', gridArea: 'auto' }),
      placeholder: (base: CSSObjectWithLabel) => ({ ...base, position: 'static', gridArea: 'auto' }),
    }),
    [menuAlign]
  );

  return (
    <ReactSelect<SelectOption, false>
      value={selectedOption}
      onChange={(opt) => onChange(opt?.value ?? '')}
      options={options}
      placeholder={placeholder ?? 'Select...'}
      isDisabled={disabled}
      isSearchable={false}
      inputId={inputId}
      aria-label={ariaLabel}
      formatOptionLabel={formatOptionLabel}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      menuPlacement="auto"
      unstyled
      styles={selectStyles}
      components={{ DropdownIndicator, MenuList, Option, IndicatorSeparator: () => null }}
      className={className}
      classNames={{
        control: ({ isDisabled, ...state }) =>
          bare
            ? twMerge(
                'flex w-full items-center gap-1 px-3 py-2 text-sm cursor-pointer transition-colors duration-150',
                'text-text-primary hover:bg-background-secondary rounded-lg',
                // Bare controls sit inside a shared input group whose border owns
                // the group ring — highlight this control itself on keyboard focus
                // so users can tell which half of the group is active.
                (state.isFocused || state.menuIsOpen) && 'bg-background-secondary',
                isDisabled && 'text-text-muted cursor-not-allowed opacity-60'
              )
            : twMerge(
                'border-border-subtle bg-background flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all duration-150',
                'hover:border-border-default hover:bg-background-secondary',
                (state.isFocused || state.menuIsOpen) &&
                  'border-blue hover:border-blue ring-2 ring-blue/15 bg-background',
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
        dropdownIndicator: () => 'ms-1 text-text-muted',
        noOptionsMessage: () => 'text-text-muted px-3 py-3 text-sm',
        loadingMessage: () => 'text-text-muted px-3 py-3 text-sm',
      }}
    />
  );
};

export default Select;
