import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { id: number };

const keyGenerator: MutationKeyGenerator = () => ['assets', 'delete'];

client.registerEndpoint<RequestData, void>(keyGenerator, {
  url: (data) => `/api/assets/${data.id}`,
  method: 'DELETE',
  type: 'mutation',
  omitFromBody: ['id'],
});

export { keyGenerator as deleteAssetKeyGenerator };
export type { RequestData as DeleteAssetRequestData };
