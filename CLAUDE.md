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
- **Transaction Details Modal**: Click any transaction row to view full details in a modal popup
- **Tag Management**: Hybrid tag system with inline quick actions and centralized Settings management

### Tag Management System

Hybrid approach with two interfaces:

**1. Inline (TagInput):** Create/rename on-the-fly, unselect tags (X button), auto-complete, keyboard shortcuts

**2. Settings Page:** View usage stats, search/filter, create/rename/delete with warnings

**Database:** `tags` and `expense_tags` junction table with CASCADE DELETE. Unique per user `(user_id, name)`, case-insensitive duplicates blocked.

**UX:** X on pills = unselect (not delete). Global delete only in Settings with usage count warning.

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
│   │   ├── Button/          # Button with variants (primary, outline, danger)
│   │   ├── Modal/           # Reusable modal/dialog component
│   │   ├── DeleteTagModal/  # Reusable delete confirmation modal
│   │   ├── Tooltip/         # Hover tooltip component
│   │   └── Loading/         # Loading spinner component
│   ├── constants/           # Centralized constants
│   │   ├── assets.ts        # ASSET_CATEGORIES, getAssetCategoryLabel()
│   │   └── income.ts        # INCOME_TYPES, MONTHS, helper functions
│   ├── core/
│   │   └── database/
│   │       ├── client.ts    # Turso database client
│   │       └── migrations/  # SQL migration files
│   ├── features/            # Feature-specific components
│   │   ├── assets/
│   │   ├── expenses/
│   │   │   └── components/
│   │   │       ├── ExpenseForm/            # Add/edit expense form
│   │   │       ├── ExpenseList/            # Transaction list with infinite scroll
│   │   │       ├── TransactionDetailsModal/ # Modal for viewing transaction details
│   │   │       ├── TagInput/               # Tag selector/creator with inline actions
│   │   │       └── TagManagementList/      # Centralized tag management for Settings
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

### TypeScript Types

Tag-related types in `src/@types/expense.ts`:

```typescript
export interface Tag { id: number; name: string; created_at: string; }
export interface TagWithUsage extends Tag { usage_count: number; }
export interface UpdateTagInput { name: string; }
export interface Expense { ...; tags?: Tag[]; } // Always optional
```

Use `Tag` for basic ops, `TagWithUsage` for Settings. Keep types in `@types/` directory.

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

### UI/UX - Modal Component

Use the reusable Modal component (`src/components/Modal/`) for dialogs and popups:

```tsx
import Modal from '@/components/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  titleFa="عنوان فارسی" // Optional Farsi subtitle
>
  {/* Modal content */}
</Modal>;
```

**Modal features:**

- Light theme with white background, `#fafafa` header
- ESC key to close
- Click outside (backdrop) to close
- Focus management (auto-focuses modal on open)
- Body scroll lock when open
- Responsive padding (smaller on mobile)

**Creating detail modals (like TransactionDetailsModal):**

- Use a `DetailRow` pattern for consistent item layout
- Icon box on left with border and subtle background
- Label (English + Farsi) above the value
- Use dividers (`border-t border-[#e5e5e5]`) to group related items
- Handle long text with `break-words`

```tsx
// DetailRow pattern
<div className="flex items-start gap-3 sm:gap-4">
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa]">
    <Icon className="h-4 w-4 text-[#525252]" />
  </div>
  <div className="min-w-0 flex-1">
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[#a3a3a3]">Label</span>
      <span className="text-xs text-[#a3a3a3]" dir="rtl">
        برچسب
      </span>
    </div>
    <div className="mt-1 text-sm font-medium text-[#171717]">{value}</div>
  </div>
</div>
```

### UI/UX - Accessibility

Follow these accessibility patterns:

- **Modals**: Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title
- **Decorative icons**: Add `aria-hidden="true"` to icons that don't convey meaning
- **Close buttons**: Include `aria-label="Close modal"`
- **Focus states**: Use visible focus rings (`focus:ring-2 focus:ring-[#171717] focus:ring-offset-2 focus:outline-none`)
- **Semantic HTML**: Use `<time>` with `dateTime` attribute, `role="separator"` for dividers
- **Keyboard navigation**: Support ESC to close modals, Tab for focus navigation

### UI/UX - Mobile Responsiveness

Use responsive Tailwind classes for mobile-first design:

- **Padding**: `px-4 py-3 sm:px-6 sm:py-4` (smaller on mobile)
- **Gaps**: `gap-3 sm:gap-4` or `gap-5 sm:gap-6`
- **Text sizes**: `text-base sm:text-lg` for headings
- **Icon sizes**: `h-9 w-9 sm:h-10 sm:w-10`
- **Flex wrapping**: `flex-wrap` with `gap-x-2 gap-y-1` for bilingual text

```tsx
// Responsive pattern example
<div className="px-4 py-4 sm:px-6 sm:py-5">
  <h2 className="text-base font-semibold sm:text-lg">Title</h2>
</div>
```

### Styling with Tailwind

- Use Tailwind utility classes directly
- Prefer Tailwind classes over inline styles
- Use consistent color palette:
  - `#171717` - Primary text, black buttons
  - `#525252` - Muted text, secondary content
  - `#a3a3a3` - Subtle text, labels
  - `#6b7280` - Gray text
  - `#e5e5e5` - Borders, dividers
  - `#fafafa` - Light backgrounds (headers, icon boxes)
  - `#f5f5f5` - Hover states, tag backgrounds
  - `#0070f3` - Blue links, primary actions
  - `#10b981` - Success states
  - `#ea001d` - Error states, danger actions (use `#AE292E` for hover)

### UI/UX - Icon Consistency

**ALWAYS use these standardized icons from lucide-react:**

- **Edit/Rename**: `Edit2` (never use `Edit`, `Pencil`, or other variants)
- **Delete/Remove**: `Trash2` (never use `Trash`, `Delete`, or `X` for delete actions)
- **Close/Cancel**: `X`
- **Save/Confirm**: `Check`
- **Add/Create**: `Plus`
- **Loading**: `Loader2` with `animate-spin`

```tsx
import { Check, Edit2, Loader2, Plus, Trash2, X } from 'lucide-react';
```

### UI/UX - Action Button Patterns

All action buttons (edit, delete, save, cancel) MUST use this standardized clean style:

```tsx
// Edit button (blue hover)
<button
  onClick={handleEdit}
  className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#0070f3]/10 hover:text-[#0070f3]"
  title="Edit"
>
  <Edit2 className="h-4 w-4" />
</button>

// Delete button (red hover)
<button
  onClick={handleDelete}
  className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#ea001d]/10 hover:text-[#ea001d]"
  title="Delete"
>
  <Trash2 className="h-4 w-4" />
</button>

// Save button (green hover)
<button
  onClick={handleSave}
  disabled={isSaving}
  className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#10b981]/10 hover:text-[#10b981] disabled:opacity-50"
  title="Save"
>
  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
</button>

// Cancel button (gray hover)
<button
  onClick={handleCancel}
  className="rounded-lg p-2 text-[#a3a3a3] transition-all duration-200 hover:bg-[#f5f5f5] hover:text-[#525252]"
  title="Cancel"
>
  <X className="h-4 w-4" />
</button>
```

**Action Button Guidelines:**

- NO borders (borderless design for cleaner look)
- Use `p-2` padding (not fixed width/height like `h-9 w-9`)
- Start with `text-[#a3a3a3]` (gray/muted state)
- Hover shows colored background (10% opacity) + colored icon
- Always include `title` attribute for accessibility
- Always include `aria-label` for screen readers
- Use `disabled:opacity-50` for disabled states

### UI/UX - Delete Confirmation Pattern

For destructive actions, use `DeleteTagModal` component:

```tsx
import DeleteTagModal from '@/components/DeleteTagModal';

const [deletingItem, setDeletingItem] = useState<Item | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

const confirmDelete = async () => {
  setIsDeleting(true);
  const response = await fetch(`/api/items/${deletingItem.id}`, { method: 'DELETE' });
  if (response.ok) setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
  setIsDeleting(false);
  setDeletingItem(null);
};

<DeleteTagModal
  isOpen={!!deletingItem}
  tag={deletingItem}
  usageCount={deletingItem?.usage_count || 0}
  onConfirm={confirmDelete}
  onCancel={() => setDeletingItem(null)}
  isDeleting={isDeleting}
/>;
```

**Guidelines:** Show usage impact, use `#ea001d` color, disable during deletion

### UI/UX - Inline Editing Pattern

For inline editing (renaming):

```tsx
const [editingId, setEditingId] = useState<number | null>(null);
const [editingName, setEditingName] = useState('');
const [editError, setEditError] = useState('');

const saveEdit = async (id: number) => {
  if (!editingName.trim()) return setEditError('Name required');

  const isDuplicate = items.some(
    (item) => item.id !== id && item.name.toLowerCase() === editingName.trim().toLowerCase()
  );
  if (isDuplicate) return setEditError(`"${editingName.trim()}" exists`);

  const res = await fetch(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: editingName.trim() }),
  });
  if (res.ok) setItems((prev) => prev.map((i) => (i.id === id ? await res.json() : i)));
};

// Keyboard: Enter saves, Escape cancels
<input
  value={editingName}
  onChange={(e) => setEditingName(e.target.value)}
  onKeyDown={(e) => (e.key === 'Enter' ? saveEdit(id) : e.key === 'Escape' && cancelEdit())}
  autoFocus
  className="rounded border border-[#0070f3] px-2 py-1 text-sm outline-none"
/>;
{
  editError && <p className="text-xs text-[#ea001d]">{editError}</p>;
}
```

**Guidelines:** Enter/Escape keys, auto-focus, blue border, case-insensitive duplicate check, trim values

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

### Tags

- `GET /api/tags` - List all tags for current user (supports `?includeUsage=true` for usage counts)
- `POST /api/tags` - Create new tag (returns existing if duplicate)
- `PUT /api/tags/[id]` - Update tag name (validates for duplicates)
- `DELETE /api/tags/[id]` - Delete tag (CASCADE removes from all expenses)

**Tag API Usage:**

```typescript
// GET with counts: /api/tags?includeUsage=true → [{ id, name, created_at, usage_count }]
// POST: Returns existing if duplicate (case-insensitive)
// PUT: Returns 409 if duplicate exists
// DELETE: Returns { success, usageCount }, CASCADE removes from expense_tags
```

### Summary

- `GET /api/summary` - Financial overview (current month income/expenses, total assets, net worth, charts data)

## Database Schema

### Database Relationships and CASCADE DELETE

The database uses CASCADE DELETE to maintain referential integrity:

**Tags System:**

```sql
-- Tags table with unique constraint per user
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Junction table with CASCADE on both foreign keys
CREATE TABLE expense_tags (
  expense_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (expense_id, tag_id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

**CASCADE DELETE Behavior:**

- Deleting a user → deletes all their tags, expenses, assets, etc.
- Deleting an expense → removes all tag associations in `expense_tags`
- Deleting a tag → removes all expense associations in `expense_tags`
- No orphaned records in junction tables

**Important:**

- Database handles CASCADE automatically
- Application layer only needs to delete the parent record
- No manual cleanup of junction table entries required
- Always fetch usage counts BEFORE deletion for user feedback

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

## Component Patterns

### Button Component

The `Button` component (`src/components/Button/`) supports three variants:

```tsx
import Button from '@/components/Button';

// Primary button (black background, white text)
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Outline button (white background, bordered)
<Button variant="outline" onClick={handleClick}>
  Cancel
</Button>

// Danger button (outlined with red hover)
<Button variant="danger" onClick={handleClick}>
  Delete All Data
</Button>
```

**Button Variant Styles:**

- **primary**: `bg-[#000000] hover:bg-[#171717] text-white`
- **outline**: `bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] text-[#525252] hover:text-[#171717]`
- **danger**: `bg-white hover:bg-[#ea001d]/10 border border-[#e5e5e5] hover:border-[#ea001d] text-[#525252] hover:text-[#ea001d]`

**Note:** For solid red/danger buttons (like delete confirmations), override with custom classes:

```tsx
<Button variant="primary" className="bg-[#ea001d] hover:bg-[#AE292E]">
  Delete Tag
</Button>
```

### Next.js 16 API Route Patterns

In Next.js 16, route `params` are now async and must be awaited:

```typescript
// CORRECT - Next.js 16
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tagId = parseInt(id, 10);
  // ... rest of handler
}

// WRONG - Old Next.js pattern
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const tagId = parseInt(params.id, 10); // TypeScript error!
  // ...
}
```

**Always:**

- Type `params` as `Promise<{ param: string }>`
- Await params before using: `const { id } = await params;`
- Parse route parameters immediately after awaiting
