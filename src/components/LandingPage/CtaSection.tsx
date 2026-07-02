import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import Button from '@components/Button';

const CtaSection = () => {
  return (
    <section className="border-border-subtle border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
          Start seeing your money clearly.
        </h2>
        <p className="text-text-secondary mx-auto mt-4 max-w-md text-base leading-relaxed">
          Set up in under a minute. Your full financial picture, always at hand.
        </p>
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link href="/signup">
            <Button variant="primary" className="px-6 py-3">
              <span className="flex items-center gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
