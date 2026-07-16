import { dash } from '@better-auth/infra';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import * as Sentry from '@sentry/nextjs';
import { APIError, betterAuth } from 'better-auth';
import { createAuthMiddleware, getSessionFromCtx } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';

import { DEMO_EMAIL } from '@constants';

import { hashPassword, verifyPassword } from '@core/auth/password';
import { seedDefaultCategoriesForUser } from '@core/database/categories';
import { createDefaultNotificationPreferences } from '@core/database/notification-preferences';
import { sendPasswordChangedEmail, sendResetPasswordEmail, sendVerificationEmail } from '@core/email/auth-emails';
import { sendWelcomeEmail } from '@core/email/welcome';
import { getUserLocale } from '@core/session/locale';

const dialect = new LibsqlDialect({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: { dialect, type: 'sqlite' },
  advanced: {
    database: { generateId: 'serial' },
  },
  user: {
    modelName: 'users',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    // First-run flags — read-only through the session (written only by
    // /api/user/onboarding). NULL onboardedAt = show the welcome screen.
    additionalFields: {
      onboardedAt: { type: 'string', required: false, input: false, fieldName: 'onboarded_at' },
      checklistDismissedAt: { type: 'string', required: false, input: false, fieldName: 'checklist_dismissed_at' },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days (parity with old JWT)
    updateAge: 60 * 60 * 24,
    // Signed session copy in the cookie skips the Turso round-trip on most
    // requests. Tradeoff: cross-device revocation can lag up to maxAge.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Keep legacy PBKDF2 hashes so pre-migration users' passwords still work
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) => verifyPassword(password, hash),
    },
    sendResetPassword: async ({ user, url }) => {
      const locale = await getUserLocale();
      await sendResetPasswordEmail({ email: user.email, name: user.name ?? null }, url, locale);
    },
    onPasswordReset: async ({ user }) => {
      // Security notification; never block the reset on email delivery
      const locale = await getUserLocale();
      sendPasswordChangedEmail({ email: user.email, name: user.name ?? null }, locale).catch((error) => {
        console.error('Password-changed email failed:', error);
        Sentry.captureException(error);
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour, matches email copy
    sendVerificationEmail: async ({ user, url }) => {
      // No saved preference exists yet at signup — the request's locale
      // cookie (same one the rest of the app reads) is the only signal.
      const locale = await getUserLocale();
      await sendVerificationEmail({ email: user.email, name: user.name ?? null }, url, locale);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
  hooks: {
    // The demo account is shared — block anything that would change its
    // credentials or linked accounts and lock other visitors out.
    before: createAuthMiddleware(async (ctx) => {
      const guardedPaths = ['/change-password', '/link-social', '/unlink-account'];
      if (!guardedPaths.includes(ctx.path)) return;
      const session = await getSessionFromCtx(ctx);
      if (session?.user?.email === DEMO_EMAIL) {
        throw new APIError('FORBIDDEN', { message: "Demo account can't change security settings" });
      }
    }),
    // Security notification after a successful in-app password change (the
    // reset flow is covered by onPasswordReset above).
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/change-password') return;
      const session = await getSessionFromCtx(ctx);
      if (!session?.user?.email) return;
      const locale = await getUserLocale();
      sendPasswordChangedEmail({ email: session.user.email, name: session.user.name ?? null }, locale).catch(
        (error) => {
          console.error('Password-changed email failed:', error);
          Sentry.captureException(error);
        }
      );
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const userId = Number(user.id);
          const locale = await getUserLocale();
          try {
            await seedDefaultCategoriesForUser(userId, locale);
            await createDefaultNotificationPreferences(userId);
          } catch (error) {
            console.error('Post-signup seeding failed:', error);
            Sentry.captureException(error);
          }
          // Fire-and-forget; never block or fail user creation on email delivery
          sendWelcomeEmail({ userId, email: user.email, name: user.name ?? null, locale }).catch((error) => {
            console.error('Welcome email failed:', error);
            Sentry.captureException(error);
          });
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      '/sign-in/email': { window: 60, max: 10 },
      '/sign-up/email': { window: 600, max: 5 },
      '/request-password-reset': { window: 900, max: 5 },
      '/reset-password': { window: 900, max: 10 },
    },
  },
  // dash() connects to Better Auth Infrastructure (dashboard, audit logs,
  // analytics) via BETTER_AUTH_API_KEY; nextCookies must stay last.
  plugins: [dash(), nextCookies()],
});
