import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import Button from '@components/Button';

const Hero = () => {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20">
      <h1 className="text-text-primary text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
        Your finances,
        <br />
        <span className="text-text-muted font-normal">finally clear.</span>
      </h1>

      <p className="text-text-secondary mx-auto mt-6 max-w-xl text-base leading-relaxed sm:mt-8 sm:text-lg">
        A calm personal-finance app for people who think in two currencies. Track expenses, manage income, and watch
        your assets grow.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
        <Link href="/signup" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full px-5 py-3 sm:w-auto">
            <span className="flex items-center gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full px-5 py-3 sm:w-auto">
            Try the demo
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
