import { createCategorySchema, updateCategorySchema } from '../category';
import { fallbackT } from '../fallback-translator';
import { createTagSchema } from '../tag';
import { updateProfileSchema } from '../user';

describe('createTagSchema', () => {
  const schema = createTagSchema(fallbackT);

  it('accepts and trims a valid name', () => {
    const parsed = schema.safeParse({ name: '  groceries  ' });
    expect(parsed.success && parsed.data.name).toBe('groceries');
  });

  it('rejects empty or whitespace-only names', () => {
    expect(schema.safeParse({ name: '' }).success).toBe(false);
    expect(schema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('rejects overlong names', () => {
    expect(schema.safeParse({ name: 'x'.repeat(51) }).success).toBe(false);
  });
});

describe('createCategorySchema', () => {
  const schema = createCategorySchema(fallbackT);

  it('accepts a name-only payload (icon/color optional)', () => {
    expect(schema.safeParse({ name: 'Food' }).success).toBe(true);
  });

  it('accepts icon and color when provided', () => {
    const parsed = schema.safeParse({ name: 'Food', icon: 'Utensils', color: 'red' });
    expect(parsed.success).toBe(true);
  });

  it('rejects a missing name', () => {
    expect(schema.safeParse({ icon: 'Folder' }).success).toBe(false);
  });
});

describe('updateCategorySchema', () => {
  const schema = updateCategorySchema(fallbackT);

  it('accepts partial updates', () => {
    expect(schema.safeParse({ color: 'blue' }).success).toBe(true);
    expect(schema.safeParse({ sort_order: 3 }).success).toBe(true);
  });

  it('rejects an empty payload', () => {
    expect(schema.safeParse({}).success).toBe(false);
  });

  it('rejects an empty name when provided', () => {
    expect(schema.safeParse({ name: '  ' }).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  const schema = updateProfileSchema(fallbackT);

  it('accepts and trims a valid name', () => {
    const parsed = schema.safeParse({ name: ' Erfan ' });
    expect(parsed.success && parsed.data.name).toBe('Erfan');
  });

  it('rejects empty and overlong names', () => {
    expect(schema.safeParse({ name: '' }).success).toBe(false);
    expect(schema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false);
  });
});
