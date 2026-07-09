import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@core/auth/auth';

export const { GET, POST } = toNextJsHandler(auth);
