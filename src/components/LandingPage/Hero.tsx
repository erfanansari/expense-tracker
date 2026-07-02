import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import Button from '@components/Button';

const Hero = () => {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-32">
      <span className="border-border-subtle text-text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
        Multi-currency &middot; live exchange rates
      </span>

      <h1 className="text-text-primary mt-6 text-4xl leading-[1.05] font-bold tracking-tight sm:mt-8 sm:text-6xl lg:text-7xl">
        Your finances,
        <br />
        <span className="text-text-muted font-normal">finally clear.</span>
      </h1>

      <p className="text-text-secondary mx-auto mt-6 max-w-xl text-base leading-relaxed sm:mt-8 sm:text-lg">
        A calm personal-finance app for people who think in more than one currency. Track expenses, manage income, and
        watch your assets grow.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row">
        <Link href="/signup" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full px-6 py-3 sm:w-auto">
            <span className="flex items-center gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full px-6 py-3 sm:w-auto">
            Try the demo
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
