import type { ReactElement, ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderHookOptions, RenderOptions } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';

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

const customRender = (ui: ReactElement, options: Omit<RenderOptions, 'wrapper'> & ProviderRenderOptions = {}) => {
  const { queryClient = makeTestQueryClient(), ...renderOptions } = options;

  const result = render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
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
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
