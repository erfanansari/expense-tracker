import Link from 'next/link';

import { Github, Zap } from 'lucide-react';

import Button from '@/components/Button';

export default function Header() {
  return (
    <header className="border-border-subtle bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-2">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-text-primary text-xl font-bold">Kharji</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://github.com/erfanansari/kharji"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary rounded-lg p-2 transition-colors"
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
