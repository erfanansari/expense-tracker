'use client';

import { useEffect, useRef } from 'react';

import { useTranslations } from 'next-intl';

import { CheckCircle2 } from 'lucide-react';

// One honest celebration: a small hand-rolled particle burst (~1s), no deps.
const PARTICLE_COUNT = 22;
const BURST_MS = 900;
const COLORS = ['#10b981', '#171717', '#0070f3', '#f59e0b'];

function playBurst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const { width, height } = canvas;
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (i % 3) * 0.2;
    const speed = 1.6 + (i % 5) * 0.5;
    return {
      x: width / 2,
      y: height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      size: 2.5 + (i % 3),
      color: COLORS[i % COLORS.length],
    };
  });

  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const t = (now - start) / BURST_MS;
    ctx.clearRect(0, 0, width, height);
    if (t >= 1) return;
    ctx.globalAlpha = 1 - t;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Final state: all three steps done — celebrate once, then the launcher retires. */
const CompletionCelebration = () => {
  const t = useTranslations('onboarding.checklist.completion');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // matchMedia is absent in some test environments
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    return playBurst(canvas);
  }, []);

  return (
    <div className="relative animate-[gs-slide-up_0.3s_ease-out] px-4 py-5 text-center motion-reduce:animate-none">
      <canvas
        ref={canvasRef}
        width="288"
        height="140"
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto"
        aria-hidden="true"
      />
      <CheckCircle2
        className="text-success mx-auto h-8 w-8 animate-[gs-pop_0.5s_ease-out_both] motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div className="text-text-primary mt-2 text-sm font-semibold">{t('title')}</div>
      <p className="text-text-muted mx-auto mt-1 max-w-[240px] text-xs">{t('body')}</p>
      <div className="bg-success mt-4 h-1 rounded-full" />
    </div>
  );
};

export default CompletionCelebration;
