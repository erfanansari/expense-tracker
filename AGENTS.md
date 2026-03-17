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

### Next.js 16 API Route Params

Route `params` are async and must be awaited:

```typescript
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### API Input Validation

Use Zod schemas from `@schemas` for validating API request bodies with `schema.safeParse(body)`.

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

## Key Conventions

- **Package manager**: Always use `pnpm`
- **Database fields**: camelCase (not snake_case)
- **Icons**: Use lucide-react (`Edit2`, `Trash2`, `Check`, `X`, `Plus`, `Loader2`)
- **Modals**: Never use browser `confirm()` or `alert()` — use custom modal components
- **Constants**: Import from `@constants/` — never hardcode category/type arrays
- **Bilingual**: English labels with Persian (Farsi) translations
- **Loading states**: Use shared `Pulse` skeleton component from `@components/Skeleton`
