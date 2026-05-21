'use client';

import { GlobalDrawerProvider } from '@features/drawers/GlobalDrawerProvider';

import { CommandPaletteProvider } from '@components/CommandPalette/CommandPaletteProvider';
import QueryProvider from '@components/QueryProvider';
import { ToastProvider } from '@components/Toast/ToastProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <QueryProvider>
    <ToastProvider>
      <GlobalDrawerProvider>
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </GlobalDrawerProvider>
    </ToastProvider>
  </QueryProvider>
);

export default Providers;
