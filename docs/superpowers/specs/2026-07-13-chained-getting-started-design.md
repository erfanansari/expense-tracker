# Chained Getting-Started Flow — Design Spec

**Date:** 2026-07-13 · **Status:** Approved by owner (brainstorm session)

## Problem

The current floating Get-Started launcher (pill + static checklist panel, bottom-left) was judged deficient on all four axes: too static (no motion), visually plain (generic white box), weak interaction model (a passive list that only opens drawers), and weak presence (ignorable text pill). Owner wants an interactive, well-crafted replacement.

## Agreed direction

**"The Chained Flow"** — compact corner presence with momentum-based guidance: completing a step triggers an immediate, animated reaction that hands the user the next step. Tone: **in between** calm-premium and playful — calm visuals, real motion, exactly one celebration moment at completion. No emojis; lucide vector icons only (`Rocket` for the dock). Zero new runtime dependencies (all motion CSS-based; celebration burst hand-rolled) — keeps the stack RTL-safe for the upcoming Farsi work.

## States & visuals

1. **hidden** — demo account, dismissed (DB flag), pre-welcome (`onboardedAt` null), or retired (all steps done). Renders nothing.
2. **collapsed — the Ring Dock** (the panel starts _open_ for brand-new users, as today; collapsing is a user action persisted in localStorage so navigation never re-expands it): 52px circular button, bottom-left (`fixed bottom-5 left-5 z-40`), white bg + subtle border/shadow, lucide `Rocket` (`text-text-secondary`), SVG progress ring (`stroke: success token`) that fills proportionally to completed steps (animated via `stroke-dashoffset` transition), small "1/3" count badge. Click ⇄ opens panel.
3. **open — checklist panel**: same width/card language as today (~300–320px) but redesigned: title ("Set up Kharji"), animated horizontal progress bar, three step rows (completed: green check with pop-in animation + muted strikethrough label; incomplete: circle + label + outline CTA button opening the matching global drawer), footer CSV-import link, header X = dismiss forever (existing `dismissChecklist` mutation + session-cookie refresh). Panel enters/exits with a ~250ms translate-y + opacity spring-ish ease.
4. **step-completed (transient, the chain)**: triggered when a step's underlying count crosses **0 → ≥1 while mounted** (see State detection). Panel force-opens (even if collapsed; does NOT override a dismissed/hidden launcher), renders: "✓ {Step} saved!" heading with check pop-in → below it, a **suggestion card** for the next incomplete step slides up (~500ms delayed): headline, one-line motivation, primary CTA (opens that drawer), quiet "Later" text button. Progress bar animates to the new fill. "Later" → collapsed. If the user instead completes the suggested step, the chain repeats.
5. **completing (transient) → retired**: third step completes → progress bar/ring fill to 100%, a small hand-rolled canvas particle burst (~20 particles, ≤1s, success/brand colors), "You're all set" card (title + one line: dashboard is live, helper retires) → panel fades out after ~6s (long enough to actually read and enjoy) → component returns null forever (all-done logic already retires it). `prefers-reduced-motion`: no burst, no transitions — states swap instantly.

## State detection & machine

- Data sources unchanged: `getAllExpenses`, `getIncomeList`, `getAssetList` query caches (`enabled` only while relevant), user flags from `useAuth()`.
- A `useGettingStartedFlow()` hook owns the machine: `hidden | collapsed | open | stepCelebrating(stepKey) | suggesting(stepKey) | completing`. Previous counts held in a ref; a 0→≥1 crossing (after initial data has loaded — crossings are only detected between two _loaded_ snapshots, never on first hydration) emits a completion event for that step.
- Chain ordering: expense → income → asset; suggestion targets the first incomplete step after the completed one.
- Suggestion declines ("Later") are session-only by design — chains fire only on live completion events, so there is no recurring nag to suppress.
- Multiple rapid completions (e.g. CSV import creating expenses while incomes exist): events queue; if all steps complete, skip straight to `completing`.

## Component structure

`src/features/onboarding/GettingStartedLauncher/` becomes:

- `index.tsx` — orchestrates states, renders the pieces
- `use-getting-started-flow.ts` — state machine + crossing detection (pure logic, unit-testable)
- `RingDock.tsx` — collapsed button with SVG progress ring
- `ChecklistPanel.tsx` — open state (steps list)
- `SuggestionCard.tsx` — chained prompt
- `CompletionCelebration.tsx` — final state + burst canvas

Existing pieces reused: `useDrawerStore` openers, `updateOnboardingMutation` + `refreshSessionCookie`, `useAuth().updateUser`, `onboardingCopy` (extended with `suggestions.{income,asset}` headline/body/cta, `stepSaved(label)`, `completion` strings — all i18n-ready), theme tokens throughout.

## Edge cases

- Desktop drawer (left side) overlays the launcher while open — intended: closing the drawer reveals the reaction.
- Completion via other paths (CSV import in Settings, adding from a table CTA) still triggers the chain — detection is data-driven, not drawer-driven.
- Mobile: panel max-width `calc(100vw - 2.5rem)`; bottom sheet drawers cover the launcher while open (same reveal behavior).
- The launcher never renders on /welcome (route outside dashboard layout) — unchanged.

## Testing

- Unit: `use-getting-started-flow` — crossing detection (no event on first load; event on 0→1; queued multi-completion; ordering; later/dismiss/retire transitions).
- Render: each state renders expected content; demo/dismissed/pre-welcome hidden; CTAs open drawers (drawer store assertions); dismiss fires mutation.
- E2E (scripted Chrome, prod build): fresh user → ring dock + panel → add expense via CTA → save → "Expense saved!" + income suggestion appears → complete remaining steps → celebration → launcher gone, stays gone after reload (cookie refresh path).

## Out of scope

Spotlight tours, in-account sample data, changes to the welcome screen, Overview layout changes. The Zap-logo dock variant was considered and deferred in favor of lucide `Rocket` (logo risks reading as duplicated app chrome).
