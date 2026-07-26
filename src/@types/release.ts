export type ReleaseHighlightType = 'feature' | 'improvement' | 'fix';

/** A bilingual string. Both locales are required so a release never ships half-translated. */
export interface LocalizedText {
  en: string;
  fa: string;
}

export interface ReleaseHighlight extends LocalizedText {
  type: ReleaseHighlightType;
}

/**
 * A user-facing release note. Hand-written per release and kept deliberately
 * separate from the auto-generated CHANGELOG.md, which is the developer record.
 */
export interface Release {
  /** Semver, matching the git tag without the `v` prefix. */
  version: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  title?: LocalizedText;
  summary?: LocalizedText;
  highlights: ReleaseHighlight[];
}
