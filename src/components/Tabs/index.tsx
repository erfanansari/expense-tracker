import * as RadixTabs from '@radix-ui/react-tabs';

import type { TabsProps } from './@types';
import TabsContent from './components/TabsContent';
import TabsList from './components/TabsList';

const Tabs = ({ items, defaultValue, children, onValueChange }: TabsProps) => (
  <RadixTabs.Root defaultValue={defaultValue} onValueChange={onValueChange}>
    <TabsList items={items} />
    {children}
  </RadixTabs.Root>
);

export { TabsContent };
export default Tabs;
