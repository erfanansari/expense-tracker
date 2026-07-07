import { z } from 'zod';

import type { Expense } from '@types';

import client from '@core/client';
import type { QueryKeyGenerator } from '@core/client/@types';

import { expenseSchema } from './getExpenseListQuery';

type Response = Expense[];

const responseSchema = z.array(expenseSchema);

const keyGenerator: QueryKeyGenerator = () => ['expenses', 'flat'];

client.registerEndpoint<void, Response>(keyGenerator, {
  url: '/api/expenses',
  method: 'GET',
  // The route may return a bare array or a paginated { expenses } wrapper.
  responseNormalizer: (response) => {
    if (Array.isArray(response)) return response;
    const raw = response as unknown as { expenses?: Expense[] };
    return raw.expenses ?? [];
  },
  responseSchema,
});

export { keyGenerator as getAllExpensesKeyGenerator };
export type { Response as GetAllExpensesResponse };
