import Link from 'next/link';

import { Github, Zap } from 'lucide-react';

import { NAV_ITEMS } from '@/constants';

import pkg from '../../../package.json';

export default function Footer() {
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

  return (
    <footer className="border-border-subtle bg-background border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Kharji home">
            <div className="bg-primary rounded-md p-2">
              <Zap className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Version + GitHub */}
        <div className="flex items-center gap-5">
          <span className="text-text-muted font-mono text-xs">
            v{pkg.version} · {commitSha}
          </span>
          <a
            href="https://github.com/erfanansari/kharji"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
