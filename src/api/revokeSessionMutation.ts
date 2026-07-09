import { z } from 'zod';

import client from '@core/client';
import type { MutationKeyGenerator } from '@core/client/@types';

type RequestData = { token: string };

const revokeKeyGenerator: MutationKeyGenerator = () => ['auth', 'revoke-session'];

client.registerEndpoint<RequestData, void>(revokeKeyGenerator, {
  url: '/api/auth/revoke-session',
  type: 'mutation',
  requestDataSchema: z.object({ token: z.string().min(1) }),
});

const revokeOthersKeyGenerator: MutationKeyGenerator = () => ['auth', 'revoke-other-sessions'];

client.registerEndpoint<void, void>(revokeOthersKeyGenerator, {
  url: '/api/auth/revoke-other-sessions',
  type: 'mutation',
  // Better Auth rejects bodyless posts with 415
  requestNormalizer: () => ({}),
});

export { revokeKeyGenerator as revokeSessionKeyGenerator, revokeOthersKeyGenerator as revokeOtherSessionsKeyGenerator };
export type { RequestData as RevokeSessionRequestData };
