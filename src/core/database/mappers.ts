import type { Asset, AssetValuation } from '@/@types/asset';
import type { Expense, Tag } from '@/@types/expense';
import type { Income } from '@/@types/income';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>;

export function mapRowToIncome(row: DbRow): Income {
  return {
    id: row.id as number,
    userId: row.userId as number,
    amountUsd: row.amountUsd as number,
    amountToman: row.amountToman as number,
    exchangeRateUsed: row.exchangeRateUsed as number,
    month: row.month as number,
    year: row.year as number,
    incomeType: row.incomeType as Income['incomeType'],
    source: row.source as string | null,
    notes: row.notes as string | null,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export function mapRowToAsset(row: DbRow): Asset {
  return {
    id: row.id as number,
    userId: row.userId as number,
    category: row.category as Asset['category'],
    name: row.name as string,
    quantity: row.quantity as number,
    unit: row.unit as string | null,
    unitValueUsd: row.unitValueUsd as number | null,
    totalValueUsd: row.totalValueUsd as number,
    totalValueToman: row.totalValueToman as number,
    exchangeRateUsed: row.exchangeRateUsed as number,
    notes: row.notes as string | null,
    lastValuedAt: row.lastValuedAt as string,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export function mapRowToAssetValuation(row: DbRow): AssetValuation {
  return {
    id: row.id as number,
    assetId: row.assetId as number,
    quantity: row.quantity as number,
    unitValueUsd: row.unitValueUsd as number | null,
    totalValueUsd: row.totalValueUsd as number,
    totalValueToman: row.totalValueToman as number,
    exchangeRateUsed: row.exchangeRateUsed as number,
    valuedAt: row.valuedAt as string,
    createdAt: row.createdAt as string,
  };
}

export function mapRowToExpense(row: DbRow, tags?: Tag[]): Expense {
  return {
    id: row.id as number,
    date: row.date as string,
    category: row.category as string,
    description: row.description as string,
    price_toman: row.price_toman as number,
    price_usd: row.price_usd as number,
    created_at: row.created_at as string,
    tags: tags ?? [],
  };
}
