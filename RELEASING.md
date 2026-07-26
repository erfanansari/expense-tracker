# Releasing Kharji

Kharji follows [Semantic Versioning](https://semver.org/). `1.0.0` was the first public release.

## The two changelogs

There are deliberately two, for two audiences:

|            | `CHANGELOG.md` + GitHub Releases             | `src/content/releases/*.json` → [/changelog](https://kharji.app/changelog) |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Audience   | Developers                                   | Users                                                                      |
| Written by | `release-it`, from commit subjects           | You, by hand                                                               |
| Language   | English                                      | English **and** Persian                                                    |
| Scope      | Everything, including `chore` and `refactor` | Only what a user would notice                                              |

Never hand-edit `CHANGELOG.md` after v1.0.0 — it is generated. The in-app page never reads it.

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint via the
`.husky/commit-msg` hook. The type determines the next version:

| Commit                                                                      | Bump                      | Example                                         |
| --------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| `fix:`                                                                      | patch — `1.0.0` → `1.0.1` | `fix: correct rate rounding on the assets page` |
| `feat:`                                                                     | minor — `1.0.0` → `1.1.0` | `feat: add budget targets`                      |
| `feat!:` or a `BREAKING CHANGE:` footer                                     | major — `1.0.0` → `2.0.0` | `feat!: drop legacy CSV import`                 |
| `chore:`, `refactor:`, `docs:`, `test:`, `ci:`, `style:`, `perf:`, `build:` | none                      | `chore: bump next to 16.2.7`                    |

A release containing only non-bumping types will be refused by `requireCommits` — there is
nothing to release.

## Cutting a release

**Order matters.** `release-it` requires a clean working directory, so the release notes must be
committed _before_ you run it. If you skip step 1, the GitHub Release loses its Highlights
section and the in-app changelog silently omits the version.

```bash
# 1. Write the user-facing notes for the version you're about to cut.
#    Copy an existing file for the shape; both `en` and `fa` are required.
$EDITOR src/content/releases/1.1.0.json

# 2. Register it in the barrel — newest first.
$EDITOR src/content/releases/index.ts

# 3. Confirm the notes are valid (checks semver, dates, and that no `fa` is missing).
pnpm test

# 4. Commit them.
git add src/content/releases && git commit -m "docs: add v1.1.0 release notes"

# 5. Preview the release without writing anything.
pnpm release:dry

# 6. Cut it: bumps package.json, regenerates CHANGELOG.md, commits, tags.
pnpm release

# 7. Push. This is what triggers the GitHub Release.
git push --follow-tags
```

`pnpm release` derives the bump from your commits. To force one, use `pnpm release:patch`,
`release:minor` or `release:major`.

The version in `package.json` must match the newest entry in `src/content/releases/` — a test
enforces this, so step 6 will fail the `before:init` check if you forget step 1.

### What each piece does

- **`.release-it.json`** — bumps the version, regenerates `CHANGELOG.md` via
  `@release-it/conventional-changelog`, commits as `chore(release): v<x>`, and creates an
  annotated `v<x>` tag. It does **not** push (`push: false`) and does **not** create the GitHub
  Release, so nothing leaves your machine until you push.
- **`before:init: pnpm check`** — refuses to release from a tree that fails lint, format or
  typecheck.
- **`after:bump`** — runs Prettier over the generated `CHANGELOG.md`, because the generator's
  output does not match this repo's Prettier config and `pnpm format:check` globs `**/*.md`.
- **`.github/workflows/release.yml`** — fires on a `v*.*.*` tag push, builds notes with
  `scripts/extract-changelog.mjs`, and creates the GitHub Release.
- **Vercel** — deploys from the push to `main`, independently of the tag.

## Release notes format

```json
{
  "version": "1.1.0",
  "date": "2026-08-15",
  "title": { "en": "Budgets", "fa": "بودجه‌بندی" },
  "summary": { "en": "Optional.", "fa": "اختیاری." },
  "highlights": [
    {
      "type": "feature",
      "en": "Set a monthly target per category.",
      "fa": "برای هر دسته‌بندی یه سقف ماهانه بگذار."
    }
  ]
}
```

- `type` is `feature`, `improvement` or `fix` — it picks the icon and colour on the page.
- `version` is plain semver, no `v` prefix, and must equal the filename.
- `date` is `YYYY-MM-DD` and cannot be in the future.
- Persian copy uses the app's casual voice, matching `messages/fa.json` — not the formal
  register of the legal pages.

## Checking a release afterwards

```bash
node scripts/extract-changelog.mjs 1.1.0   # exactly what the GitHub Release will contain
```

Then confirm the [GitHub Release](https://github.com/erfanansari/kharji/releases) was created and
that `/changelog` shows the new entry.
