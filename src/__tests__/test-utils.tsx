import type { ReactElement, ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderHookOptions, RenderOptions } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';

import en from '../../messages/en.json';

/**
 * Fresh client per render so cache/mutation defaults never bleed across tests.
 * Grab the returned client to register test-specific query/mutation defaults.
 */
export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface ProviderRenderOptions {
  queryClient?: QueryClient;
}

/**
 * Real English catalog, so tests keep asserting the actual user-facing
 * strings as components migrate to useTranslations().
 */
const Providers = ({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={en}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </NextIntlClientProvider>
);

const customRender = (ui: ReactElement, options: Omit<RenderOptions, 'wrapper'> & ProviderRenderOptions = {}) => {
  const { queryClient = makeTestQueryClient(), ...renderOptions } = options;

  const result = render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>,
    ...renderOptions,
  });

  return { ...result, queryClient };
};

const customRenderHook = <Result, Props>(
  hook: (initialProps: Props) => Result,
  options: Omit<RenderHookOptions<Props>, 'wrapper'> & ProviderRenderOptions = {}
) => {
  const { queryClient = makeTestQueryClient(), ...renderOptions } = options;

  return renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>,
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
