import { createAssetSchema } from '../asset';

describe('createAssetSchema', () => {
  const validAsset = {
    category: 'crypto' as const,
    name: 'Bitcoin',
    quantity: 0.5,
    totalValueUsd: 50000,
    totalValueToman: 6500000000,
    exchangeRateUsed: 130000,
  };

  it('accepts valid asset data', () => {
    const result = createAssetSchema.safeParse(validAsset);
    expect(result.success).toBe(true);
  });

  it('accepts asset with optional fields', () => {
    const result = createAssetSchema.safeParse({
      ...validAsset,
      unit: 'BTC',
      unitValueUsd: 100000,
      notes: 'Cold wallet',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createAssetSchema.safeParse({ ...validAsset, category: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createAssetSchema.safeParse({ ...validAsset, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = createAssetSchema.safeParse({ ...validAsset, quantity: -1 });
    expect(result.success).toBe(false);
  });
});
