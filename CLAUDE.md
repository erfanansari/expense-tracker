# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an expense tracker application built with Next.js 16, using the App Router architecture. The stack includes:
- **Framework**: Next.js 16.0.10 (React 19.2.3)
- **Language**: TypeScript with strict mode enabled
- **Database**: Turso (libSQL) via `@libsql/client`
- **Styling**: Tailwind CSS v4 (using new PostCSS plugin architecture)
- **Package Manager**: pnpm 10.24.0
- **Fonts**: Geist Sans and Geist Mono (via next/font)

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

## Project Structure

```
expense-tracker/
├── app/
│   ├── api/
│   │   └── expenses/
│   │       └── route.ts    # GET and POST endpoints for expenses
│   ├── layout.tsx          # Root layout with font configuration
│   ├── page.tsx            # Home page with expense form and list
│   └── globals.css         # Global Tailwind styles
├── components/
│   ├── expense-form.tsx    # Client component for adding expenses
│   └── expense-list.tsx    # Client component for displaying expenses
├── lib/
│   ├── db/
│   │   ├── client.ts       # Turso database client singleton
│   │   ├── schema.sql      # Database schema definition
│   │   ├── migrate.ts      # Migration script
│   │   └── test-connection.ts  # Database connection test utility
│   └── types/
│       └── expense.ts      # TypeScript interfaces for Expense
├── public/                 # Static assets
├── .env.local             # Environment variables (Turso credentials)
└── tsconfig.json          # TypeScript configuration
```

## Application Features

This is a minimal expense tracker with the following functionality:
- Add new expenses with date, category, description, price in Toman, and price in USD
- View all expenses in a sortable table (sorted by date descending)
- Form validation for all required fields
- Real-time UI updates after adding expenses
- Dark mode support

### Database Schema

The `expenses` table has the following structure:
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `date`: TEXT (ISO format date)
- `category`: TEXT (e.g., Food, Transport, Entertainment)
- `description`: TEXT (expense details)
- `price_toman`: REAL (price in Iranian Toman)
- `price_usd`: REAL (price in US Dollars)
- `created_at`: TEXT (timestamp, default CURRENT_TIMESTAMP)

An index on the `date` column is created for faster date-based queries.

### API Routes

- `GET /api/expenses`: Fetch all expenses (sorted by date DESC)
- `POST /api/expenses`: Create a new expense
  - Request body: `{ date, category, description, price_toman, price_usd }`
  - Validates all required fields and data types
  - Returns 201 on success, 400 on validation error, 500 on server error

## Configuration Details

### TypeScript Configuration
- Target: ES2017
- Strict mode: enabled
- Module resolution: bundler (Next.js optimized)
- Path alias: `@/*` maps to project root
- JSX: react-jsx

### Database (Turso/libSQL)
Database credentials are stored in `.env.local`:
- `TURSO_DATABASE_URL`: Connection URL to Turso database
- `TURSO_AUTH_TOKEN`: Authentication token

**Database Setup:**
1. Ensure `.env.local` contains valid Turso credentials
2. Run `pnpm migrate` to create the expenses table
3. Use `pnpm db:test` to verify the database connection and table setup
4. The database client is initialized in `lib/db/client.ts` and reused across the application

### Tailwind CSS v4
This project uses Tailwind CSS v4 with the new PostCSS plugin (`@tailwindcss/postcss`). Configuration is in `postcss.config.mjs`.

### ESLint
Uses Next.js ESLint config with TypeScript support:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Architecture Notes

### App Router (Next.js 16)
This project uses the App Router (not Pages Router). All routes are defined in the `app/` directory using file-system based routing.

### Font Loading
Custom fonts (Geist Sans and Geist Mono) are loaded via `next/font/google` in `app/layout.tsx` and applied using CSS variables (`--font-geist-sans`, `--font-geist-mono`).

### Styling Approach
Tailwind CSS utility classes are used directly in components. Dark mode support is implemented via Tailwind's `dark:` variant.

## Important Conventions

- Always use `pnpm` for package management (enforced via `packageManager` field)
- Follow Next.js 16 App Router conventions (Server Components by default)
- Environment variables for Turso database must be present in `.env.local`
- TypeScript strict mode is enabled - all code must pass type checking
