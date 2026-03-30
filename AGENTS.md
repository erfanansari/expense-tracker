# AGENTS.md

This document provides AI coding agents with the context needed to work effectively in the Kharji codebase.

---

## Business Domain

Kharji is a **personal finance tracker** for Persian-speaking users. It tracks expenses, income, and assets with multi-currency support and Jalali (Persian) calendar.

### Core Entities

| Entity      | Purpose                                                               |
| ----------- | --------------------------------------------------------------------- |
| **Expense** | Spending record with amount, category, tags, optional exchange rate   |
| **Income**  | Income record with source type, amount, currency                      |
| **Asset**   | Owned asset (property, vehicle, investment) with valuations over time |
| **Tag**     | User-defined label attached to expenses for finer categorization      |
| **Summary** | Aggregated totals across all domains (used by Overview page)          |

### Key Domain Rules

- All monetary values are stored in the user's base currency; foreign amounts carry a `amountUsd` equivalent
- Exchange rates can be fetched automatically or overridden by the user (`useExchangeRateForm`)
- Dates are displayed in Jalali format using helpers in `src/utils/date/`
- The app is bilingual: every category/type constant has both an English label and a Persian (`labelFa`) translation
- All data is user-scoped — every DB query filters by `user_id` (enforced via `verifyOwnership`)

---

## Technology Stack

| Library                  | Version | Purpose                                       |
| ------------------------ | ------- | --------------------------------------------- |
| **Next.js**              | 16.x    | App Router, SSR, file-based routing           |
| **React**                | 19.x    | UI library                                    |
| **TypeScript**           | 5.x     | Static typing (strict mode enabled)           |
| **Tailwind CSS**         | 4.x     | Utility-first styling via PostCSS plugin      |
| **TanStack React Query** | 5.x     | Server state management (queries & mutations) |
| **Zod**                  | 3.x     | Runtime schema validation & type inference    |
| **tailwind-merge**       | 3.x     | Safe Tailwind class merging                   |
| **recharts**             | 3.x     | Charts and data visualization                 |
| **lucide-react**         | latest  | Icon library                                  |
| **Turso (libSQL)**       | latest  | Database (SQLite-compatible)                  |
| **jose**                 | latest  | JWT token handling                            |

### Tooling

| Tool           | Purpose         |
| -------------- | --------------- |
| **pnpm** 10.x  | Package manager |
| **ESLint** 9.x | Linting         |

---

## Project Structure

```
src/
├── @types/              TypeScript type definitions
├── @schemas/            Zod validation schemas
├── app/                 Next.js App Router
│   ├── (auth)/          Auth route group (login, signup, forgot-password)
│   ├── (dashboard)/     Dashboard route group (overview, income, transactions, etc.)
│   └── api/             API routes
├── components/          Shared UI components (no business logic)
├── configs/             App configuration (auth, etc.)
├── constants/           Centralized constants (categories, income types)
├── core/                Framework modules (database, auth, session)
├── features/            Domain-specific feature modules
│   ├── pages/           Page-level feature modules (see Feature Module Structure)
│   │   ├── Transactions/  Transactions page (sub-components, constants, types)
│   │   ├── Income/        Income page
│   │   ├── Assets/        Assets page
│   │   ├── Overview/      Dashboard overview page
│   │   ├── Reports/       Reports page
│   │   └── Settings/      Settings page
│   ├── assets/          Asset domain (shared components, hooks, utils)
│   ├── expenses/        Expense domain (shared components, hooks, utils)
│   ├── income/          Income domain (shared components, hooks, utils)
│   └── Providers/       Centralized provider composition (Query, CommandPalette, Toast)
├── hooks/               Global custom React hooks
├── lib/                 API client functions and query keys
├── styles/              Global CSS with theme tokens
└── utils/               Domain-organized utility functions
    ├── category/        Category label helpers
    ├── date/            Jalali/Farsi date helpers
    ├── error/           ensureError (re-exports from @core/errors)
    └── format/          Number formatting
```

---

## Feature Module Structure

Each feature module under `src/features/` follows a standard sub-folder layout. Only include folders that have content.

### Page Features (`src/features/pages/{PageName}/`)

Page features compose the full page UI from Card/section components:

```
src/features/pages/Transactions/
├── @types/
│   └── index.ts              # Props, local interfaces
├── components/
│   ├── TransactionsTable/
│   │   └── index.tsx
│   └── TransactionsFilters/
│       └── index.tsx
├── constants/
│   └── index.ts              # Page-specific constants (column defs, filter options)
└── index.tsx                  # Composes sub-components into full page layout
```

The page `index.tsx` is a **composition file** — it holds shared state/queries and passes data down to sub-components:

```typescript
const TransactionsPage = () => {
  // Queries
  const { data: expenses } = useExpenses();

  // Customs
  const deleteConfirmation = useDeleteConfirmation({ ... });

  return (
    <div>
      <TransactionsTable expenses={expenses} onDelete={deleteConfirmation.openModal} />
    </div>
  );
};
export default TransactionsPage;
```

### Domain Features (`src/features/{domain}/`)

Domain features contain shared components, hooks, and utilities for a business domain:

```
src/features/expenses/
├── @types/
│   └── index.ts
├── components/
│   ├── ExpenseForm/
│   │   └── index.tsx
│   ├── TagInput/
│   │   └── index.tsx
│   └── TagManagementList/
│       └── index.tsx
├── hooks/
│   └── index.ts              # Domain-specific hooks
├── constants/
│   └── index.ts
└── utils/
    └── index.ts
```

### Rules

- Only create sub-folders that have content (no empty placeholder folders)
- Page `index.tsx` is a composition file — logic + state lives here, sub-components receive props
- Helper components (skeletons, tooltips) stay as function declarations inside the file that uses them
- Column builder functions go in `constants/index.ts` when they are large, or stay in the component file when small

### Adding a New Page

Follow this exact sequence:

1. **App router entry** — `src/app/(dashboard)/[route]/page.tsx`:

   ```typescript
   import type { Metadata } from 'next';
   import MyFeature from '@features/pages/MyFeature';

   export const metadata: Metadata = { title: 'My Feature' };
   const MyFeaturePage = () => <MyFeature />;
   export default MyFeaturePage;
   ```

2. **Feature module** — `src/features/pages/MyFeature/index.tsx` (composition root: queries, state here; sub-components receive props)

3. **API route** — `src/app/api/my-feature/route.ts` using `withAuth` wrapper (see API Route Pattern)

4. **Client API functions** — `src/lib/api/my-feature.ts` using `apiFetch` / `apiMutate`

5. **Query keys** — add to `src/lib/query-keys.ts` under a new domain key

6. **Mutation hooks** — add to `src/hooks/use-my-feature.ts` using `useMutationWithInvalidation`

7. **Navigation** — add link to the sidebar/nav component if the page should appear in the menu

---

## Code Style

### Component / Hook Body Structure

Use **section comments** to organize the body of every component and hook. Each section is a single-line `// SectionName` comment. Only include sections that are actually used in that component.

**Canonical order:**

```typescript
const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  // States
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // References
  const inputRef = useRef<HTMLInputElement>(null);

  // Customs
  const { showToast } = useToast();
  const { user } = useAuth();

  // Variables
  const isValid = value.trim().length > 0;
  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

  // Queries
  const { data: expenses, isLoading } = useQuery({ ... });

  // Mutations
  const createExpense = useCreateExpense();

  // Memos
  const sortedItems = useMemo(() => items.sort(...), [items]);

  // Callbacks
  const handleSubmit = useCallback(async () => { ... }, []);
  const handleClose = () => { ... };

  // Effects
  useEffect(() => { ... }, [dependency]);

  // Early returns (loading, error, empty)
  if (isLoading) return <Skeleton />;

  return ( ... );
};

export default MyComponent;
```

**Section labels reference:**

| Label           | What goes under it                                              |
| --------------- | --------------------------------------------------------------- |
| `// States`     | `useState` declarations                                         |
| `// References` | `useRef` declarations                                           |
| `// Customs`    | Project custom hooks (`useAuth`, `useToast`, `useRouter`, etc.) |
| `// Variables`  | Derived/computed values, plain `const` from state/props         |
| `// Queries`    | `useQuery` / `useInfiniteQuery` calls                           |
| `// Mutations`  | `useMutation` / mutation hook calls                             |
| `// Forms`      | `useForm` setup (if using form hooks in the future)             |
| `// Memos`      | `useMemo` calls                                                 |
| `// Callbacks`  | `useCallback`, event handlers, async functions                  |
| `// Effects`    | `useEffect` calls                                               |

**Rules:**

- Only include a section if it has at least one item
- A section label can appear more than once if readability benefits (e.g., a second `// Variables` block after queries for derived query data)
- No blank line between the section comment and its first item
- One blank line between sections

### Function Style

- **Components**: Arrow functions with separate `export default` at end of file
- **Helper/internal components** (skeletons, tooltips): Function declarations (`function HelperName() { ... }`) — no export
- **Column builders and pure helpers**: Function declarations
- **Hooks**: Arrow functions with `export default` for feature hooks; named exports for global hooks (`export const useCreateAsset = () => ...`)

```typescript
// Main component — arrow function + export default
const IncomePage = () => {
  // ...
};
export default IncomePage;

// Helper component — function declaration, no export
function IncomeSkeleton() {
  return ( ... );
}

// Column builder — function declaration
function buildIncomeColumns(...): ColumnDef<Income>[] {
  return [ ... ];
}
```

### Import Organization

Imports are organized into **3 groups**, separated by blank lines:

```typescript
// Group 1: Third-party packages (react first, then alphabetical)
'use client';

import { useCallback, useMemo, useState } from 'react';

import { type ColumnDef } from '@tanstack/react-table';
import { FileText, Loader2, Plus } from 'lucide-react';

// Group 2: Internal path aliases (@types, @schemas, @constants, @core, @features, @components, @hooks, @utils, @/lib, etc.)
import type { Income } from '@types';

import IncomeForm from '@features/income/components/IncomeForm';

import ActionButtons from '@components/ActionButtons';
import Button from '@components/Button';

import { useDeleteIncome, useIncomes } from '@hooks/use-incomes';

import { ensureError, formatNumber } from '@utils';

import { queryKeys } from '@/lib/query-keys';

// Group 3: Relative imports (parent `..` first, then current `.`)
import type { QuickTransferFormProps } from '../../@types';
import { FORM_DEFAULT_VALUES } from '../../constants';
```

**Rules:**

- Always use `import type { Foo }` for type-only imports (never `import { type Foo }`)
- Within each group, `type` imports can be interleaved with value imports from the same module
- `'use client'` directive goes at the very top, before any imports

### Export Conventions

| What               | Pattern                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| Page components    | `const PageName = () => { ... }; export default PageName;`                        |
| Feature components | `const Component = ({ ... }: Props) => { ... }; export default Component;`        |
| Helper components  | `function HelperName() { ... }` (no export)                                       |
| Global hooks       | `export function useHookName() { ... }` or `export const useHookName = () => ...` |
| Feature hooks      | `const useHookName = () => { ... }; export default useHookName;`                  |
| Utility functions  | Named exports from `index.ts`                                                     |
| Constants          | Named exports (`export const CONSTANT_NAME = ...`)                                |
| Types              | `export type` / `export interface` from `@types/` files                           |

---

## Architecture Rules

### Thin Pages

Pages in `src/app/` are thin wrappers — metadata + feature component import. All logic lives in `src/features/pages/`.

```typescript
// src/app/(dashboard)/income/page.tsx
import Income from '@features/pages/Income';
export const metadata: Metadata = { title: 'Income' };
const IncomePage = () => <Income />;
export default IncomePage;
```

### Import Aliases

Use short aliases when available. Use `@/` only for paths without a short alias.

| Alias           | Path                     |
| --------------- | ------------------------ |
| `@types`        | `src/@types/index.ts`    |
| `@schemas`      | `src/@schemas/index.ts`  |
| `@components/*` | `src/components/*`       |
| `@features/*`   | `src/features/*`         |
| `@hooks/*`      | `src/hooks/*`            |
| `@constants`    | `src/constants/index.ts` |
| `@constants/*`  | `src/constants/*`        |
| `@core/*`       | `src/core/*`             |
| `@configs`      | `src/configs/index.ts`   |
| `@configs/*`    | `src/configs/*`          |
| `@utils`        | `src/utils/index.ts`     |
| `@utils/*`      | `src/utils/*`            |
| `@/*`           | `src/*` (fallback)       |

**Use `@/` only for:** `@/lib/*`, `@/styles/*`, `@/@types/*` (specific type files), `@/app/*`

### Session Management

Use `createSession()` / `deleteSession()` / `getCurrentUser()` from `@core/session/session` for all auth operations. Never construct cookie strings manually.

### Database Column Access

Always use named column access (`row.id`, `row.user_id`), never index-based access (`row[0]`).

### Theme Tokens

All colors must use semantic theme tokens from `src/styles/globals.css`. Never hardcode hex colors in components.

### Class Merging

Use `twMerge` from `tailwind-merge` for dynamic class composition. Never use template literals for conditional classes.

### Delete Confirmation

Use `useDeleteConfirmation` hook from `@hooks/use-delete-confirmation` instead of duplicating modal state management.

### Action Buttons

Use the `ActionButtons` component from `@components/ActionButtons` for edit+delete button pairs in table action columns:

```typescript
import ActionButtons from '@components/ActionButtons';

<ActionButtons
  onEdit={() => handleEdit(item)}
  onDelete={() => openDeleteModal(item)}
  isDeleting={deletingId === item.id}
  editTitle="Update Value" // optional, defaults to "Edit"
/>
```

### Exchange Rate Forms

Use `useExchangeRateForm` hook from `@hooks/use-exchange-rate-form` for forms needing exchange rate fetching + user override.

### API Route Pattern

All protected API routes use the `withAuth` wrapper from `@core/api/utils`. This eliminates manual auth checks, try-catch, and error logging.

```typescript
import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';

// Collection route (no params)
export const GET = withAuth(async (user, request) => {
  // user is guaranteed to be authenticated
  return NextResponse.json(data);
}, 'FeatureName');

// Item route (with [id] param)
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('tableName', id, user.userId);
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const result = validateBody(schema, raw);
  if (result instanceof NextResponse) return result;

  // ... business logic with result.data
}, 'FeatureName');
```

**Utilities in `@core/api/utils`:**

| Utility                                    | Purpose                                                              |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `withAuth(handler, label?)`                | Wraps handler with auth check + try-catch + error logging            |
| `parseIdParam(params)`                     | Validates async `[id]` param, returns `number \| NextResponse`       |
| `verifyOwnership(table, id, userId, col?)` | Checks record exists and belongs to user, returns row or 404         |
| `validateBody(schema, body)`               | Zod `safeParse` + error response, returns `{ data } \| NextResponse` |
| `getSearchParams(request)`                 | Safe URL search params extraction with fallback                      |

**Tag helpers in `@core/database/tags`:**

| Helper                            | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `fetchTagsForExpenses(ids)`       | Bulk-fetch tags for expense list (avoids N+1)       |
| `assignTagsToExpense(id, tagIds)` | Replace all tags for an expense (delete + reinsert) |

**Row mappers in `@core/database/mappers`:**

| Mapper                        | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `mapRowToIncome(row)`         | Maps DB row → `Income` type            |
| `mapRowToAsset(row)`          | Maps DB row → `Asset` type             |
| `mapRowToAssetValuation`      | Maps DB row → `AssetValuation` type    |
| `mapRowToExpense(row, tags?)` | Maps DB row → `Expense` type with tags |

Always use mappers instead of inline row-to-type casts. Single source of truth for field mapping.

### Client API Pattern

All client-side API calls use `apiFetch` / `apiMutate` from `src/lib/api/client.ts`.

```typescript
import { apiFetch, apiMutate } from './client';

// GET requests
export const fetchItems = () => apiFetch<Item[]>('/api/items');

// POST/PUT/DELETE requests
export const createItem = (data: CreateInput) => apiMutate<Item>('/api/items', 'POST', data);

export const deleteItem = (id: number) => apiMutate<void>(`/api/items/${id}`, 'DELETE');
```

- `apiFetch<T>(url, options?)` — for GET requests, returns typed JSON
- `apiMutate<T>(url, method, body?)` — for POST/PUT/DELETE, auto-sets headers and stringifies body
- Both throw `ApiError` (with `.message` and `.status`) on non-ok responses

### React Query Conventions

Query keys are defined in `src/lib/query-keys.ts`. Always use the factory functions:

```typescript
import { queryKeys } from '@/lib/query-keys';

// Query
useQuery({ queryKey: queryKeys.expenses.all(), queryFn: fetchAllExpenses });
```

**Key structure:** `[domain, variant?]` — e.g., `['expenses']`, `['expenses', 'paginated']`, `['tags', 'withUsage']`

**Invalidation rules:** Mutations that change data must invalidate related queries. Expense mutations should also invalidate `summary`.

#### Mutation Hook Factory

Use `useMutationWithInvalidation` from `@/hooks/use-mutation-with-invalidation` for all mutation hooks. Never manually wire `useQueryClient` + `useMutation` + `invalidateQueries`:

```typescript
import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const INVALIDATION_KEYS = [queryKeys.assets.all(), queryKeys.summary.all()] as const;

// One-liner instead of 10 lines
export const useCreateAsset = () => useMutationWithInvalidation(createAsset, INVALIDATION_KEYS);
```

### Error Handling

Use `ensureError` from `@utils` in catch blocks instead of `instanceof Error` checks:

```typescript
import { ensureError } from '@utils';

try {
  await someAction();
} catch (err) {
  showToast(ensureError(err).message, 'error');
}
```

### Error Class Hierarchy

Custom errors live in `src/core/errors/` and extend from `AppError`:

```
AppError (base — has `code` property)
├── ApiError (adds `status: number`)
└── ValidationError (adds `field: string`, `constraints: string[]`)
```

```typescript
import { ApiError, AppError, ValidationError } from '@core/errors';

// ApiError — thrown by apiFetch/apiMutate on non-ok responses
try {
  await apiFetch('/api/items');
} catch (err) {
  if (err instanceof ApiError && err.status === 404) {
    /* handle 404 */
  }
}

// ValidationError — for form validation failures
throw new ValidationError('Email is invalid', 'email', ['Must be a valid email address']);
```

`ensureError` is also exported from `@core/errors` (and re-exported via `@utils` for convenience).

### Providers Pattern

All app-level providers are composed in `src/features/Providers/index.tsx`. The root layout imports `<Providers>` instead of nesting providers inline:

```typescript
// src/app/layout.tsx
import Providers from '@features/Providers';

<Providers>
  {children}
  <Analytics />
</Providers>
```

To add a new provider, wrap it in `src/features/Providers/index.tsx` — no changes needed in layout.

### Utils Domain Folders

Utils are organized by domain in `src/utils/`. Each domain is a folder with an `index.ts`. The top-level `src/utils/index.ts` barrel re-exports everything, so consumers import from `@utils`:

```typescript
// Always import from the barrel — never from individual domain folders
import { ensureError, formatNumber, getCategoryLabel } from '@utils';
```

To add a new util: create `src/utils/{domain}/index.ts`, then add `export * from './{domain}'` to `src/utils/index.ts`.

### Tabs Component

Radix-based tabs component at `src/components/Tabs/`:

```typescript
import Tabs, { TabsContent } from '@components/Tabs';

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview', labelFa: 'نمای کلی' },
  { value: 'details', label: 'Details', labelFa: 'جزئیات' },
];

<Tabs items={TAB_ITEMS} defaultValue="overview" onValueChange={(v) => console.log(v)}>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="details">Details content</TabsContent>
</Tabs>
```

Props: `items` (array of `{ value, label, labelFa? }`), `defaultValue`, `onValueChange?`, `children` (`TabsContent` elements).

---

## Commands

### Environment Variables

| Variable             | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `TURSO_DATABASE_URL` | Turso database connection URL                |
| `TURSO_AUTH_TOKEN`   | Turso authentication token                   |
| `AUTH_SECRET`        | Secret used for JWT session signing (`jose`) |

These must be set in `.env.local` for local dev. Production values are set in the deployment environment.

### Scripts

```bash
pnpm dev          # Development server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Lint code
pnpm migrate      # Run database migration
pnpm db:test      # Test database connection
```

---

## Naming Conventions

| Kind                 | Convention                                                 | Example                                             |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| Files (components)   | PascalCase directory, `index.tsx` inside                   | `components/DeleteConfirmModal/index.tsx`           |
| Files (hooks)        | kebab-case with `use-` prefix                              | `hooks/use-tags.ts`                                 |
| Files (utils)        | kebab-case                                                 | `utils/index.ts`                                    |
| Components           | PascalCase                                                 | `ExpenseForm`, `TagInput`                           |
| Hooks                | camelCase with `use` prefix                                | `useTags()`, `useAuth()`, `useDeleteConfirmation()` |
| Constants            | UPPER_SNAKE_CASE                                           | `ASSET_CATEGORIES`, `INCOME_TYPES`                  |
| Zod schemas          | camelCase + `Schema` suffix                                | `createExpenseSchema`, `loginSchema`                |
| Types / Interfaces   | PascalCase                                                 | `Income`, `AssetCategory`, `CreateExpenseInput`     |
| Props types          | `{ComponentName}Props`                                     | `ActionButtonsProps`, `IncomeFormProps`             |
| API client functions | camelCase, verb prefix                                     | `fetchExpenses()`, `createIncome()`, `deleteTag()`  |
| Query keys           | nested object in `query-keys.ts`                           | `queryKeys.expenses.all()`                          |
| Feature sub-folders  | `@types/`, `components/`, `constants/`, `hooks/`, `utils/` | `features/pages/Income/constants/index.ts`          |
| Database columns     | camelCase (except legacy `expenses` table uses snake_case) | `userId`, `amountUsd`                               |

---

## Anti-Patterns (Do Not)

- **No raw `fetch()`** in client code — use `apiFetch` / `apiMutate` from `lib/api/client.ts`
- **No manual auth checks** in API routes — use `withAuth` wrapper
- **No `console.log`** in production code (use `console.error` only in catch blocks via `withAuth`)
- **No hardcoded colors** — use theme tokens from `globals.css`
- **No duplicate constants** — import from `@constants/`
- **No `confirm()` / `alert()`** — use custom modal components
- **No `instanceof Error` checks** — use `ensureError()` from `@utils`
- **No local error classes** — use `ApiError`, `ValidationError` from `@core/errors`
- **No inline provider nesting** in layout — add new providers to `src/features/Providers/index.tsx`
- **No index-based DB row access** — use named column access (`row.name`, not `row[0]`)
- **No duplicate row mapping** — use mappers from `@core/database/mappers`
- **No manual URL parsing** in API routes — use `getSearchParams(request)` from `@core/api/utils`
- **No inline edit+delete buttons** — use `ActionButtons` component from `@components/ActionButtons`
- **No manual mutation boilerplate** — use `useMutationWithInvalidation` from `@/hooks/use-mutation-with-invalidation`
- **No unsectioned component bodies** — use section comments (`// States`, `// Customs`, etc.) to organize code

---

## Key Conventions

- **Package manager**: Always use `pnpm`
- **Database fields**: camelCase (not snake_case)
- **Icons**: Use lucide-react (`Edit2`, `Trash2`, `Check`, `X`, `Plus`, `Loader2`)
- **Modals**: Never use browser `confirm()` or `alert()` — use custom modal components
- **Constants**: Import from `@constants/` — never hardcode category/type arrays
- **Bilingual**: English labels with Persian (Farsi) translations
- **Loading states**: Use shared `Pulse` skeleton component from `@components/Skeleton`
- **`'use client'`**: Required at top of all client components, before imports
