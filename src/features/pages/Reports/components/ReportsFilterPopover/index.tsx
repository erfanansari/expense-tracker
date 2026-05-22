'use client';

import { useEffect, useRef, useState } from 'react';

import { EXPENSE_CATEGORIES } from '@constants/categories';
import { Check, X } from 'lucide-react';
import { components as rsComponents } from 'react-select';
import type { CSSObjectWithLabel, MenuListProps, MultiValue, OptionProps, StylesConfig } from 'react-select';
import Select2 from 'react-select';
import { twMerge } from 'tailwind-merge';

import Button from '@components/Button';
import Modal from '@components/Modal';

import { useTags } from '@hooks/use-tags';

import type { Tag } from '@/@types/expense';

interface ReportsFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: Tag[];
  selectedCategories: string[];
  onTagsChange: (tags: Tag[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onReset: () => void;
}

interface TagOption {
  value: number;
  label: string;
}
interface CategoryOption {
  value: string;
  label: string;
}

// ─── Shared multi-select styles (mirrors TagInput) ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multiSelectStyles: StylesConfig<any, any, any> = {
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  menu: (base: CSSObjectWithLabel) => ({ ...base, width: 'max-content', minWidth: '100%' }),
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
  control: () => ({ minHeight: 'unset' }),
  valueContainer: () => ({ display: 'flex', alignItems: 'center', flex: 1, flexWrap: 'wrap', padding: 0 }),
};

const controlClass = (isFocused: boolean) =>
  twMerge(
    'border-border-subtle bg-background flex w-full items-center rounded-lg border px-3 py-2 text-sm transition-all cursor-text gap-1.5',
    isFocused && 'border-blue ring-2 ring-blue/15'
  );

const sharedClassNames = {
  control: ({ isFocused }: { isFocused: boolean }) => controlClass(isFocused),
  valueContainer: () => 'gap-1.5 flex-wrap',
  placeholder: () => 'text-text-muted text-sm',
  input: () => 'text-text-primary text-sm shrink-0 min-w-0',
  menu: () =>
    'border-border-subtle bg-background mt-1.5 rounded-xl border p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] animate-dropdown-pop overflow-hidden',
  menuList: () => 'flex flex-col gap-0.5 max-h-72 overflow-y-auto',
  multiValue: () =>
    'border-border-subtle bg-background-elevated text-text-secondary hover:border-border-default flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-all',
  multiValueRemove: () =>
    'text-text-muted hover:text-text-primary hover:bg-background-elevated ml-0.5 rounded p-0.5 transition-colors cursor-pointer',
  noOptionsMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
};

const TagOptionRenderer = ({ data, isFocused, isSelected, innerProps, innerRef }: OptionProps<TagOption, true>) => (
  <div
    {...innerProps}
    ref={innerRef}
    className={twMerge(
      'text-text-secondary flex cursor-pointer items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-100',
      isFocused && 'bg-background-elevated text-text-primary',
      isSelected && 'text-text-primary font-medium'
    )}
  >
    <span className="truncate">{data.label}</span>
    {isSelected && <Check className="text-blue h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
  </div>
);

const CategoryOptionRenderer = ({
  data,
  isFocused,
  isSelected,
  innerProps,
  innerRef,
}: OptionProps<CategoryOption, true>) => (
  <div
    {...innerProps}
    ref={innerRef}
    className={twMerge(
      'text-text-secondary flex cursor-pointer items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-100',
      isFocused && 'bg-background-elevated text-text-primary',
      isSelected && 'text-text-primary font-medium'
    )}
  >
    <span className="truncate">{data.label}</span>
    {isSelected && <Check className="text-blue h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
  </div>
);

const ScrollSafeMenuList = <T,>(props: MenuListProps<T, true>) => (
  <rsComponents.MenuList
    {...props}
    innerProps={{
      ...props.innerProps,
      onWheel: (e) => e.stopPropagation(),
      onTouchMove: (e) => e.stopPropagation(),
    }}
  />
);

// ─── Shared body markup (selects + action row) ──────────────────────────────────

interface FilterBodyProps {
  tagOptions: TagOption[];
  selectedTagOptions: TagOption[];
  onTagsChange: (next: MultiValue<TagOption>) => void;
  categoryOptions: CategoryOption[];
  selectedCategoryOptions: CategoryOption[];
  onCategoriesChange: (next: MultiValue<CategoryOption>) => void;
  activeCount: number;
  onReset: () => void;
  onClose: () => void;
}

const FilterBody = ({
  tagOptions,
  selectedTagOptions,
  onTagsChange,
  categoryOptions,
  selectedCategoryOptions,
  onCategoriesChange,
  activeCount,
  onReset,
  onClose,
}: FilterBodyProps) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <label className="text-text-secondary text-xs font-medium">Tags</label>
      <Select2<TagOption, true>
        isMulti
        classNamePrefix="rfp-tag"
        value={selectedTagOptions}
        onChange={onTagsChange}
        options={tagOptions}
        placeholder="Tags"
        isSearchable
        closeMenuOnSelect={false}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        unstyled
        styles={multiSelectStyles}
        components={{
          Option: TagOptionRenderer,
          MenuList: ScrollSafeMenuList,
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          ClearIndicator: () => null,
        }}
        classNames={sharedClassNames}
        noOptionsMessage={() => 'No tags yet'}
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-text-secondary text-xs font-medium">Categories</label>
      <Select2<CategoryOption, true>
        isMulti
        classNamePrefix="rfp-cat"
        value={selectedCategoryOptions}
        onChange={onCategoriesChange}
        options={categoryOptions}
        placeholder="All categories"
        isSearchable
        closeMenuOnSelect={false}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        unstyled
        styles={multiSelectStyles}
        components={{
          Option: CategoryOptionRenderer,
          MenuList: ScrollSafeMenuList,
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
          ClearIndicator: () => null,
        }}
        classNames={sharedClassNames}
      />
    </div>

    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={onReset} disabled={activeCount === 0} className="flex-1">
        Reset
      </Button>
      <Button variant="primary" onClick={onClose} className="flex-1">
        Apply{activeCount > 0 ? ` (${activeCount})` : ''}
      </Button>
    </div>
  </div>
);

const ReportsFilterPopover = ({
  isOpen,
  onClose,
  selectedTags,
  selectedCategories,
  onTagsChange,
  onCategoriesChange,
  onReset,
}: ReportsFilterPopoverProps) => {
  const { data: allTags = [] } = useTags();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Desktop popover: handle outside-click + ESC. (Modal handles these on mobile.)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popoverRef.current?.contains(target)) {
        const portalledMenu = (target as HTMLElement)?.closest?.('[class*="menu"]');
        if (portalledMenu) return;
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, onClose]);

  if (!isOpen) return null;

  const tagOptions: TagOption[] = allTags.map((t) => ({ value: t.id, label: t.name }));
  const selectedTagOptions: TagOption[] = selectedTags.map((t) => ({ value: t.id, label: t.name }));
  const categoryOptions: CategoryOption[] = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
  const selectedCategoryOptions: CategoryOption[] = categoryOptions.filter((c) => selectedCategories.includes(c.value));

  const handleTagsChange = (next: MultiValue<TagOption>) => {
    const tags = next.map((o) => allTags.find((t) => t.id === o.value)).filter(Boolean) as Tag[];
    onTagsChange(tags);
  };

  const handleCategoriesChange = (next: MultiValue<CategoryOption>) => {
    onCategoriesChange(next.map((o) => o.value));
  };

  const activeCount = selectedTags.length + selectedCategories.length;

  const bodyProps = {
    tagOptions,
    selectedTagOptions,
    onTagsChange: handleTagsChange,
    categoryOptions,
    selectedCategoryOptions,
    onCategoriesChange: handleCategoriesChange,
    activeCount,
    onReset,
    onClose,
  };

  // ─── Mobile: shared Modal (matches ExportModal) ───────────────────────────────
  if (isMobile) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Filters" className="max-w-md">
        <FilterBody {...bodyProps} />
      </Modal>
    );
  }

  // ─── Desktop: anchored popover ────────────────────────────────────────────────
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Filter reports"
      className="border-border-subtle bg-background animate-modal-pop absolute top-full right-0 z-50 mt-2 w-[420px] overflow-hidden rounded-2xl border shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]"
    >
      {/* Header — matches Modal */}
      <div className="border-border-subtle bg-background-secondary flex items-center justify-between border-b px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-text-primary text-base font-semibold sm:text-lg">Filters</h3>
          {activeCount > 0 && (
            <span className="bg-blue/10 text-blue rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:bg-background-elevated hover:text-text-primary focus-visible:ring-blue/30 focus-visible:border-blue -mr-1 ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <FilterBody {...bodyProps} />
      </div>
    </div>
  );
};

export default ReportsFilterPopover;
