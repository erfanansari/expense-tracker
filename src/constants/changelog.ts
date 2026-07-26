import { ArrowUp, Bug, Sparkles } from 'lucide-react';

import type { ReleaseHighlightType } from '@types';

/** Releases shown per page on /changelog. */
export const RELEASES_PER_PAGE = 10;

interface HighlightTypeConfig {
  icon: typeof Sparkles;
  /** Theme tokens only — see the styling rules in CLAUDE.md. */
  iconClassName: string;
  containerClassName: string;
}

export const HIGHLIGHT_TYPES: Record<ReleaseHighlightType, HighlightTypeConfig> = {
  feature: {
    icon: Sparkles,
    iconClassName: 'text-success',
    containerClassName: 'bg-success/10',
  },
  improvement: {
    icon: ArrowUp,
    iconClassName: 'text-blue',
    containerClassName: 'bg-blue/10',
  },
  fix: {
    icon: Bug,
    iconClassName: 'text-warning',
    containerClassName: 'bg-warning/10',
  },
};
