/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import type { InStatement } from '@libsql/client';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { pathToFileURL } from 'url';

import { DEMO_EMAIL, DEMO_PASSWORD } from '@constants';

import { hashPassword } from '@core/auth/password';

const DEMO_NAME = 'Demo User';

// ─── Deterministic PRNG (mulberry32) ────────────────────────────────────────
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(42);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((rand() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// ─── Rolling date window ────────────────────────────────────────────────────
// The demo always shows the last WINDOW_YEARS of activity ending with the
// current month, so re-running this seed keeps the data perpetually "recent".
const WINDOW_YEARS = 5;
const NOW = new Date();
const END_YEAR = NOW.getFullYear();
const END_MONTH = NOW.getMonth() + 1; // 1-based
const START_YEAR = END_YEAR - WINDOW_YEARS;
const START_MONTH = END_MONTH;

/** All { year, month } periods from the window start through the current month. */
function buildPeriods(): { year: number; month: number }[] {
  const periods: { year: number; month: number }[] = [];
  let y = START_YEAR;
  let m = START_MONTH;
  while (y < END_YEAR || (y === END_YEAR && m <= END_MONTH)) {
    periods.push({ year: y, month: m });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return periods;
}

const PERIODS = buildPeriods();
const isCurrentMonth = (year: number, month: number) => year === END_YEAR && month === END_MONTH;

/** Clamp a day so records in the current month never land in the future. */
function clampDay(year: number, month: number, day: number): number {
  return isCurrentMonth(year, month) ? Math.min(day, NOW.getDate()) : day;
}

// ─── Historical exchange rate (USD→IRT), relative to the window start ────────
const START_RATE = 25000; // ~Toman per USD at window start
const ANNUAL_RATE_GROWTH = 1.23; // compounding devaluation (~25k → ~70k over 5y)

function getExchangeRate(year: number, month: number): number {
  const yearsFromStart = year - START_YEAR + (month - 1) / 12;
  const base = START_RATE * Math.pow(ANNUAL_RATE_GROWTH, yearsFromStart);
  const noise = 1 + (rand() - 0.5) * 0.1; // ±5%
  return Math.round(base * noise);
}

// ─── Tags ───────────────────────────────────────────────────────────────────
// A small, everyday set — enough to make filtering meaningful without clutter.
const TAG_NAMES = ['essential', 'recurring', 'planned', 'impulse', 'social', 'fun', 'cash', 'online'];

// Category to tag affinity mapping (keys must match EXPENSE_CATEGORIES names).
const CATEGORY_TAG_AFFINITY: Record<string, string[]> = {
  Groceries: ['essential', 'recurring', 'planned', 'cash'],
  'Coffee & Dining': ['social', 'fun', 'impulse', 'cash'],
  Transport: ['essential', 'recurring', 'cash'],
  Rent: ['essential', 'recurring', 'planned'],
  Utilities: ['essential', 'recurring', 'planned', 'online'],
  Entertainment: ['social', 'fun', 'impulse', 'online'],
};

// ─── Expense categories with frequency and price ranges ─────────────────────
interface ExpenseCategory {
  name: string;
  icon: string;
  color: string;
  minPerMonth: number;
  maxPerMonth: number;
  minUsd: number;
  maxUsd: number;
  descriptions: string[];
}

// Six everyday categories for a modest renter — legible, not overwhelming.
// USD amounts are intentionally down-to-earth (rent ~$450, groceries ~$10-55).
const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: 'green',
    minPerMonth: 4,
    maxPerMonth: 7,
    minUsd: 8,
    maxUsd: 55,
    descriptions: [
      'Weekly groceries',
      'Fresh produce',
      'Bread and dairy',
      'Fruit and vegetables',
      'Pantry basics',
      'Snacks and tea',
    ],
  },
  {
    name: 'Coffee & Dining',
    icon: 'Coffee',
    color: 'orange',
    minPerMonth: 4,
    maxPerMonth: 8,
    minUsd: 3,
    maxUsd: 30,
    descriptions: [
      'Coffee shop',
      'Lunch out',
      'Dinner with friends',
      'Kebab',
      'Cafe with a friend',
      'Bakery',
      'Fast food',
    ],
  },
  {
    name: 'Transport',
    icon: 'Car',
    color: 'sky',
    minPerMonth: 3,
    maxPerMonth: 6,
    minUsd: 2,
    maxUsd: 25,
    descriptions: ['Gas fill-up', 'Snapp ride', 'Metro credit', 'Taxi', 'Parking', 'Bus fare'],
  },
  {
    name: 'Rent',
    icon: 'Home',
    color: 'blue',
    minPerMonth: 1,
    maxPerMonth: 1,
    minUsd: 400,
    maxUsd: 500,
    descriptions: ['Monthly rent'],
  },
  {
    name: 'Utilities',
    icon: 'Zap',
    color: 'amber',
    minPerMonth: 1,
    maxPerMonth: 1,
    minUsd: 20,
    maxUsd: 70,
    descriptions: ['Electricity bill', 'Water bill', 'Gas bill', 'Internet bill', 'Phone bill'],
  },
  {
    name: 'Entertainment',
    icon: 'Film',
    color: 'red',
    minPerMonth: 1,
    maxPerMonth: 3,
    minUsd: 5,
    maxUsd: 40,
    descriptions: ['Movie night', 'Streaming subscription', 'Video game', 'Concert', 'Book', 'Day trip'],
  },
];

// ─── Assets ─────────────────────────────────────────────────────────────────
interface AssetDef {
  category: string;
  name: string;
  quantity: number;
  unit: string | null;
  baseUnitValueUsd: number;
  growth: number; // annual multiplier (1.05 = 5% growth)
}

// A modest renter's portfolio (~$22k net worth today), loosely echoing a
// real Persian-market mix: some cash, a savings account, a bit of gold and a
// gold coin, a little Bitcoin, and an everyday car. No property, no stock desk.
const ASSET_DEFS: AssetDef[] = [
  {
    category: 'cash',
    name: 'US Dollar (cash)',
    quantity: 2800,
    unit: 'USD',
    baseUnitValueUsd: 1,
    growth: 1.0,
  },
  {
    category: 'bank',
    name: 'Savings Account',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 3000,
    growth: 1.03,
  },
  {
    category: 'commodity',
    name: 'Gold',
    quantity: 15,
    unit: 'grams',
    baseUnitValueUsd: 50,
    growth: 1.08,
  },
  {
    category: 'commodity',
    name: 'Emami Gold Coin',
    quantity: 2,
    unit: 'coins',
    baseUnitValueUsd: 500,
    growth: 1.08,
  },
  {
    category: 'crypto',
    name: 'Bitcoin',
    quantity: 0.04,
    unit: 'BTC',
    baseUnitValueUsd: 30000,
    growth: 1.4,
  },
  {
    category: 'vehicle',
    name: 'Peugeot 207',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 12000,
    growth: 0.9,
  },
];

// ─── Helper: batch executor ─────────────────────────────────────────────────
async function executeBatch(client: ReturnType<typeof createClient>, statements: InStatement[], batchSize = 100) {
  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize);
    await client.batch(batch, 'write');
  }
}

// ─── Main seed function ─────────────────────────────────────────────────────
export async function seedDemo() {
  // Reset the deterministic PRNG so repeated invocations (e.g. a warm serverless
  // lambda hit by the cron more than once) always produce the same dataset.
  rand = mulberry32(42);

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log('🌱 Starting demo seed...\n');

    // 1. Create or update demo user
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [DEMO_EMAIL],
    });

    let userId: number;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id as number;
      // Update password and name
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      await client.execute({
        sql: 'UPDATE users SET password_hash = ?, name = ? WHERE id = ?',
        args: [passwordHash, DEMO_NAME, userId],
      });
      console.log(`Updated existing demo user (id: ${userId})`);
    } else {
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      const result = await client.execute({
        sql: 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        args: [DEMO_EMAIL, passwordHash, DEMO_NAME],
      });
      userId = Number(result.lastInsertRowid);
      console.log(`Created demo user (id: ${userId})`);
    }

    // 2. Clear existing data (idempotent). Expenses must go before categories
    // because expenses.category_id has ON DELETE RESTRICT.
    console.log('Clearing existing demo data...');
    await client.batch(
      [
        {
          sql: 'DELETE FROM expense_tags WHERE expense_id IN (SELECT id FROM expenses WHERE user_id = ?)',
          args: [userId],
        },
        { sql: 'DELETE FROM expenses WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM categories WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM tags WHERE user_id = ?', args: [userId] },
        { sql: 'DELETE FROM incomes WHERE userId = ?', args: [userId] },
        {
          sql: 'DELETE FROM assetValuations WHERE assetId IN (SELECT id FROM assets WHERE userId = ?)',
          args: [userId],
        },
        { sql: 'DELETE FROM assets WHERE userId = ?', args: [userId] },
      ],
      'write'
    );

    // 2b. Insert categories and build a name -> id lookup. This must run
    // before expenses since expenses.category_id is a FK.
    console.log('Inserting categories...');
    const categoryStatements: InStatement[] = EXPENSE_CATEGORIES.map((cat, idx) => ({
      sql: 'INSERT INTO categories (user_id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
      args: [userId, cat.name, cat.icon, cat.color, idx],
    }));
    await executeBatch(client, categoryStatements);

    const categoriesResult = await client.execute({
      sql: 'SELECT id, name FROM categories WHERE user_id = ?',
      args: [userId],
    });
    const categoryMap: Record<string, number> = {};
    for (const row of categoriesResult.rows) {
      categoryMap[row.name as string] = row.id as number;
    }
    console.log(`  Created ${EXPENSE_CATEGORIES.length} categories`);

    // 3. Insert tags
    console.log('Inserting tags...');
    const tagStatements: InStatement[] = TAG_NAMES.map((name) => ({
      sql: 'INSERT INTO tags (user_id, name) VALUES (?, ?)',
      args: [userId, name],
    }));
    await executeBatch(client, tagStatements);

    // Fetch tag IDs
    const tagsResult = await client.execute({
      sql: 'SELECT id, name FROM tags WHERE user_id = ?',
      args: [userId],
    });
    const tagMap: Record<string, number> = {};
    for (const row of tagsResult.rows) {
      tagMap[row.name as string] = row.id as number;
    }
    console.log(`  Created ${TAG_NAMES.length} tags`);

    // 4. Insert expenses across the rolling window (WINDOW_YEARS + 1 months)
    console.log('Inserting expenses...');
    const expenseStatements: InStatement[] = [];
    const expenseTagPairs: { expenseIndex: number; tagId: number }[] = [];
    let expenseCount = 0;

    for (const { year, month } of PERIODS) {
      for (const cat of EXPENSE_CATEGORIES) {
        // Determine how many expenses for this category this month
        let count: number;
        if (cat.minPerMonth === cat.maxPerMonth) {
          count = cat.minPerMonth;
        } else if (cat.minPerMonth === 0) {
          // Occasional: ~20-30% chance per month
          count = rand() < 0.25 ? randInt(1, 2) : 0;
        } else {
          count = randInt(cat.minPerMonth, cat.maxPerMonth);
        }

        for (let i = 0; i < count; i++) {
          const day = clampDay(year, month, randInt(1, 28)); // Avoid month-end/future edge cases
          const date = `${year}-${pad2(month)}-${pad2(day)}`;
          const amountUsd = randFloat(cat.minUsd, cat.maxUsd);
          const rate = getExchangeRate(year, month);
          const description = pick(cat.descriptions);

          // Demo records are entered in USD with the period's rate as entryRate
          // (entryRate = Toman per 1 USD), so the pivot value equals amountUsd * rate.
          expenseStatements.push({
            sql: `INSERT INTO expenses (user_id, description, amount, currency, entryRate, category_id, date, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              userId,
              description,
              amountUsd,
              'USD',
              rate,
              categoryMap[cat.name],
              date,
              `${date}T${String(randInt(8, 22)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00`,
            ],
          });

          // Assign 1-3 tags based on category affinity
          const affinityTags = CATEGORY_TAG_AFFINITY[cat.name] ?? [];
          const numTags = randInt(1, Math.min(3, affinityTags.length));
          const chosenTags = pickN(affinityTags, numTags);
          for (const tagName of chosenTags) {
            if (tagMap[tagName]) {
              expenseTagPairs.push({ expenseIndex: expenseCount, tagId: tagMap[tagName] });
            }
          }

          expenseCount++;
        }
      }
    }

    await executeBatch(client, expenseStatements);
    console.log(`  Created ${expenseCount} expenses`);

    // 5. Fetch expense IDs and insert expense-tag associations
    console.log('Inserting expense-tag associations...');
    const expenseIdsResult = await client.execute({
      sql: 'SELECT id FROM expenses WHERE user_id = ? ORDER BY id ASC',
      args: [userId],
    });
    const expenseIds = expenseIdsResult.rows.map((r) => r.id as number);

    const tagAssocStatements: InStatement[] = expenseTagPairs.map((pair) => ({
      sql: 'INSERT OR IGNORE INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
      args: [expenseIds[pair.expenseIndex], pair.tagId],
    }));
    await executeBatch(client, tagAssocStatements);
    console.log(`  Created ${tagAssocStatements.length} tag associations`);

    // 6. Insert incomes
    console.log('Inserting incomes...');
    const incomeStatements: InStatement[] = [];
    let incomeCount = 0;

    for (const { year, month } of PERIODS) {
      // Modest salary with small yearly raises (a bit above monthly expenses,
      // so the renter saves a little each month).
      const baseSalary = 1000 + (year - START_YEAR) * 80;
      const rate = getExchangeRate(year, month);

      // Monthly salary (1st of the month)
      const salaryDate = `${year}-${pad2(month)}-${pad2(clampDay(year, month, 1))}T09:00:00`;
      const salaryUsd = randFloat(baseSalary - 100, baseSalary + 100);
      incomeStatements.push({
        sql: `INSERT INTO incomes (userId, amount, currency, entryRate, month, year, incomeType, source, notes, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          salaryUsd,
          'USD',
          rate,
          month,
          year,
          'salary',
          'Employer Inc.',
          'Monthly salary',
          salaryDate,
          salaryDate,
        ],
      });
      incomeCount++;

      // Occasional freelance side income (~20% of months)
      if (rand() < 0.2) {
        const freelanceDate = `${year}-${pad2(month)}-${pad2(clampDay(year, month, 15))}T10:00:00`;
        const freelanceUsd = randFloat(150, 600);
        incomeStatements.push({
          sql: `INSERT INTO incomes (userId, amount, currency, entryRate, month, year, incomeType, source, notes, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            freelanceUsd,
            'USD',
            rate,
            month,
            year,
            'freelance',
            pick(['Web project', 'Consulting', 'Design work', 'Code review', 'Tech writing']),
            'Freelance work',
            freelanceDate,
            freelanceDate,
          ],
        });
        incomeCount++;
      }

      // A gift around Nowruz (March) and year-end (December)
      if (month === 3 || month === 12) {
        const giftDate = `${year}-${pad2(month)}-${pad2(clampDay(year, month, month === 3 ? 15 : 25))}T12:00:00`;
        const giftUsd = randFloat(30, 150);
        incomeStatements.push({
          sql: `INSERT INTO incomes (userId, amount, currency, entryRate, month, year, incomeType, source, notes, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            giftUsd,
            'USD',
            rate,
            month,
            year,
            'gift',
            'Family',
            month === 3 ? 'Nowruz eidi' : 'Year-end gift',
            giftDate,
            giftDate,
          ],
        });
        incomeCount++;
      }
    }

    await executeBatch(client, incomeStatements);
    console.log(`  Created ${incomeCount} income entries`);

    // 7. Insert assets
    console.log('Inserting assets...');
    const assetStatements: InStatement[] = [];
    const now = NOW.toISOString();
    const createdAt = `${START_YEAR}-${pad2(START_MONTH)}-01T10:00:00`;

    for (const asset of ASSET_DEFS) {
      // Current value (after WINDOW_YEARS of growth)
      const currentUnitValue = asset.baseUnitValueUsd * Math.pow(asset.growth, WINDOW_YEARS);
      const totalValueUsd = parseFloat((asset.quantity * currentUnitValue).toFixed(2));
      const rate = getExchangeRate(END_YEAR, END_MONTH);

      assetStatements.push({
        sql: `INSERT INTO assets (userId, category, name, quantity, unit, unitValue, amount, currency, entryRate, notes, lastValuedAt, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          asset.category,
          asset.name,
          asset.quantity,
          asset.unit,
          parseFloat(currentUnitValue.toFixed(2)),
          totalValueUsd,
          'USD',
          rate,
          null,
          now,
          createdAt,
          now,
        ],
      });
    }

    await executeBatch(client, assetStatements);
    console.log(`  Created ${ASSET_DEFS.length} assets`);

    // 8. Insert asset valuations (semi-annual snapshots)
    console.log('Inserting asset valuations...');
    const assetIdsResult = await client.execute({
      sql: 'SELECT id, name FROM assets WHERE userId = ? ORDER BY id ASC',
      args: [userId],
    });
    const assetIdMap: Record<string, number> = {};
    for (const row of assetIdsResult.rows) {
      assetIdMap[row.name as string] = row.id as number;
    }

    const valuationStatements: InStatement[] = [];
    let valuationCount = 0;

    for (const asset of ASSET_DEFS) {
      const assetId = assetIdMap[asset.name];
      if (!assetId) continue;

      // Semi-annual snapshots (Jan & Jul) plus one for the current month.
      for (const { year, month } of PERIODS) {
        if (month !== 1 && month !== 7 && !isCurrentMonth(year, month)) continue;

        const yearsElapsed = year - START_YEAR + (month - 1) / 12;
        const unitValue = asset.baseUnitValueUsd * Math.pow(asset.growth, yearsElapsed);
        // Add some noise to valuations
        const noise = 1 + (rand() - 0.5) * 0.08;
        const noisyUnitValue = parseFloat((unitValue * noise).toFixed(2));
        const totalUsd = parseFloat((asset.quantity * noisyUnitValue).toFixed(2));
        const rate = getExchangeRate(year, month);
        const valuedAt = `${year}-${pad2(month)}-${pad2(clampDay(year, month, 15))}T10:00:00`;

        valuationStatements.push({
          sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [assetId, asset.quantity, noisyUnitValue, totalUsd, 'USD', rate, valuedAt, valuedAt],
        });
        valuationCount++;
      }
    }

    await executeBatch(client, valuationStatements);
    console.log(`  Created ${valuationCount} asset valuations`);

    // 9. Seed the USD→IRT rate time series so the demo's USD records convert for
    //    display (one row per month, plus a current row for "latest" lookups).
    console.log('Seeding currency rates...');
    const rateStatements: InStatement[] = [];
    const nowIso = NOW.toISOString();
    for (const { year, month } of PERIODS) {
      const rateDate = `${year}-${pad2(month)}-01`;
      rateStatements.push({
        sql: `INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
              VALUES ('USD', 'IRT', ?, ?, ?)`,
        args: [getExchangeRate(year, month), rateDate, nowIso],
      });
    }
    // A current-dated row so latest-rate lookups resolve.
    rateStatements.push({
      sql: `INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
            VALUES ('USD', 'IRT', ?, ?, ?)`,
      args: [getExchangeRate(END_YEAR, END_MONTH), nowIso.slice(0, 10), nowIso],
    });
    await executeBatch(client, rateStatements);
    console.log(`  Created ${rateStatements.length} currency rate rows`);

    // Summary
    console.log('\n✅ Demo seed completed successfully!');
    console.log(`   User: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    console.log(`   Tags: ${TAG_NAMES.length}`);
    console.log(`   Expenses: ${expenseCount}`);
    console.log(`   Tag associations: ${tagAssocStatements.length}`);
    console.log(`   Incomes: ${incomeCount}`);
    console.log(`   Assets: ${ASSET_DEFS.length}`);
    console.log(`   Asset valuations: ${valuationCount}`);

    return {
      tags: TAG_NAMES.length,
      expenses: expenseCount,
      tagAssociations: tagAssocStatements.length,
      incomes: incomeCount,
      assets: ASSET_DEFS.length,
      assetValuations: valuationCount,
      window: { start: `${START_YEAR}-${pad2(START_MONTH)}`, end: `${END_YEAR}-${pad2(END_MONTH)}` },
    };
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

// CLI entry: only auto-run when executed directly (e.g. `pnpm db:seed-demo`),
// not when imported by the cron route.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Load env from .env.local only for local CLI runs; the cron route relies on
  // the platform-provided environment variables.
  config({ path: '.env.local' });
  seedDemo();
}
