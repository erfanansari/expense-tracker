import { createChangePasswordSchema, createSetPasswordSchema, createSignupSchema } from '../auth';
import { fallbackT } from '../fallback-translator';

const changePasswordSchema = createChangePasswordSchema(fallbackT);
const setPasswordSchema = createSetPasswordSchema(fallbackT);
const signupSchema = createSignupSchema(fallbackT);

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'Oldpass1', password: 'Newpass123', passwordConfirm: 'Newpass123' };

  it('accepts a valid payload', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the current password', () => {
    expect(changePasswordSchema.safeParse({ ...valid, currentPassword: '' }).success).toBe(false);
  });

  it.each([
    ['too short', 'Ab1'],
    ['no uppercase', 'newpass123'],
    ['no lowercase', 'NEWPASS123'],
    ['no number', 'Newpassword'],
  ])('rejects a weak new password (%s)', (_label, password) => {
    const result = changePasswordSchema.safeParse({ ...valid, password, passwordConfirm: password });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmation', () => {
    const result = changePasswordSchema.safeParse({ ...valid, passwordConfirm: 'Different123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match');
    }
  });
});

describe('setPasswordSchema', () => {
  it('accepts a valid payload', () => {
    expect(setPasswordSchema.safeParse({ password: 'Newpass123', passwordConfirm: 'Newpass123' }).success).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(setPasswordSchema.safeParse({ password: 'weakpass', passwordConfirm: 'weakpass' }).success).toBe(false);
  });
});

describe('signupSchema password complexity', () => {
  const base = { name: 'Me', email: 'me@example.com' };

  it('rejects passwords without complexity (regression: Better Auth only checks length)', () => {
    expect(
      signupSchema.safeParse({ ...base, password: 'alllowercase1', passwordConfirm: 'alllowercase1' }).success
    ).toBe(false);
  });

  it('accepts complex passwords', () => {
    expect(signupSchema.safeParse({ ...base, password: 'Goodpass123', passwordConfirm: 'Goodpass123' }).success).toBe(
      true
    );
  });
});
