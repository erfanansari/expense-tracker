'use client';

import { ThemeProvider } from 'next-themes';

import ClientProvider from '@core/client/provider';

import GlobalDrawers from '@features/drawers/GlobalDrawers';
import CurrencyHydrator from '@features/ExchangeRate/CurrencyHydrator';

import { CommandPaletteProvider } from '@components/CommandPalette/CommandPaletteProvider';
import Toaster from '@components/Toast/Toaster';

import UnauthorizedListener from './UnauthorizedListener';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <ClientProvider>
      <UnauthorizedListener />
      <CurrencyHydrator />
      <CommandPaletteProvider>{children}</CommandPaletteProvider>
      <GlobalDrawers />
      <Toaster />
    </ClientProvider>
  </ThemeProvider>
);

export default Providers;
