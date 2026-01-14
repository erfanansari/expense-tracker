# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal finance tracker application built with Next.js 16, using the App Router architecture. The stack includes:

- **Framework**: Next.js 16.0.10 (React 19.2.3)
- **Language**: TypeScript with strict mode enabled
- **Database**: Turso (libSQL) via `@libsql/client`
- **Styling**: Tailwind CSS v4 (using new PostCSS plugin architecture)
- **Package Manager**: pnpm 10.24.0
- **Fonts**: Geist Sans and Geist Mono (via next/font)
- **Charts**: Recharts for data visualization

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Database management
pnpm migrate       # Run database migration
pnpm db:test       # Test database connection and verify tables
```

## Application Features

### Core Features

- **Expenses**: Track daily expenses with categories, descriptions, and dual currency (USD/Toman)
- **Income**: Track monthly income by type (salary, freelance, investment, gift, other)
- **Assets**: Track wealth portfolio across 7 categories (cash, crypto, commodity, vehicle, property, bank, investment)
- **Dashboard**: Overview with financial summaries, income vs expenses charts, asset distribution
- **Reports**: Spending analysis with charts and heatmaps
- **Exchange Rate**: Live USD/Toman exchange rate integration

### Asset Categories

Assets are organized into 7 simple categories. Users provide custom names for their assets:

- `cash` - Cash holdings
- `crypto` - Cryptocurrency (BTC, ETH, etc.)
- `commodity` - Gold, silver, etc.
- `vehicle` - Cars, motorcycles, etc.
- `property` - Real estate
- `bank` - Bank accounts
- `investment` - Stocks, bonds, etc.

### Income Types

- `salary` - Regular employment income
- `freelance` - Contract/freelance work
- `investment` - Investment returns
- `gift` - Gifts received
- `other` - Other income sources

## Project Structure

```
kharji/
├── src/
│   ├── @types/              # TypeScript type definitions
│   │   ├── asset.ts         # Asset, AssetCategory types
│   │   ├── income.ts        # Income, IncomeType types
│   │   └── index.ts         # Shared types
│   ├── app/
│   │   ├── (auth)/          # Auth route group
│   │   │   ├── login/       # Login page
│   │   │   ├── signup/      # Signup page
│   │   │   ├── forgot-password/  # Forgot password page
│   │   │   └── layout.tsx   # Shared auth layout
│   │   ├── (dashboard)/     # Dashboard route group
│   │   │   ├── income/      # Income tracking page
│   │   │   └── overview/    # Dashboard overview
│   │   ├── api/             # API routes
│   │   │   ├── assets/      # Asset CRUD endpoints
│   │   │   ├── incomes/     # Income CRUD endpoints
│   │   │   ├── expenses/    # Expense CRUD endpoints
│   │   │   └── summary/     # Financial summary endpoint
│   │   ├── assets/          # Assets page
│   │   ├── reports/         # Reports page
│   │   └── transactions/    # Transactions page
│   ├── components/          # Shared UI components
│   ├── constants/           # Centralized constants
│   │   ├── assets.ts        # ASSET_CATEGORIES, getAssetCategoryLabel()
│   │   └── income.ts        # INCOME_TYPES, MONTHS, helper functions
│   ├── core/
│   │   └── database/
│   │       ├── client.ts    # Turso database client
│   │       └── migrations/  # SQL migration files
│   ├── features/            # Feature-specific components
│   │   ├── assets/
│   │   └── income/
│   └── utils/               # Utility functions
```

## Code Standards

### Database Schema - Use camelCase

All database field names MUST use camelCase (not snake_case):

```sql
-- CORRECT
CREATE TABLE incomes (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  amountUsd REAL NOT NULL,
  amountToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  incomeType TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- WRONG (don't use snake_case)
CREATE TABLE incomes (
  user_id INTEGER,
  amount_usd REAL,
  created_at TEXT
);
```

### DRY - Don't Repeat Yourself

**Always use centralized constants** - never duplicate category/type definitions:

```typescript
// CORRECT - Import from constants
import { ASSET_CATEGORIES } from '@/constants/assets';
import { INCOME_TYPES } from '@/constants/income';

const validCategories = ASSET_CATEGORIES.map((c) => c.value);

// WRONG - Don't hardcode arrays
const validCategories = ['cash', 'crypto', 'commodity']; // Never do this!
```

Constants files:

- `src/constants/assets.ts` - `ASSET_CATEGORIES`, `getAssetCategoryLabel()`
- `src/constants/income.ts` - `INCOME_TYPES`, `MONTHS`, `getIncomeTypeLabel()`, `getMonthLabel()`

### UI/UX - Table Alignment

Tables MUST use fixed layout with percentage widths for proper column alignment:

```tsx
<table className="w-full table-fixed border-collapse">
  <thead>
    <tr>
      <th className="w-[35%] ...">Column 1</th>
      <th className="w-[25%] ...">Column 2</th>
      <th className="w-[25%] ...">Column 3</th>
      <th className="w-[15%] ...">Actions</th>
    </tr>
  </thead>
</table>
```

### UI/UX - Auth Pages Design

Auth pages (login, signup, forgot-password) follow a consistent design:

- **Logo**: Zap icon in black box (`bg-[#171717]`) with "Kharji" text side by side
- **Subtitle**: "Personal Finance Tracker" in muted gray
- **Card**: White background with subtle border and shadow
- **Inputs**: Rounded corners, `border-[#e5e5e5]`, focus state `border-[#171717]`
- **Password fields**: Include eye icon toggle for show/hide
- **Primary buttons**: Black background (`bg-[#171717]`), white text
- **Secondary buttons**: White with border (outlined style)
- **Links**: Use `text-[#171717]` with `font-semibold` for dark links, `text-[#6b7280]` for muted text
- **Footer links**: Placed outside the card (e.g., "Don't have an account? Sign up")

```tsx
// Logo pattern
<div className="flex items-center gap-2">
  <div className="rounded-md bg-[#171717] p-2">
    <Zap className="h-5 w-5 text-white" />
  </div>
  <span className="text-xl font-bold text-[#171717]">Kharji</span>
</div>

// Black button
<button className="w-full rounded-lg bg-[#171717] px-4 py-3 font-medium text-white hover:bg-[#404040]">
  Sign In
</button>

// Outlined button
<button className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 font-medium text-[#171717] hover:bg-[#fafafa]">
  Continue with Demo
</button>
```

### Styling with Tailwind

- Use Tailwind utility classes directly
- Prefer Tailwind classes over inline styles
- Use consistent color palette: `#171717` (text/primary), `#525252` (muted), `#a3a3a3` (subtle), `#6b7280` (gray text), `#0070f3` (blue links), `#10b981` (success), `#ef4444` (error)

## API Routes

### Expenses

- `GET /api/expenses` - List expenses with optional date filters
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Incomes

- `GET /api/incomes` - List incomes with optional year/month filters
- `POST /api/incomes` - Create income entry
- `GET /api/incomes/[id]` - Get single income
- `PUT /api/incomes/[id]` - Update income
- `DELETE /api/incomes/[id]` - Delete income

### Assets

- `GET /api/assets` - List all assets (optionally filter by category)
- `POST /api/assets` - Create asset (also creates initial valuation snapshot)
- `GET /api/assets/[id]` - Get asset with valuation history
- `PUT /api/assets/[id]` - Update asset (creates valuation snapshot if value changed)
- `DELETE /api/assets/[id]` - Delete asset and valuations

### Summary

- `GET /api/summary` - Financial overview (current month income/expenses, total assets, net worth, charts data)

## Database Schema

### users table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### incomes table

```sql
CREATE TABLE incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  amountUsd REAL NOT NULL,
  amountToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  incomeType TEXT NOT NULL,
  source TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### assets table

```sql
CREATE TABLE assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT,
  unitValueUsd REAL,
  totalValueUsd REAL NOT NULL,
  totalValueToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  notes TEXT,
  lastValuedAt TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### assetValuations table

```sql
CREATE TABLE assetValuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assetId INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unitValueUsd REAL,
  totalValueUsd REAL NOT NULL,
  totalValueToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  valuedAt TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### TypeScript

- Target: ES2017
- Strict mode: enabled
- Path alias: `@/*` maps to `src/*`

### Database (Turso/libSQL)

Environment variables in `.env.local`:

- `TURSO_DATABASE_URL`: Connection URL
- `TURSO_AUTH_TOKEN`: Authentication token

### ESLint

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

## Important Conventions

- Always use `pnpm` for package management
- Follow Next.js 16 App Router conventions
- TypeScript strict mode - all code must pass type checking
- Database fields use camelCase
- Reuse constants from `src/constants/` - never hardcode categories/types
- Tables use `table-fixed` with percentage widths for alignment
- Bilingual support: English labels with Persian (Farsi) translations
