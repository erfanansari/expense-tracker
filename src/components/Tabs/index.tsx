'use client';

import { useLocale } from 'next-intl';

import * as RadixTabs from '@radix-ui/react-tabs';

import type { TabsProps } from './@types';
import TabsContent from './components/TabsContent';
import TabsList from './components/TabsList';

/**
 * `dir` is passed explicitly because Radix stopped inheriting it from the
 * document: without it, Left/Right arrow keys move focus the wrong way through
 * the tab list in Persian. Radix's own escape hatch for this is either a
 * `DirectionProvider` at the app root or this prop — and since Tabs is the only
 * Radix primitive here, the prop keeps the fix local and dependency-free.
 */
const Tabs = ({ items, defaultValue, children, onValueChange }: TabsProps) => {
  const locale = useLocale();

  return (
    <RadixTabs.Root dir={locale === 'fa' ? 'rtl' : 'ltr'} defaultValue={defaultValue} onValueChange={onValueChange}>
      <TabsList items={items} />
      {children}
    </RadixTabs.Root>
  );
};

export { TabsContent };
export default Tabs;
