import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { id: number };

const keyGenerator: MutationKeyGenerator = () => ['expenses', 'delete'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: (data) => `/api/expenses/${data.id}`,
  method: 'DELETE',
  type: 'mutation',
  omitFromBody: ['id'],
});

export { keyGenerator as deleteExpenseKeyGenerator };
export type { RequestData as DeleteExpenseRequestData };
