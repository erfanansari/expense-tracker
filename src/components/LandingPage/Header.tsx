'use client';

import Link from 'next/link';

import { Zap } from 'lucide-react';

import Button from '@components/Button';

const Header = () => {
  return (
    <header className="border-border-subtle bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Kharji home">
          <div className="bg-primary rounded-md p-2">
            <Zap className="text-primary-foreground h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-text-primary text-base font-bold sm:text-lg">Kharji</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
            Sign in
          </Link>
          <Link href="/signup">
            <Button variant="primary">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
