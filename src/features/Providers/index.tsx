'use client';

import { CommandPaletteProvider } from '@components/CommandPalette/CommandPaletteProvider';
import QueryProvider from '@components/QueryProvider';
import { ToastProvider } from '@components/Toast/ToastProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <QueryProvider>
    <CommandPaletteProvider>
      <ToastProvider>{children}</ToastProvider>
    </CommandPaletteProvider>
  </QueryProvider>
);

export default Providers;
