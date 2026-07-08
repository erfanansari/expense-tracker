import type { NextConfig } from 'next';

import { withSentryConfig } from '@sentry/nextjs';
import { execSync } from 'child_process';

const getCommitSha = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: getCommitSha(),
  },
  devIndicators: false,
};

export default withSentryConfig(nextConfig, {
  // org and project are read from SENTRY_ORG / SENTRY_PROJECT env vars
  // (set by the Vercel <-> Sentry integration)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // tunnelRoute intentionally omitted: the /monitoring proxy hangs under
  // next start (Next 16 + Turbopack external rewrite), which silently drops
  // all browser events. Direct ingest works; revisit if ad-blocker loss matters.
  silent: !process.env.CI,
});
