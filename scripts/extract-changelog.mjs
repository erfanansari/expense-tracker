#!/usr/bin/env node
/**
 * Builds GitHub Release notes for a version and prints them to stdout.
 *
 * Combines the two changelog tracks:
 *   1. The curated, user-facing highlights from src/content/releases/<version>.json
 *   2. The auto-generated commit list from the matching CHANGELOG.md section
 *
 * Usage: node scripts/extract-changelog.mjs 1.2.3
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const HIGHLIGHT_LABELS = {
  feature: 'New',
  improvement: 'Improved',
  fix: 'Fixed',
};

/** Strips a leading `v` so both `v1.2.3` and `1.2.3` work as input. */
const normalizeVersion = (input) => input.replace(/^v/, '');

const readFileOrNull = (path) => {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns the curated highlights as markdown, or null when no notes file exists.
 * English only — the Farsi copy is for the in-app changelog page.
 */
const buildHighlights = (version) => {
  const raw = readFileOrNull(join(REPO_ROOT, 'src', 'content', 'releases', `${version}.json`));
  if (!raw) return null;

  const release = JSON.parse(raw);
  const lines = [];

  if (release.title?.en) lines.push(`## ${release.title.en}`, '');
  if (release.summary?.en) lines.push(release.summary.en, '');

  for (const highlight of release.highlights ?? []) {
    const label = HIGHLIGHT_LABELS[highlight.type] ?? 'Changed';
    lines.push(`- **${label}** — ${highlight.en}`);
  }

  return lines.join('\n').trim();
};

/**
 * Matches any release heading, e.g. `## [1.1.0](link) (date)` or `### 1.0.1 (date)`.
 *
 * The conventionalcommits preset emits `##` for major/minor releases and `###` for
 * patches — but it also emits `###` for the group headings ("Features", "Bug Fixes")
 * *inside* a section. So a section can only be terminated by a heading that carries a
 * version number; matching on heading level alone would truncate the section at its
 * first "Features" line.
 */
const ANY_RELEASE_HEADING = /^#{2,3}\s+\[?\d+\.\d+\.\d+/;

/** Returns the CHANGELOG.md section for a version, or null if absent. */
const buildCommitLog = (version) => {
  const changelog = readFileOrNull(join(REPO_ROOT, 'CHANGELOG.md'));
  if (!changelog) return null;

  const lines = changelog.split('\n');
  const versionPattern = new RegExp(`^#{2,3}\\s+\\[?${escapeForRegex(version)}\\]?[\\s(\\]]`);

  const start = lines.findIndex((line) => versionPattern.test(line));
  if (start === -1) return null;

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => ANY_RELEASE_HEADING.test(line));
  const body = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();

  return body || null;
};

const main = () => {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node scripts/extract-changelog.mjs <version>');
    process.exit(1);
  }

  const version = normalizeVersion(input);
  const highlights = buildHighlights(version);
  const commitLog = buildCommitLog(version);

  if (!highlights && !commitLog) {
    console.error(`No release notes found for ${version}.`);
    console.error(`Looked for src/content/releases/${version}.json and a "${version}" section in CHANGELOG.md.`);
    process.exit(1);
  }

  const sections = [];
  if (highlights) sections.push(highlights);
  if (commitLog) sections.push(['## Commits', '', commitLog].join('\n'));

  process.stdout.write(`${sections.join('\n\n')}\n`);
};

main();
