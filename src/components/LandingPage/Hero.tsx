import Link from 'next/link';

import { ArrowRight, Github, Zap } from 'lucide-react';

import Button from '@components/Button';

function DashboardMockup() {
  return (
    <div className="border-border-subtle bg-background relative overflow-hidden rounded-xl border shadow-lg">
      {/* Title bar */}
      <div className="border-border-subtle bg-background-secondary flex items-center gap-2 border-b px-4 py-3">
        <div className="bg-danger h-2.5 w-2.5 rounded-full opacity-60" />
        <div className="bg-warning h-2.5 w-2.5 rounded-full opacity-60" />
        <div className="bg-success h-2.5 w-2.5 rounded-full opacity-60" />
        <div className="bg-background-elevated ml-3 h-3 flex-1 rounded" />
      </div>

      <div className="flex gap-0">
        {/* Sidebar */}
        <div className="border-border-subtle hidden w-40 shrink-0 border-r p-3 sm:block">
          <div className="bg-primary mb-4 flex items-center gap-2 rounded-lg px-2 py-1.5">
            <Zap className="h-3 w-3 text-white" />
            <div className="h-2 w-14 rounded bg-white/40" />
          </div>
          {[72, 56, 64, 48, 60].map((w, i) => (
            <div key={i} className={`mb-2.5 flex items-center gap-2 px-2 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="bg-border-default h-2.5 w-2.5 rounded" />
              <div className="bg-background-elevated h-2 rounded" style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Stat cards row */}
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {[
              { label: 'Income', value: '$4,850', color: 'bg-success' },
              { label: 'Expenses', value: '$2,340', color: 'bg-danger' },
              { label: 'Net Worth', value: '$86.2K', color: 'bg-blue' },
            ].map((stat, i) => (
              <div key={i} className="border-border-subtle rounded-lg border p-2.5">
                <div className="bg-background-elevated mb-1.5 h-1.5 w-10 rounded" />
                <div className="text-text-primary text-xs font-bold sm:text-sm">{stat.value}</div>
                <div className={`mt-1.5 h-1 w-full rounded ${stat.color} opacity-20`} />
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="border-border-subtle mb-3 rounded-lg border p-3">
            <div className="bg-background-elevated mb-3 h-2 w-24 rounded" />
            <div className="flex items-end gap-1.5" style={{ height: 64 }}>
              {[40, 65, 50, 80, 55, 90, 70, 85, 45, 75, 60, 95].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i % 2 === 0 ? 'bg-primary opacity-70' : 'bg-primary opacity-20'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="space-y-1.5">
            {[80, 65, 72].map((w, i) => (
              <div key={i} className="bg-background-secondary flex items-center gap-2.5 rounded-lg px-3 py-2">
                <div className="bg-background-elevated h-2.5 w-2.5 rounded" />
                <div className="bg-background-elevated h-2 flex-1 rounded" style={{ maxWidth: `${w}%` }} />
                <div className="bg-background-elevated h-2 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div>
            {/* Badges */}
            <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:mb-8">
              <a
                href="https://github.com/erfanansari/kharji"
                target="_blank"
                rel="noopener noreferrer"
                className="border-border-subtle bg-background hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span className="text-text-secondary">Open Source</span>
              </a>
              <span className="border-border-subtle bg-background text-text-tertiary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                <span className="bg-success inline-block h-1.5 w-1.5 rounded-full" />
                Free Forever
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-text-primary mb-4 text-3xl leading-[1.1] font-bold tracking-tight sm:mb-5 sm:text-4xl lg:text-5xl">
              Your finances,
              <br />
              finally clear.
            </h1>

            <p className="text-text-muted mb-1 text-sm font-medium" dir="rtl">
              مدیریت مالی شخصی، ساده و شفاف
            </p>

            {/* Subtitle */}
            <p className="text-text-secondary mt-4 mb-8 max-w-md text-base leading-relaxed sm:mb-10 sm:text-lg">
              Track expenses in dual currency, manage income streams, and watch your assets grow — all from one
              dashboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/signup">
                <Button variant="primary" className="w-full px-6 py-3 sm:w-auto">
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full px-6 py-3 sm:w-auto">
                  Try the Demo
                </Button>
              </Link>
            </div>

            {/* Social proof hint */}
            <p className="text-text-muted mt-5 text-xs sm:mt-6">No credit card required. Your data stays yours.</p>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative">
            {/* Glow effect behind mockup */}
            <div className="bg-primary pointer-events-none absolute -inset-4 rounded-2xl opacity-[0.02] blur-2xl" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
