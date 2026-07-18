import { fallbackT } from '../fallback-translator';
import { createFeedbackSchema } from '../feedback';

const schema = createFeedbackSchema(fallbackT);

describe('createFeedbackSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = schema.safeParse({ type: 'bug', message: 'The chart is broken' });
    expect(parsed.success).toBe(true);
  });

  it('trims the message', () => {
    const parsed = schema.safeParse({ type: 'idea', message: '  add budgets  ' });
    expect(parsed.success && parsed.data.message).toBe('add budgets');
  });

  it('rejects an empty or whitespace-only message', () => {
    expect(schema.safeParse({ type: 'bug', message: '' }).success).toBe(false);
    expect(schema.safeParse({ type: 'bug', message: '   ' }).success).toBe(false);
  });

  it('rejects an unknown type', () => {
    expect(schema.safeParse({ type: 'rant', message: 'hi' }).success).toBe(false);
  });

  it('rejects an overlong message', () => {
    expect(schema.safeParse({ type: 'other', message: 'x'.repeat(2001) }).success).toBe(false);
  });
});
