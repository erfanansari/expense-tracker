'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import getQueryClient from './get-query-client';

// Uses the getQueryClient() singleton (not a component-local client) so that
// endpoint defaults registered via client.registerEndpoint are visible to all
// useQuery/useMutation observers.
const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default ClientProvider;
