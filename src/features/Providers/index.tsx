'use client';

import { ThemeProvider } from 'next-themes';

import { GlobalDrawerProvider } from '@features/drawers/GlobalDrawerProvider';
import { CurrencyProvider } from '@features/ExchangeRate/CurrencyProvider';

import { CommandPaletteProvider } from '@components/CommandPalette/CommandPaletteProvider';
import QueryProvider from '@components/QueryProvider';
import { ToastProvider } from '@components/Toast/ToastProvider';

import UnauthorizedListener from './UnauthorizedListener';

interface ProvidersProps {
  children: React.ReactNode;
}

// CurrencyProvider wraps GlobalDrawerProvider so money components rendered inside
// global drawers (e.g. the expense/income/asset forms) have currency context too.
const Providers = ({ children }: ProvidersProps) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryProvider>
      <ToastProvider>
        <UnauthorizedListener />
        <CurrencyProvider>
          <GlobalDrawerProvider>
            <CommandPaletteProvider>{children}</CommandPaletteProvider>
          </GlobalDrawerProvider>
        </CurrencyProvider>
      </ToastProvider>
    </QueryProvider>
  </ThemeProvider>
);

export default Providers;
