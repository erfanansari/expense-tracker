import * as RadixTabs from '@radix-ui/react-tabs';
import { twMerge } from 'tailwind-merge';

import type { TabItem } from '../../@types';

interface TabsListProps {
  items: TabItem[];
  className?: string;
}

const TabsList = ({ items, className }: TabsListProps) => (
  <RadixTabs.List
    className={twMerge('border-border-subtle bg-background-secondary flex gap-1 rounded-lg border p-1', className)}
  >
    {items.map((item) => (
      <TabsTrigger key={item.value} value={item.value} label={item.label} />
    ))}
  </RadixTabs.List>
);

export default TabsList;

interface TabsTriggerProps {
  value: string;
  label: string;
}

function TabsTrigger({ value, label }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={twMerge(
        'text-text-tertiary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'hover:text-text-primary',
        'data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
      )}
    >
      <span>{label}</span>
    </RadixTabs.Trigger>
  );
}
