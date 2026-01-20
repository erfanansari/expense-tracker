import { Github } from 'lucide-react';

import pkg from '../../../package.json';

export default function Footer() {
  return (
    <footer className="border-border-subtle bg-background-secondary border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Version and Copyright */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <span className="bg-background text-text-tertiary rounded-full px-3 py-1 font-mono text-xs">
            v{pkg.version}
          </span>
          <span className="text-text-secondary text-sm">© 2026 Kharji. All rights reserved.</span>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/erfanansari/kharji"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <Github className="h-4 w-4" />
          <span className="text-sm">View on GitHub</span>
        </a>
      </div>
    </footer>
  );
}
