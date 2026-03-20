import * as RadixTabs from '@radix-ui/react-tabs';
import { twMerge } from 'tailwind-merge';

import type { TabsContentProps } from '../../@types';

const TabsContent = ({ value, children, className }: TabsContentProps) => (
  <RadixTabs.Content
    value={value}
    className={twMerge(
      'focus-visible:ring-primary mt-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      className
    )}
  >
    {children}
  </RadixTabs.Content>
);

export default TabsContent;
