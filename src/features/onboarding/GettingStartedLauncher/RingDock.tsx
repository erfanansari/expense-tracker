'use client';

import { Rocket } from 'lucide-react';

import { onboardingCopy } from '@features/onboarding/copy';

const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface RingDockProps {
  done: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
}

/** Collapsed launcher: circular button with a progress ring that fills per step. */
const RingDock = ({ done, total, expanded, onToggle }: RingDockProps) => {
  // A ~4% head-start arc keeps the ring legible as a progress ring at 0/3
  const progress = Math.max(done / total, 0.04);
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`${onboardingCopy.checklist.title} — ${onboardingCopy.checklist.progress(done, total)}`}
      title={onboardingCopy.checklist.title}
      className="group relative h-[52px] w-[52px] rounded-full shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none"
    >
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r={RING_RADIUS} className="fill-background stroke-border-subtle" strokeWidth="3.5" />
        <circle
          cx="26"
          cy="26"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="stroke-success transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <Rocket
          className="text-text-secondary group-hover:text-text-primary h-5 w-5 transition-colors"
          aria-hidden="true"
        />
      </span>
      {/* Redundant while the panel is open — its header already shows progress */}
      {!expanded && (
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 rounded-full px-1.5 py-px text-[9px] font-semibold tabular-nums">
          {done}/{total}
        </span>
      )}
    </button>
  );
};

export default RingDock;
