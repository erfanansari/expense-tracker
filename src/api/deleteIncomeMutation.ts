import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { id: number };

const keyGenerator: MutationKeyGenerator = () => ['incomes', 'delete'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: (data) => `/api/incomes/${data.id}`,
  method: 'DELETE',
  type: 'mutation',
  omitFromBody: ['id'],
});

export { keyGenerator as deleteIncomeKeyGenerator };
export type { RequestData as DeleteIncomeRequestData };
