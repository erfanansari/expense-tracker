'use client';

import { createElement, useState } from 'react';

import { getCategoryColor, getCategoryIcon } from '@constants/categories';
import { Check, ChevronDown, Plus } from 'lucide-react';
import ReactSelect, { components } from 'react-select';
import type {
  CSSObjectWithLabel,
  DropdownIndicatorProps,
  MenuListProps,
  OptionProps,
  SingleValueProps,
  StylesConfig,
} from 'react-select';
import { twMerge } from 'tailwind-merge';

import { useCategories } from '@hooks/use-categories';

import type { Category } from '@/@types/expense';

import CategoryQuickCreateModal from './QuickCreate';

interface CategoryOption {
  value: number;
  label: string;
  category: Category;
}

const CREATE_ACTION_VALUE = -1;

interface CreateActionOption {
  value: number;
  label: string;
  __create__: true;
}

type AnyOption = CategoryOption | CreateActionOption;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles: StylesConfig<any, any, any> = {
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  menu: (base: CSSObjectWithLabel) => ({ ...base, width: 'max-content', minWidth: '100%' }),
  // Force flex (not react-select's grid) value container so the searchable input's placeholder isn't clipped.
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
  control: () => ({ minHeight: 'unset' }),
  valueContainer: () => ({ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', padding: 0 }),
};

const MenuList = (props: MenuListProps<AnyOption, false>) => (
  <components.MenuList
    {...props}
    innerProps={{
      ...props.innerProps,
      onWheel: (e) => e.stopPropagation(),
      onTouchMove: (e) => e.stopPropagation(),
    }}
  />
);

const DropdownIndicator = (props: DropdownIndicatorProps<AnyOption, false>) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown
      className={twMerge(
        'text-text-muted h-3.5 w-3.5 shrink-0 transition-transform duration-200',
        props.selectProps.menuIsOpen && 'rotate-180'
      )}
    />
  </components.DropdownIndicator>
);

const isCreateOption = (o: AnyOption): o is CreateActionOption => (o as CreateActionOption).__create__ === true;

const Option = (props: OptionProps<AnyOption, false>) => {
  const { data, isFocused, isSelected, innerProps, innerRef } = props;

  if (isCreateOption(data)) {
    return (
      <div
        {...innerProps}
        ref={innerRef}
        className={twMerge(
          'border-border-subtle text-blue mt-1 flex cursor-pointer items-center gap-2 border-t px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-100',
          isFocused && 'bg-blue/10'
        )}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span>Create category…</span>
      </div>
    );
  }

  const iconComp = getCategoryIcon(data.category.icon);
  const color = getCategoryColor(data.category.color);

  return (
    <div
      {...innerProps}
      ref={innerRef}
      className={twMerge(
        'text-text-secondary flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-100',
        isFocused && 'bg-background-elevated text-text-primary',
        isSelected && 'text-text-primary font-medium'
      )}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${color.pill}`}>
        {createElement(iconComp, { className: 'h-3 w-3' })}
      </span>
      <span className="flex-1 truncate">{data.label}</span>
      {isSelected && <Check className="text-blue h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </div>
  );
};

const SingleValue = (props: SingleValueProps<AnyOption, false>) => {
  const { data } = props;
  if (isCreateOption(data)) return null;

  const iconComp = getCategoryIcon(data.category.icon);
  const color = getCategoryColor(data.category.color);

  return (
    <components.SingleValue {...props}>
      <span className="flex items-center gap-2">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${color.pill}`}>
          {createElement(iconComp, { className: 'h-3 w-3' })}
        </span>
        <span className="text-text-primary truncate text-sm font-medium">{data.label}</span>
      </span>
    </components.SingleValue>
  );
};

interface CategorySelectProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const CategorySelect = ({ value, onChange, disabled, placeholder = 'Select category…' }: CategorySelectProps) => {
  const { data: categories = [] } = useCategories();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const options: AnyOption[] = [
    ...categories.map<CategoryOption>((c) => ({ value: c.id, label: c.name, category: c })),
    { value: CREATE_ACTION_VALUE, label: 'Create category…', __create__: true } as CreateActionOption,
  ];

  const selected = value
    ? ((options.find((o) => !isCreateOption(o) && o.value === value) as CategoryOption | undefined) ?? null)
    : null;

  return (
    <>
      <ReactSelect<AnyOption, false>
        value={selected}
        onChange={(opt) => {
          if (!opt) {
            onChange(null);
            return;
          }
          if (isCreateOption(opt)) {
            setQuickCreateOpen(true);
            return;
          }
          onChange(opt.value);
        }}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        unstyled
        styles={styles}
        components={{ DropdownIndicator, MenuList, Option, SingleValue, IndicatorSeparator: () => null }}
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
          placeholder: () => 'text-text-muted text-sm whitespace-nowrap',
          input: () => 'text-text-primary text-sm',
          valueContainer: () => 'py-0',
          dropdownIndicator: () => 'ml-1 text-text-muted',
          noOptionsMessage: () => 'text-text-muted px-3 py-3 text-sm',
        }}
      />

      <CategoryQuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={(category) => {
          setQuickCreateOpen(false);
          onChange(category.id);
        }}
      />
    </>
  );
};

export default CategorySelect;
