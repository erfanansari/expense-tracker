# AGENTS.md

This document provides AI coding agents with the context needed to work effectively in the Kharji codebase.

---

## Business Domain

Kharji is a **personal finance tracker** for Persian-speaking users. Tracks expenses, income, and assets with multi-currency support and Jalali (Persian) calendar.

### Core Entities

| Entity      | Purpose                                                               |
| ----------- | --------------------------------------------------------------------- |
| **Expense** | Spending record with amount, category, tags, optional exchange rate   |
| **Income**  | Income record with source type, amount, currency                      |
| **Asset**   | Owned asset (property, vehicle, investment) with valuations over time |
| **Tag**     | User-defined label attached to expenses for finer categorization      |
| **Summary** | Aggregated totals across all domains (used by Overview page)          |

### Domain Rules

- All monetary values stored in user's base currency; foreign amounts carry `amountUsd`
- Exchange rates can be fetched automatically or overridden via `useExchangeRateForm`
- Dates displayed in Jalali format using helpers in `src/utils/date/`
- Every constant has both English `label` and Persian `labelFa` translation
- All DB queries filter by `user_id` — enforced via `verifyOwnership`

---

## Technology Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS v4 · TanStack React Query v5 · Zod v3 · tailwind-merge v3 · Turso (libSQL) · jose (JWT) · lucide-react · recharts

---

## Key Paths

- `src/app/(dashboard)/` — page routes (thin wrappers: metadata + feature component)
- `src/app/api/` — API routes (all protected via `withAuth`)
- `src/features/pages/{Page}/` — page feature modules (composition root + sub-components)
- `src/features/{domain}/` — shared domain components, hooks, utils (expenses, income, assets)
- `src/components/` — pure shared UI (no business logic)
- `src/core/` — framework modules: `api/utils`, `database/mappers`, `database/tags`, `errors`, `session`
- `src/lib/` — client API functions (`api/client.ts`) and query keys (`query-keys.ts`)
- `src/hooks/` — global mutation hooks
- `src/utils/` — domain utils barrel (import always from `@utils`)
- `src/constants/` — categories, income types, all domain constants

---

## Architecture Patterns

### Pages

Pages in `src/app/` are thin wrappers — metadata + feature component only:

```typescript
import Income from '@features/pages/Income';
export const metadata: Metadata = { title: 'Income' };
const IncomePage = () => <Income />;
export default IncomePage;
```

### Feature Modules

`src/features/pages/{Page}/index.tsx` is the composition root — queries and state live here, sub-components receive props. Helper components (skeletons) are function declarations in the same file, no export. Sub-folders: `@types/`, `components/`, `constants/`, `hooks/`, `utils/` — only create what has content.

### Adding a New Page

1. `src/app/(dashboard)/[route]/page.tsx` — metadata + feature component
2. `src/features/pages/MyFeature/index.tsx` — composition root
3. `src/app/api/my-feature/route.ts` — API route using `withAuth`
4. `src/lib/api/my-feature.ts` — client functions using `apiFetch`/`apiMutate`
5. `src/lib/query-keys.ts` — add query key domain
6. `src/hooks/use-my-feature.ts` — mutation hooks using `useMutationWithInvalidation`
7. Add nav link if needed

---

## API Route Pattern

All protected routes use `withAuth` from `@core/api/utils` — never manual auth checks or try-catch:

```typescript
import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';

export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('tableName', id, user.userId);
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const result = validateBody(schema, raw);
  if (result instanceof NextResponse) return result;

  // business logic with result.data
}, 'FeatureName');
```

| Utility           | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `withAuth`        | Auth check + try-catch + error logging                        |
| `parseIdParam`    | Validates `[id]` param → `number \| NextResponse`             |
| `verifyOwnership` | Checks record exists + belongs to user → row or 404           |
| `validateBody`    | Zod `safeParse` + error response → `{ data } \| NextResponse` |
| `getSearchParams` | Safe URL search params extraction                             |

---

## Client API Pattern

```typescript
import { apiFetch, apiMutate } from './client';

export const fetchItems = () => apiFetch<Item[]>('/api/items');
export const createItem = (data: CreateInput) => apiMutate<Item>('/api/items', 'POST', data);
export const deleteItem = (id: number) => apiMutate<void>(`/api/items/${id}`, 'DELETE');
```

Both throw `ApiError` (with `.message` and `.status`) on non-ok responses.

---

## React Query Conventions

Query keys live in `src/lib/query-keys.ts`. Always use the factory:

```typescript
useQuery({ queryKey: queryKeys.expenses.all(), queryFn: fetchAllExpenses });
```

Use `useMutationWithInvalidation` for all mutation hooks — never manually wire `useQueryClient` + `useMutation`:

```typescript
const INVALIDATION_KEYS = [queryKeys.assets.all(), queryKeys.summary.all()] as const;
export const useCreateAsset = () => useMutationWithInvalidation(createAsset, INVALIDATION_KEYS);
```

Expense mutations must also invalidate `summary`.

---

## Database Utilities

**Row mappers** (`@core/database/mappers`) — always use, never inline row-to-type casts:
`mapRowToExpense(row, tags?)` · `mapRowToIncome(row)` · `mapRowToAsset(row)` · `mapRowToAssetValuation(row)`

**Tag helpers** (`@core/database/tags`):

- `fetchTagsForExpenses(ids)` — bulk-fetch tags for expense list (avoids N+1)
- `assignTagsToExpense(id, tagIds)` — replace all tags for an expense

Always use named column access (`row.id`) — never index-based (`row[0]`).

---

## Shared Hooks & Components

- **`useDeleteConfirmation`** (`@hooks/use-delete-confirmation`) — delete modal state, never duplicate it
- **`useExchangeRateForm`** (`@hooks/use-exchange-rate-form`) — forms needing exchange rate fetch + override
- **`ActionButtons`** (`@components/ActionButtons`) — edit+delete button pairs in table action columns
- **`Skeleton`** (`@components/Skeleton`) — use `Pulse` variant for loading states

**Tabs** (`@components/Tabs`):

```typescript
import Tabs, { TabsContent } from '@components/Tabs';
const TAB_ITEMS = [{ value: 'overview', label: 'Overview', labelFa: 'نمای کلی' }];
<Tabs items={TAB_ITEMS} defaultValue="overview"><TabsContent value="overview">...</TabsContent></Tabs>
```

---

## Code Style

### Section Comments

Every component and hook body must use section comments. Only include sections that have content; no blank line between comment and first item; one blank line between sections.

| `// States` | `// References` | `// Customs` | `// Variables` | `// Queries` |
| `// Mutations` | `// Forms` | `// Memos` | `// Callbacks` | `// Effects` |

`// Customs` = project hooks (`useAuth`, `useToast`, `useRouter`, etc.)

### Function Style

- **Components**: arrow function + `export default` at end of file
- **Helper/internal components**: `function HelperName() {}` — no export
- **Global hooks**: named export (`export const useCreateAsset = () => ...`)
- **Feature hooks**: arrow function + `export default`

### Imports

Three groups separated by blank lines: (1) third-party packages, (2) internal aliases, (3) relative imports. Always `import type { Foo }` for type-only imports — never `import { type Foo }`. `'use client'` must be the very first line.

### Path Aliases

| `@types` | `@schemas` | `@components/*` | `@features/*` | `@hooks/*` | `@constants` | `@core/*` | `@utils` | `@configs` |

Use `@/` only for `@/lib/*` and `@/styles/*`.

---

## Error Handling

```
AppError → ApiError (status: number)
         → ValidationError (field, constraints)
```

Use `ensureError` from `@utils` in all catch blocks. Import error classes from `@core/errors`.

---

## Providers & Utils

- Add new providers in `src/features/Providers/index.tsx` — never nest in layout
- Add new utils in `src/utils/{domain}/index.ts`, then re-export from `src/utils/index.ts`; always import from `@utils`

---

## Build & Development

| Variable             | Purpose                       |
| -------------------- | ----------------------------- |
| `TURSO_DATABASE_URL` | Turso database connection URL |
| `TURSO_AUTH_TOKEN`   | Turso auth token              |
| `AUTH_SECRET`        | JWT session signing secret    |

```bash
pnpm dev        # Development server (localhost:3000)
pnpm build      # Production build
pnpm migrate    # Run database migration
pnpm db:test    # Test database connection
```

---

## Naming Conventions

- **Components/Features**: PascalCase (`ExpenseForm`, `TagInput`)
- **Hooks**: `use-` prefix, kebab-case file (`use-tags.ts`), camelCase function (`useTags`)
- **Constants**: `UPPER_SNAKE_CASE` · **Zod schemas**: `camelCase` + `Schema` suffix (`createExpenseSchema`)
- **API client functions**: verb prefix (`fetchExpenses`, `createIncome`, `deleteTag`)
- **Props types**: `{ComponentName}Props`
- **DB columns**: camelCase (`userId`, `amountUsd`) — legacy `expenses` table uses snake_case

---

## Anti-Patterns

- **No raw `fetch()`** — use `apiFetch`/`apiMutate` from `lib/api/client.ts`
- **No manual auth checks** in API routes — use `withAuth`
- **No `console.log`** — `console.error` only in `withAuth` catch blocks
- **No hardcoded colors** — use theme tokens from `globals.css`
- **No duplicate constants** — import from `@constants`
- **No `confirm()`/`alert()`** — use custom modal components
- **No `instanceof Error`** — use `ensureError()` from `@utils`
- **No local error classes** — use `ApiError`, `ValidationError` from `@core/errors`
- **No inline provider nesting** in layout — add to `src/features/Providers/`
- **No index-based DB row access** — use named columns (`row.name`, not `row[0]`)
- **No inline row mapping** — use mappers from `@core/database/mappers`
- **No manual URL parsing** in API routes — use `getSearchParams`
- **No inline edit+delete buttons** — use `ActionButtons`
- **No manual mutation boilerplate** — use `useMutationWithInvalidation`
- **No unsectioned component bodies** — use `// States`, `// Queries`, etc.
- **`'use client'`** must be the very first line, before imports
