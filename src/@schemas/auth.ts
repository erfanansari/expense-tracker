import { z } from 'zod';

import type { Translator } from './fallback-translator';

// Mirrors the server-side rules in src/core/auth/validation.ts
export function createStrongPasswordSchema(t: Translator) {
  return z
    .string()
    .min(8, t('zod.auth.passwordMinLength'))
    .regex(/[A-Z]/, t('zod.auth.passwordUppercase'))
    .regex(/[a-z]/, t('zod.auth.passwordLowercase'))
    .regex(/[0-9]/, t('zod.auth.passwordNumber'));
}

export function createLoginSchema(t: Translator) {
  return z.object({
    email: z.string().email(t('zod.auth.emailInvalid')),
    password: z.string().min(1, t('zod.auth.passwordRequired')),
  });
}

export function createSignupSchema(t: Translator) {
  return z
    .object({
      name: z.string().min(1, t('zod.auth.nameRequired')).max(100, t('zod.auth.nameTooLong')),
      email: z.string().email(t('zod.auth.emailInvalid')),
      password: createStrongPasswordSchema(t),
      passwordConfirm: z.string().min(1, t('zod.auth.passwordConfirmRequired')),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t('zod.auth.passwordsMismatch'),
      path: ['passwordConfirm'],
    });
}

export function createForgotPasswordSchema(t: Translator) {
  return z.object({
    email: z.string().email(t('zod.auth.emailInvalid')),
  });
}

export function createResetPasswordSchema(t: Translator) {
  return z
    .object({
      token: z.string().min(1, t('zod.auth.tokenRequired')),
      password: createStrongPasswordSchema(t),
      passwordConfirm: z.string().min(1, t('zod.auth.passwordConfirmRequired')),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t('zod.auth.passwordsMismatch'),
      path: ['passwordConfirm'],
    });
}

export function createChangePasswordSchema(t: Translator) {
  return z
    .object({
      currentPassword: z.string().min(1, t('zod.auth.currentPasswordRequired')),
      password: createStrongPasswordSchema(t),
      passwordConfirm: z.string().min(1, t('zod.auth.passwordConfirmRequired')),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t('zod.auth.passwordsMismatch'),
      path: ['passwordConfirm'],
    });
}

export function createSetPasswordSchema(t: Translator) {
  return z
    .object({
      password: createStrongPasswordSchema(t),
      passwordConfirm: z.string().min(1, t('zod.auth.passwordConfirmRequired')),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t('zod.auth.passwordsMismatch'),
      path: ['passwordConfirm'],
    });
}

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupSchema = z.infer<ReturnType<typeof createSignupSchema>>;
export type ForgotPasswordSchema = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
export type ResetPasswordSchema = z.infer<ReturnType<typeof createResetPasswordSchema>>;
export type ChangePasswordSchema = z.infer<ReturnType<typeof createChangePasswordSchema>>;
export type SetPasswordSchema = z.infer<ReturnType<typeof createSetPasswordSchema>>;
