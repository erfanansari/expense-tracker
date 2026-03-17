import Link from 'next/link';

import { ArrowRight, Zap } from 'lucide-react';

import Button from '@components/Button';

export default function CtaSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-primary relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Zap className="h-6 w-6 text-white" />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">See it in action</h2>
            <p className="text-xs font-medium text-white/50" dir="rtl">
              همین حالا امتحان کنید
            </p>

            <p className="mx-auto mt-4 mb-8 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              Explore the demo account pre-loaded with 5 years of realistic financial data. No sign-up needed.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="text-text-primary w-full border-white/20 bg-white px-6 py-3 hover:bg-white/90 sm:w-auto"
                >
                  <span className="flex items-center gap-2">
                    Try the Demo
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-transparent px-6 py-3 text-white hover:bg-white/10 sm:w-auto"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
