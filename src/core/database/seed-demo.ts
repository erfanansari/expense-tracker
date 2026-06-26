/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import type { InStatement } from '@libsql/client';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

import { DEMO_EMAIL, DEMO_PASSWORD } from '@constants';

import { hashPassword } from '@core/auth/password';

// Load environment variables from .env.local
config({ path: '.env.local' });

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

const rand = mulberry32(42);

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

// ─── Historical exchange rate lookup ────────────────────────────────────────
const EXCHANGE_RATE_TABLE: Record<number, number> = {
  2021: 25000,
  2022: 30000,
  2023: 42000,
  2024: 55000,
  2025: 65000,
  2026: 70000,
};

function getExchangeRate(year: number, month: number): number {
  const baseYear = Math.min(Math.max(year, 2021), 2026);
  const nextYear = Math.min(baseYear + 1, 2026);
  const baseRate = EXCHANGE_RATE_TABLE[baseYear] ?? 70000;
  const nextRate = EXCHANGE_RATE_TABLE[nextYear] ?? 70000;

  // Interpolate within the year
  const fraction = (month - 1) / 12;
  const interpolated = baseRate + (nextRate - baseRate) * fraction;

  // Add some noise (±5%)
  const noise = 1 + (rand() - 0.5) * 0.1;
  return Math.round(interpolated * noise);
}

// ─── Tags ───────────────────────────────────────────────────────────────────
const TAG_NAMES = [
  'essential',
  'recurring',
  'luxury',
  'work-related',
  'health',
  'family',
  'personal',
  'planned',
  'impulse',
  'online',
  'cash',
  'seasonal',
  'subscription',
  'one-time',
  'gift',
  'urgent',
  'social',
  'self-care',
];

// Category to tag affinity mapping
const CATEGORY_TAG_AFFINITY: Record<string, string[]> = {
  Groceries: ['essential', 'recurring', 'cash', 'planned', 'family'],
  'Dining Out': ['social', 'luxury', 'impulse', 'personal', 'cash'],
  Transportation: ['essential', 'recurring', 'work-related', 'personal'],
  Rent: ['essential', 'recurring', 'planned'],
  Utilities: ['essential', 'recurring', 'planned'],
  Subscriptions: ['recurring', 'subscription', 'online', 'personal'],
  Travel: ['luxury', 'planned', 'seasonal', 'personal', 'family'],
  Electronics: ['luxury', 'one-time', 'online', 'planned', 'impulse'],
  Healthcare: ['essential', 'health', 'urgent', 'self-care'],
  Clothing: ['personal', 'seasonal', 'impulse', 'luxury', 'online'],
  Education: ['personal', 'planned', 'work-related', 'one-time'],
  'Gifts Given': ['gift', 'family', 'social', 'seasonal'],
  Home: ['essential', 'planned', 'one-time', 'family'],
  'Personal Care': ['self-care', 'recurring', 'personal', 'health'],
  Entertainment: ['social', 'luxury', 'impulse', 'personal', 'online'],
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

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: 'green',
    minPerMonth: 6,
    maxPerMonth: 10,
    minUsd: 15,
    maxUsd: 120,
    descriptions: [
      'Weekly groceries',
      'Fresh produce',
      'Dairy and eggs',
      'Meat and fish',
      'Pantry essentials',
      'Snacks and beverages',
      'Organic food',
      'Frozen meals',
    ],
  },
  {
    name: 'Dining Out',
    icon: 'Utensils',
    color: 'orange',
    minPerMonth: 3,
    maxPerMonth: 7,
    minUsd: 8,
    maxUsd: 85,
    descriptions: [
      'Lunch with coworkers',
      'Dinner date',
      'Coffee shop',
      'Fast food',
      'Pizza delivery',
      'Sushi restaurant',
      'Brunch',
      'Thai takeout',
    ],
  },
  {
    name: 'Transportation',
    icon: 'Car',
    color: 'sky',
    minPerMonth: 3,
    maxPerMonth: 6,
    minUsd: 5,
    maxUsd: 60,
    descriptions: ['Gas fill-up', 'Uber ride', 'Metro card', 'Parking fee', 'Car wash', 'Bus fare', 'Toll fee'],
  },
  {
    name: 'Rent',
    icon: 'Home',
    color: 'blue',
    minPerMonth: 1,
    maxPerMonth: 1,
    minUsd: 1200,
    maxUsd: 1500,
    descriptions: ['Monthly rent'],
  },
  {
    name: 'Utilities',
    icon: 'Zap',
    color: 'amber',
    minPerMonth: 1,
    maxPerMonth: 1,
    minUsd: 80,
    maxUsd: 200,
    descriptions: ['Electricity bill', 'Water bill', 'Gas bill', 'Internet bill'],
  },
  {
    name: 'Subscriptions',
    icon: 'CreditCard',
    color: 'indigo',
    minPerMonth: 1,
    maxPerMonth: 1,
    minUsd: 10,
    maxUsd: 50,
    descriptions: ['Netflix', 'Spotify', 'Cloud storage', 'Gym membership', 'News subscription', 'Software license'],
  },
  {
    name: 'Travel',
    icon: 'Plane',
    color: 'cyan',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 200,
    maxUsd: 2500,
    descriptions: [
      'Flight tickets',
      'Hotel booking',
      'Airbnb stay',
      'Car rental',
      'Travel insurance',
      'Vacation activities',
    ],
  },
  {
    name: 'Electronics',
    icon: 'Laptop',
    color: 'slate',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 30,
    maxUsd: 800,
    descriptions: [
      'Phone accessory',
      'USB cable',
      'Headphones',
      'Keyboard',
      'Monitor',
      'Laptop charger',
      'Smart watch',
    ],
  },
  {
    name: 'Healthcare',
    icon: 'Heart',
    color: 'rose',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 20,
    maxUsd: 300,
    descriptions: ['Doctor visit', 'Pharmacy', 'Dental checkup', 'Eye exam', 'Vitamins', 'Lab tests'],
  },
  {
    name: 'Clothing',
    icon: 'Shirt',
    color: 'violet',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 25,
    maxUsd: 250,
    descriptions: ['Shoes', 'Winter jacket', 'T-shirts', 'Jeans', 'Work clothes', 'Accessories'],
  },
  {
    name: 'Education',
    icon: 'GraduationCap',
    color: 'teal',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 15,
    maxUsd: 500,
    descriptions: ['Online course', 'Books', 'Workshop', 'Certification', 'Udemy course'],
  },
  {
    name: 'Gifts Given',
    icon: 'Gift',
    color: 'pink',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 20,
    maxUsd: 200,
    descriptions: ['Birthday gift', 'Wedding gift', 'Holiday present', 'Baby shower gift', 'Thank you gift'],
  },
  {
    name: 'Home',
    icon: 'Home',
    color: 'emerald',
    minPerMonth: 0,
    maxPerMonth: 0,
    minUsd: 15,
    maxUsd: 400,
    descriptions: [
      'Cleaning supplies',
      'Kitchen gadget',
      'Furniture piece',
      'Light bulbs',
      'Home repair',
      'Decor item',
    ],
  },
  {
    name: 'Personal Care',
    icon: 'Sparkles',
    color: 'lime',
    minPerMonth: 1,
    maxPerMonth: 2,
    minUsd: 10,
    maxUsd: 80,
    descriptions: ['Haircut', 'Skincare products', 'Shampoo and soap', 'Dental care', 'Cologne'],
  },
  {
    name: 'Entertainment',
    icon: 'Film',
    color: 'red',
    minPerMonth: 1,
    maxPerMonth: 3,
    minUsd: 10,
    maxUsd: 100,
    descriptions: ['Movie tickets', 'Concert', 'Video game', 'Board game', 'Bowling night', 'Streaming rental'],
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

const ASSET_DEFS: AssetDef[] = [
  {
    category: 'cash',
    name: 'Emergency Fund',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 5000,
    growth: 1.02,
  },
  {
    category: 'cash',
    name: 'Petty Cash',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 300,
    growth: 1.0,
  },
  {
    category: 'crypto',
    name: 'Bitcoin',
    quantity: 0.15,
    unit: 'BTC',
    baseUnitValueUsd: 30000,
    growth: 1.4,
  },
  {
    category: 'crypto',
    name: 'Ethereum',
    quantity: 2.5,
    unit: 'ETH',
    baseUnitValueUsd: 2000,
    growth: 1.35,
  },
  {
    category: 'commodity',
    name: 'Gold',
    quantity: 10,
    unit: 'grams',
    baseUnitValueUsd: 58,
    growth: 1.08,
  },
  {
    category: 'vehicle',
    name: '2020 Toyota Camry',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 25000,
    growth: 0.88,
  },
  {
    category: 'property',
    name: 'Apartment',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 180000,
    growth: 1.06,
  },
  {
    category: 'bank',
    name: 'Checking Account',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 3500,
    growth: 1.01,
  },
  {
    category: 'bank',
    name: 'High-Yield Savings',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 15000,
    growth: 1.05,
  },
  {
    category: 'investment',
    name: 'Stock Portfolio',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 12000,
    growth: 1.12,
  },
  {
    category: 'investment',
    name: 'Index Fund',
    quantity: 1,
    unit: null,
    baseUnitValueUsd: 8000,
    growth: 1.1,
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
async function seedDemo() {
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

    // 4. Insert expenses (Jan 2021 - Jan 2026 = 61 months)
    console.log('Inserting expenses...');
    const expenseStatements: InStatement[] = [];
    const expenseTagPairs: { expenseIndex: number; tagId: number }[] = [];
    let expenseCount = 0;

    for (let year = 2021; year <= 2026; year++) {
      const maxMonth = year === 2026 ? 1 : 12;
      for (let month = 1; month <= maxMonth; month++) {
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
            const day = randInt(1, 28); // Avoid month-end edge cases
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

    for (let year = 2021; year <= 2026; year++) {
      const maxMonth = year === 2026 ? 1 : 12;
      const baseSalary = 3500 + (year - 2021) * 300;

      for (let month = 1; month <= maxMonth; month++) {
        const rate = getExchangeRate(year, month);

        // Monthly salary
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
            `${year}-${String(month).padStart(2, '0')}-01T09:00:00`,
            `${year}-${String(month).padStart(2, '0')}-01T09:00:00`,
          ],
        });
        incomeCount++;

        // Freelance (~25% chance per month)
        if (rand() < 0.25) {
          const freelanceUsd = randFloat(500, 2500);
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
              `${year}-${String(month).padStart(2, '0')}-15T10:00:00`,
              `${year}-${String(month).padStart(2, '0')}-15T10:00:00`,
            ],
          });
          incomeCount++;
        }

        // Annual investment returns (December)
        if (month === 12) {
          const investmentUsd = randFloat(800, 3000);
          incomeStatements.push({
            sql: `INSERT INTO incomes (userId, amount, currency, entryRate, month, year, incomeType, source, notes, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              userId,
              investmentUsd,
              'USD',
              rate,
              month,
              year,
              'investment',
              'Investment portfolio',
              'Annual dividend/returns',
              `${year}-12-20T10:00:00`,
              `${year}-12-20T10:00:00`,
            ],
          });
          incomeCount++;
        }

        // Birthday gift (March) and holiday gift (December)
        if (month === 3 || month === 12) {
          const giftUsd = randFloat(50, 300);
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
              month === 3 ? 'Family' : 'Friends & Family',
              month === 3 ? 'Birthday gift' : 'Holiday gift',
              `${year}-${String(month).padStart(2, '0')}-${month === 3 ? '15' : '25'}T12:00:00`,
              `${year}-${String(month).padStart(2, '0')}-${month === 3 ? '15' : '25'}T12:00:00`,
            ],
          });
          incomeCount++;
        }
      }
    }

    await executeBatch(client, incomeStatements);
    console.log(`  Created ${incomeCount} income entries`);

    // 7. Insert assets
    console.log('Inserting assets...');
    const assetStatements: InStatement[] = [];
    const now = '2026-01-15T10:00:00';

    for (const asset of ASSET_DEFS) {
      // Current value (after ~5 years of growth)
      const yearsGrown = 5;
      const currentUnitValue = asset.baseUnitValueUsd * Math.pow(asset.growth, yearsGrown);
      const totalValueUsd = parseFloat((asset.quantity * currentUnitValue).toFixed(2));
      const rate = getExchangeRate(2026, 1);

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
          '2021-01-01T10:00:00',
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

      // Semi-annual snapshots: Jan and Jul of each year
      for (let year = 2021; year <= 2026; year++) {
        const months = year === 2026 ? [1] : [1, 7];
        for (const month of months) {
          const yearsElapsed = year - 2021 + (month - 1) / 12;
          const unitValue = asset.baseUnitValueUsd * Math.pow(asset.growth, yearsElapsed);
          // Add some noise to valuations
          const noise = 1 + (rand() - 0.5) * 0.08;
          const noisyUnitValue = parseFloat((unitValue * noise).toFixed(2));
          const totalUsd = parseFloat((asset.quantity * noisyUnitValue).toFixed(2));
          const rate = getExchangeRate(year, month);

          valuationStatements.push({
            sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt, createdAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              assetId,
              asset.quantity,
              noisyUnitValue,
              totalUsd,
              'USD',
              rate,
              `${year}-${String(month).padStart(2, '0')}-15T10:00:00`,
              `${year}-${String(month).padStart(2, '0')}-15T10:00:00`,
            ],
          });
          valuationCount++;
        }
      }
    }

    await executeBatch(client, valuationStatements);
    console.log(`  Created ${valuationCount} asset valuations`);

    // 9. Seed the USD→IRT rate time series so the demo's USD records convert for
    //    display (one row per month, plus a current row for "latest" lookups).
    console.log('Seeding currency rates...');
    const rateStatements: InStatement[] = [];
    const nowIso = new Date().toISOString();
    for (let year = 2021; year <= 2026; year++) {
      const maxMonth = year === 2026 ? 1 : 12;
      for (let month = 1; month <= maxMonth; month++) {
        const rateDate = `${year}-${String(month).padStart(2, '0')}-01`;
        rateStatements.push({
          sql: `INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
                VALUES ('USD', 'IRT', ?, ?, ?)`,
          args: [getExchangeRate(year, month), rateDate, nowIso],
        });
      }
    }
    // A current-dated row so latest-rate lookups resolve.
    rateStatements.push({
      sql: `INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
            VALUES ('USD', 'IRT', ?, ?, ?)`,
      args: [getExchangeRate(2026, 1), nowIso.slice(0, 10), nowIso],
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
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

seedDemo();
