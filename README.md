# Kharji / خرجی

Personal finance tracker for Iranians living with dual currencies — track expenses, income, and assets in both Toman and USD with real-time exchange rates.

---

## Tech Stack

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Framework       | Next.js 16 (App Router, React 19)     |
| Language        | TypeScript (strict)                   |
| Database        | Turso (libSQL / SQLite)               |
| Styling         | Tailwind CSS v4                       |
| Charts          | Recharts                              |
| Tables          | TanStack Table v8                     |
| Data fetching   | TanStack Query v5                     |
| Auth            | Custom-built (JWT, HTTP-only cookies) |
| Email           | Resend + React Email                  |
| Export          | xlsx                                  |
| Validation      | Zod                                   |
| Package manager | pnpm                                  |

---

## Project Structure

```
kharji/
├── src/
│   ├── @schemas/            Zod validation schemas + unit tests
│   ├── @types/              TypeScript type definitions
│   ├── app/
│   │   ├── (auth)/          Login, signup, forgot/reset-password pages
│   │   ├── (dashboard)/     All protected app pages (overview, expenses, income, assets, reports, settings)
│   │   ├── api/             API route handlers
│   │   ├── layout.tsx       Root layout (fonts, providers, analytics)
│   │   └── page.tsx         Root redirect
│   ├── components/          Shared UI primitives (Button, Modal, Toast, DeleteConfirmModal, …)
│   ├── constants/           Centralised category/type definitions
│   ├── core/
│   │   ├── api/             Auth middleware (withAuth) and request helpers
│   │   └── database/        Turso client + SQL migrations
│   ├── emails/              React Email templates (MonthlyReport, YearlyReport)
│   ├── features/            Feature-scoped components (expenses, income, assets)
│   ├── hooks/               Shared React hooks
│   ├── styles/              globals.css (Tailwind theme tokens)
│   └── utils/               Pure utility functions + unit tests
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- A [Turso](https://turso.tech) database

### Development

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values
cp .env.example .env.local

# Run database migrations
pnpm migrate

# (Optional) seed a demo user
pnpm db:seed

# Start the dev server — http://localhost:3000
pnpm dev
```

### Preview emails

```bash
pnpm email:dev   # http://localhost:3001
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. For Vercel deployments, set these in the project settings.

### Required

| Variable             | Description                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| `TURSO_DATABASE_URL` | Turso database connection URL                                           |
| `TURSO_AUTH_TOKEN`   | Turso authentication token                                              |
| `JWT_SECRET`         | Long random string — signs JWT session tokens                           |
| `APP_URL`            | Public URL of the app (e.g. `https://kharji.app`) — used in email links |

### Optional: exchange rate

| Variable          | Default | Description                                                                                   |
| ----------------- | ------- | --------------------------------------------------------------------------------------------- |
| `NAVASAN_API_KEY` | —       | Navasan API key for live USD/Toman rates. Falls back to free tier (120 req/month) if not set. |

### Optional: email

If `RESEND_API_KEY` is not set, emails are skipped and the app works normally.

| Variable         | Description                             |
| ---------------- | --------------------------------------- |
| `RESEND_API_KEY` | Resend API key for transactional emails |

### Optional: cron

| Variable      | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `CRON_SECRET` | Secret token Vercel sends with cron requests to authenticate them |

### Optional: database backups (Backblaze B2)

Daily SQL dumps of the whole database are gzipped and uploaded to a B2 bucket via its S3-compatible API; backups older than 30 days are pruned automatically.

| Variable             | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `B2_KEY_ID`          | Backblaze B2 application key ID                                           |
| `B2_APPLICATION_KEY` | Backblaze B2 application key secret (shown once at creation)              |
| `B2_BUCKET_NAME`     | B2 bucket to store backups in                                             |
| `B2_ENDPOINT`        | B2 bucket's S3-compatible endpoint, e.g. `s3.ca-east-006.backblazeb2.com` |

### Optional: debugging

| Variable                 | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_COMMIT_SHA` | Git commit SHA injected at build time (displayed in footer for traceability) |

---

## Email Notifications

The following emails are sent automatically when `RESEND_API_KEY` is configured:

| Trigger                   | Recipient                    | Description                          |
| ------------------------- | ---------------------------- | ------------------------------------ |
| Forgot password           | Requesting user              | Password reset link (expires 1 hour) |
| Monthly cron (daily 9 AM) | Users with reporting enabled | Monthly expense + income summary     |
| Yearly cron               | Users with reporting enabled | Annual financial summary             |

Users can manage notification preferences in **Settings → Notifications** and unsubscribe via the link in any email.

---

## Pages & Routes

| Route                    | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| `/`                      | Redirect → `/overview` (or `/login` if unauthenticated)                        |
| `/login`                 | Email + password sign-in                                                       |
| `/signup`                | New account registration                                                       |
| `/forgot-password`       | Request a password reset link                                                  |
| `/reset-password?token=` | Set a new password from emailed link                                           |
| `/overview`              | Dashboard: monthly summary cards, income vs expenses chart, asset distribution |
| `/expenses`              | Expense list with date range filter, category filter, tags, export             |
| `/income`                | Monthly income entries by type (salary, freelance, investment, gift, other)    |
| `/assets`                | Asset portfolio across 7 categories with valuation history                     |
| `/reports`               | Spending analysis: charts, category breakdown, daily heatmap                   |
| `/settings`              | Tags, custom categories, notification preferences, profile                     |

---

## API Routes

### Auth

- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `GET  /api/auth/me` — Current user
- `POST /api/auth/forgot-password` — Send reset email
- `POST /api/auth/reset-password` — Apply new password with token

### Expenses

- `GET/POST /api/expenses`
- `GET/PUT/DELETE /api/expenses/[id]`

### Income

- `GET/POST /api/incomes`
- `GET/PUT/DELETE /api/incomes/[id]`

### Assets

- `GET/POST /api/assets`
- `GET/PUT/DELETE /api/assets/[id]`

### Tags

- `GET/POST /api/tags` — supports `?includeUsage=true`
- `PUT/DELETE /api/tags/[id]`

### Categories

- `GET/POST /api/categories`
- `PUT/DELETE /api/categories/[id]`

### Other

- `GET /api/exchange-rate` — Live USD/Toman rate with 24-hour caching
- `GET /api/summary` — Monthly financial overview for dashboard
- `GET /api/net-worth/history` — Asset value history over time
- `GET /api/export` — Download expenses as Excel
- `GET/PUT /api/settings/notifications` — Notification preferences
- `PUT /api/user/profile` — Update name/email
- `GET /api/unsubscribe/[token]` — One-click email unsubscribe
- `POST /api/cron/reports` — Vercel cron trigger (daily 9 AM UTC) for report emails
- `POST /api/cron/backup` — Vercel cron trigger (daily 3 AM UTC) for database backups to Backblaze B2

---

## Database Schema

### users

| Column        | Type    | Notes            |
| ------------- | ------- | ---------------- |
| id            | INTEGER | PK               |
| email         | TEXT    | unique           |
| password_hash | TEXT    | PBKDF2 with salt |
| name          | TEXT    | nullable         |
| created_at    | TEXT    |                  |
| updated_at    | TEXT    |                  |

### expenses

| Column      | Type    | Notes           |
| ----------- | ------- | --------------- |
| id          | INTEGER | PK              |
| user_id     | INTEGER | FK → users      |
| date        | TEXT    | YYYY-MM-DD      |
| category_id | INTEGER | FK → categories |
| description | TEXT    |                 |
| price_toman | REAL    |                 |
| price_usd   | REAL    |                 |
| created_at  | TEXT    |                 |

### incomes

| Column           | Type    | Notes                                          |
| ---------------- | ------- | ---------------------------------------------- |
| id               | INTEGER | PK                                             |
| userId           | INTEGER | FK → users                                     |
| amountUsd        | REAL    |                                                |
| amountToman      | REAL    |                                                |
| exchangeRateUsed | REAL    |                                                |
| month            | INTEGER | 1–12                                           |
| year             | INTEGER |                                                |
| incomeType       | TEXT    | salary / freelance / investment / gift / other |
| source           | TEXT    | nullable                                       |
| notes            | TEXT    | nullable                                       |
| createdAt        | TEXT    |                                                |
| updatedAt        | TEXT    |                                                |

### assets

| Column           | Type    | Notes                                                              |
| ---------------- | ------- | ------------------------------------------------------------------ |
| id               | INTEGER | PK                                                                 |
| userId           | INTEGER | FK → users                                                         |
| category         | TEXT    | cash / crypto / commodity / vehicle / property / bank / investment |
| name             | TEXT    | user-provided label                                                |
| quantity         | REAL    |                                                                    |
| unit             | TEXT    | nullable                                                           |
| unitValueUsd     | REAL    | nullable                                                           |
| totalValueUsd    | REAL    |                                                                    |
| totalValueToman  | REAL    |                                                                    |
| exchangeRateUsed | REAL    |                                                                    |
| notes            | TEXT    | nullable                                                           |
| lastValuedAt     | TEXT    |                                                                    |
| createdAt        | TEXT    |                                                                    |
| updatedAt        | TEXT    |                                                                    |

### assetValuations

Snapshot created every time an asset value changes.

| Column           | Type    | Notes                        |
| ---------------- | ------- | ---------------------------- |
| id               | INTEGER | PK                           |
| assetId          | INTEGER | FK → assets (cascade delete) |
| quantity         | REAL    |                              |
| unitValueUsd     | REAL    | nullable                     |
| totalValueUsd    | REAL    |                              |
| totalValueToman  | REAL    |                              |
| exchangeRateUsed | REAL    |                              |
| valuedAt         | TEXT    |                              |

### tags / expense_tags

| Column                  | Type    | Notes                          |
| ----------------------- | ------- | ------------------------------ |
| tags.id                 | INTEGER | PK                             |
| tags.user_id            | INTEGER | FK → users                     |
| tags.name               | TEXT    | unique per user                |
| expense_tags.expense_id | INTEGER | FK → expenses (cascade delete) |
| expense_tags.tag_id     | INTEGER | FK → tags (cascade delete)     |

### categories

User-defined expense categories (replaces hardcoded list).

### exchange_rates

Cached USD/Toman rates fetched from Navasan.

### userNotificationPreferences

Per-user email notification settings.

### password_reset_tokens

Short-lived tokens for the forgot-password flow (1-hour expiry).

---

## Auth

Custom-built authentication — no NextAuth, Better Auth, or Clerk.

- **Tokens**: JWT signed with `JWT_SECRET`
- **Storage**: HTTP-only cookies (no localStorage exposure)
- **Session expiry**: 30 days
- **Passwords**: PBKDF2 with per-user salt
- **Password requirements**: ≥8 chars, uppercase, lowercase, digit
- **Reset tokens**: cryptographically random, expire after 1 hour

---

## Testing

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch
```

Uses **Jest** + **ts-jest** + **jsdom** + **React Testing Library**.

| File                                                                             | What's tested                                                   |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/@schemas/__tests__/expense.test.ts`                                         | Zod expense schema — valid input, missing fields, invalid types |
| `src/@schemas/__tests__/income.test.ts`                                          | Zod income schema validation                                    |
| `src/@schemas/__tests__/asset.test.ts`                                           | Zod asset schema validation                                     |
| `src/utils/format/__tests__/format.test.ts`                                      | Currency/number formatting helpers                              |
| `src/utils/date/__tests__/formatChartTooltipDate.test.ts`                        | Date formatting for chart tooltips                              |
| `src/features/expenses/components/DateRangeSelector/__tests__/dateRange.test.ts` | Date range selection logic                                      |

---

## License

Kharji is published under the **Kharji Source-Available License (View-Only) v1.0** — see [LICENSE](./LICENSE) for the full text.

The source is public for auditability: you should be able to read every line of code that touches your financial data before trusting it. This is not an OSI-approved open-source license.

**You can:** read, audit, quote excerpts, submit pull requests.
**You cannot:** run/host/deploy, fork, reuse in another project, redistribute.

To use Kharji outside these terms, contact **dev.erfanansari@gmail.com**.
