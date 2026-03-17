# AGENTS.md

This document provides AI coding agents with the context needed to work effectively in the Kharji codebase.

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
│   ├── pages/           Page-level components (Overview, Assets, Income, etc.)
│   ├── assets/          Asset feature components
│   ├── expenses/        Expense feature components
│   └── income/          Income feature components
├── hooks/               Global custom React hooks
├── lib/                 API client functions and query keys
├── styles/              Global CSS with theme tokens
└── utils/               Utility functions
```

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

**Tag helpers in `@core/database/tags`:**

| Helper                            | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `fetchTagsForExpenses(ids)`       | Bulk-fetch tags for expense list (avoids N+1)       |
| `assignTagsToExpense(id, tagIds)` | Replace all tags for an expense (delete + reinsert) |

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

// Mutation invalidation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
};
```

**Key structure:** `[domain, variant?]` — e.g., `['expenses']`, `['expenses', 'paginated']`, `['tags', 'withUsage']`

**Invalidation rules:** Mutations that change data must invalidate related queries. Expense mutations should also invalidate `summary`.

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

---

## Commands

```bash
pnpm dev          # Development server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Lint code
pnpm migrate      # Run database migration
pnpm db:test      # Test database connection
```

---

## Naming Conventions

| Kind                 | Convention                                                 | Example                                            |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Files (components)   | kebab-case directory, `index.tsx` inside                   | `components/DeleteConfirmModal/index.tsx`          |
| Components           | PascalCase                                                 | `ExpenseForm`, `TagInput`                          |
| Hooks                | `use-` prefix, kebab-case files                            | `hooks/use-tags.ts` → `useTags()`                  |
| Constants            | UPPER_SNAKE_CASE                                           | `ASSET_CATEGORIES`, `INCOME_TYPES`                 |
| Zod schemas          | camelCase + `Schema` suffix                                | `createExpenseSchema`, `loginSchema`               |
| API client functions | camelCase, verb prefix                                     | `fetchExpenses()`, `createIncome()`, `deleteTag()` |
| Query keys           | nested object in `query-keys.ts`                           | `queryKeys.expenses.all()`                         |
| Database columns     | camelCase (except legacy `expenses` table uses snake_case) | `userId`, `amountUsd`                              |

---

## Anti-Patterns (Do Not)

- **No raw `fetch()`** in client code — use `apiFetch` / `apiMutate` from `lib/api/client.ts`
- **No manual auth checks** in API routes — use `withAuth` wrapper
- **No `console.log`** in production code (use `console.error` only in catch blocks via `withAuth`)
- **No hardcoded colors** — use theme tokens from `globals.css`
- **No duplicate constants** — import from `@constants/`
- **No `confirm()` / `alert()`** — use custom modal components
- **No `instanceof Error` checks** — use `ensureError()` from `@utils`
- **No index-based DB row access** — use named column access (`row.name`, not `row[0]`)

---

## Key Conventions

- **Package manager**: Always use `pnpm`
- **Database fields**: camelCase (not snake_case)
- **Icons**: Use lucide-react (`Edit2`, `Trash2`, `Check`, `X`, `Plus`, `Loader2`)
- **Modals**: Never use browser `confirm()` or `alert()` — use custom modal components
- **Constants**: Import from `@constants/` — never hardcode category/type arrays
- **Bilingual**: English labels with Persian (Farsi) translations
- **Loading states**: Use shared `Pulse` skeleton component from `@components/Skeleton`
