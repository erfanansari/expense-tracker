# Releasing Kharji

Kharji follows [Semantic Versioning](https://semver.org/). `v1.0.0` was the first public release,
on 2026-07-26.

**Quick reference** — the whole loop, once you understand it:

```bash
$EDITOR src/content/releases/<next>.json   # 1. write bilingual notes
$EDITOR src/content/releases/index.ts      # 2. register, newest first
pnpm test                                  # 3. validate the notes
git commit -am "docs: add v<next> release notes"
pnpm release:dry                           # 4. preview
pnpm release                               # 5. bump + changelog + commit + tag
git push --follow-tags                     # 6. publishes the GitHub Release
```

The rest of this document explains each step, what the tooling decides for you, and what to do
when something goes wrong.

## The two changelogs

There are deliberately two, for two audiences. Keeping them separate is the whole design:

|            | `CHANGELOG.md` + GitHub Releases             | `src/content/releases/*.json` → [/changelog](https://kharji.app/changelog) |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Audience   | Developers                                   | Users                                                                      |
| Written by | `release-it`, from commit subjects           | You, by hand                                                               |
| Language   | English                                      | English **and** Persian                                                    |
| Scope      | Everything, including `chore` and `refactor` | Only what a user would notice                                              |

Never hand-edit `CHANGELOG.md` — it is generated, and your edits will be overwritten. The in-app
page never reads it, so a user-visible change only reaches users if you write it into
`src/content/releases/`.

## What decides the version

You don't — your commit types do. [Conventional Commits](https://www.conventionalcommits.org/) are
enforced by commitlint via the `.husky/commit-msg` hook, and `release-it` reads them to pick the
bump:

| Highest type since the last tag                                                  | Bump                      | Example                                         |
| -------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| `fix:`                                                                           | patch — `1.0.0` → `1.0.1` | `fix: correct rate rounding on the assets page` |
| `feat:`                                                                          | minor — `1.0.0` → `1.1.0` | `feat: add budget targets`                      |
| `feat!:` or a `BREAKING CHANGE:` footer                                          | major — `1.0.0` → `2.0.0` | `feat!: drop legacy CSV import`                 |
| only `chore:`, `refactor:`, `docs:`, `test:`, `ci:`, `style:`, `perf:`, `build:` | none — refused            | `chore: bump next to 16.2.7`                    |

To override the computed bump — say a batch of fixes you'd rather call a minor — use
`pnpm release:patch`, `release:minor` or `release:major`.

## Cutting a release, start to finish

A worked example. Assume you've merged two commits since `v1.0.0`:

```
feat: add budget targets
fix: correct rate rounding on the assets page
```

A `feat:` is present, so the next version is **`1.1.0`**.

### 1. Write the user-facing notes

Create `src/content/releases/1.1.0.json`. Both locales are required — this is the copy your users
actually read on `/changelog`:

```json
{
  "version": "1.1.0",
  "date": "2026-08-02",
  "title": { "en": "Budgets", "fa": "بودجه‌بندی" },
  "highlights": [
    {
      "type": "feature",
      "en": "Set a monthly target per category.",
      "fa": "برای هر دسته‌بندی یه سقف ماهانه بگذار."
    },
    {
      "type": "fix",
      "en": "Exchange-rate rounding on the assets page.",
      "fa": "گرد کردن نرخ ارز در صفحهٔ دارایی‌ها."
    }
  ]
}
```

Write for users, not for the git log: describe what they can now do, not which module changed.
Skip anything invisible — a `refactor:` belongs in `CHANGELOG.md`, not here.

### 2. Register it in the barrel

Add the import and put it **first** in the array in `src/content/releases/index.ts` — the page
renders in array order and the newest release gets the "Latest" badge:

```ts
import v1_0_0 from './1.0.0.json';
import v1_1_0 from './1.1.0.json';

export const RELEASES: Release[] = [v1_1_0 as Release, v1_0_0 as Release];
```

The explicit import is deliberate. A directory read (`fs.readdirSync`) is not statically
analysable, so Next would not trace the JSON into the serverless bundle and the page would render
empty in production.

### 3. Validate the notes

```bash
pnpm test
```

This checks every release file: valid semver, an ISO date that isn't in the future, no duplicate
versions, correct newest-first ordering, and — most usefully — that **no `fa` translation is
missing**. That last one is the mistake most likely to reach production.

### 4. Commit the notes — before releasing

```bash
git add src/content/releases
git commit -m "docs: add v1.1.0 release notes"
```

This ordering is not optional. `release-it` refuses to run on a dirty working directory, and if
the notes aren't committed at the tag, the GitHub Release loses its Highlights section.

### 5. Preview, then cut

```bash
pnpm release:dry    # confirm it says 1.1.0 and the changelog looks right
pnpm release        # the real thing
```

`pnpm release` bumps `package.json`, regenerates `CHANGELOG.md`, commits as
`chore(release): v1.1.0`, and creates an annotated `v1.1.0` tag. It does **not** push — nothing
has left your machine yet, so this is still freely undoable.

### 6. Push

```bash
git push --follow-tags
```

The `--follow-tags` is the important part: pushing the branch alone won't publish anything. The
tag push triggers `.github/workflows/release.yml`, which builds the notes and creates the GitHub
Release in about ten seconds. Vercel deploys from the same push, independently of the tag.

## What `pnpm release:dry` does

It's `release-it --dry-run` — a rehearsal. It runs the read-only git queries and reports the
version it _would_ pick and the changelog it _would_ write, then stops. No version bump, no
`CHANGELOG.md` write, no commit, no tag, no push.

Read the output by its prefixes:

- `$ git rev-parse …` — actually executed (read-only queries are safe to run)
- `! pnpm check`, `! git fetch` — **skipped** because it's a dry run

That second point is worth internalising: **a dry run does not run the `pnpm check` hook.** It
answers "what version, and what notes?" — not "is this releasable?". A dry run can pass and the
real release still fail on lint or typecheck.

## Troubleshooting

| Message                                      | What it means                                                                                                                         | Fix                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `There are no commits since the latest tag`  | Not an error — `requireCommits` refusing an empty release. You're standing on the tag, or everything since it was `chore`/`refactor`. | Land a `feat:` or `fix:` first.         |
| `Working dir must be clean`                  | You skipped step 4.                                                                                                                   | Commit the release notes.               |
| `before:init` hook failed                    | `pnpm check` failed — lint, format or typecheck. Dry runs skip this, real releases don't.                                             | Fix the code, then re-run.              |
| Notes test fails                             | Usually a missing `fa`, or `package.json`'s version doesn't match the newest notes file.                                              | Read the assertion; it names the field. |
| GitHub Release has no Highlights             | The notes file wasn't committed at the tag.                                                                                           | Commit it, then re-cut (see below).     |
| `git push` succeeded but no Release appeared | You pushed without `--follow-tags`, so no tag reached GitHub.                                                                         | `git push --tags`.                      |

## Undoing a release

**Before pushing** — nothing is public, so it's fully recoverable:

```bash
git tag -d v1.1.0        # drop the tag
git reset --hard HEAD~1  # drop the chore(release) commit
```

Then fix whatever was wrong and re-run `pnpm release`.

**After pushing**, don't rewrite the tag — cut a new patch release instead. If only the notes were
wrong, you can fix the GitHub Release text in place without touching git:

```bash
node scripts/extract-changelog.mjs 1.1.0 > /tmp/notes.md   # after correcting the JSON
gh release edit v1.1.0 --notes-file /tmp/notes.md
```

The in-app `/changelog` corrects itself on the next deploy, since it reads the committed JSON.

## Verifying a release

```bash
node scripts/extract-changelog.mjs 1.1.0   # exactly what the GitHub Release will contain
gh run list --workflow=release.yml --limit 3
gh release view v1.1.0
```

Then confirm [/changelog](https://kharji.app/changelog) shows the new entry, in both English and
Persian.

## What each piece does

- **`.release-it.json`** — bumps the version, regenerates `CHANGELOG.md` via
  `@release-it/conventional-changelog`, commits as `chore(release): v<x>`, and creates an
  annotated `v<x>` tag. `push: false` and `github.release: false` mean nothing leaves your machine
  until you push, and no `GITHUB_TOKEN` is needed locally.
- **`before:init: pnpm check`** — refuses to release from a tree that fails lint, format or
  typecheck.
- **`after:bump`** — runs Prettier over the generated `CHANGELOG.md`, because the generator's
  output doesn't match this repo's Prettier config and `pnpm format:check` globs `**/*.md`.
- **`commitlint.config.mjs` + `.husky/commit-msg`** — rejects non-conventional commit messages at
  commit time, which is what keeps the generated changelog readable.
- **`scripts/extract-changelog.mjs`** — merges the curated highlights with the matching
  `CHANGELOG.md` section into GitHub Release notes.
- **`.github/workflows/release.yml`** — fires on a `v*.*.*` tag push and creates the GitHub
  Release. Node-only, no install step.
- **`src/content/releases/__tests__/releases.test.ts`** — the guard that stops a half-translated
  or misnumbered release.

## Release notes reference

- `type` is `feature`, `improvement` or `fix` — it picks the icon and colour on the page.
- `version` is plain semver, no `v` prefix, and must equal the filename and `package.json`.
- `date` is `YYYY-MM-DD` and cannot be in the future.
- `title` and `summary` are optional; `highlights` needs at least one entry.
- Persian copy uses the app's casual voice, matching `messages/fa.json` — not the formal register
  of the legal pages.
