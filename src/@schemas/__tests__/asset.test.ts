import { createAssetSchema } from '../asset';
import { fallbackT } from '../fallback-translator';

describe('createAssetSchema', () => {
  const schema = createAssetSchema(fallbackT);
  const validAsset = {
    category: 'crypto' as const,
    name: 'Bitcoin',
    quantity: 0.5,
    amount: 50000,
    currency: 'USD',
  };

  it('accepts valid asset data', () => {
    const result = schema.safeParse(validAsset);
    expect(result.success).toBe(true);
  });

  it('accepts asset with optional fields', () => {
    const result = schema.safeParse({
      ...validAsset,
      unit: 'BTC',
      unitValue: 100000,
      notes: 'Cold wallet',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = schema.safeParse({ ...validAsset, category: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = schema.safeParse({ ...validAsset, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = schema.safeParse({ ...validAsset, quantity: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts a known tracked item as linkedItem', () => {
    const result = schema.safeParse({ ...validAsset, linkedItem: 'GOLD_SEKKEH' });
    expect(result.success).toBe(true);
  });

  it('accepts empty/null linkedItem (manual)', () => {
    expect(schema.safeParse({ ...validAsset, linkedItem: '' }).success).toBe(true);
    expect(schema.safeParse({ ...validAsset, linkedItem: null }).success).toBe(true);
    expect(schema.safeParse(validAsset).success).toBe(true);
  });

  it('rejects an unknown linkedItem code', () => {
    const result = schema.safeParse({ ...validAsset, linkedItem: 'NOT_A_THING' });
    expect(result.success).toBe(false);
  });
});
