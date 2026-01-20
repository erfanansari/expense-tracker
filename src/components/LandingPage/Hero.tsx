import Link from 'next/link';

import { ArrowRight, Zap } from 'lucide-react';

import Button from '@/components/Button';

export default function Hero() {
  return (
    <section className="from-background-secondary to-background min-h-[calc(100vh-4rem)] bg-gradient-to-b">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-3">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <span className="text-text-primary text-3xl font-bold sm:text-4xl">Kharji</span>
          </div>
          <p className="text-text-muted text-sm sm:text-base">Personal Finance Tracker</p>
        </div>

        {/* Headline */}
        <h1 className="text-text-primary mb-6 text-center text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
          Take Control of Your Finances
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary mb-10 max-w-2xl text-center text-base sm:mb-12 sm:text-lg lg:text-xl">
          Track expenses, manage income, and grow your wealth—all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/signup">
            <Button variant="primary" className="w-full sm:w-auto">
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
