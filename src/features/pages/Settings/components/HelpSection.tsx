'use client';

import { HelpCircle } from 'lucide-react';

const LINK_CLASSES =
  'border-button-outline-border bg-background hover:bg-button-outline-bg-hover text-button-outline-text hover:text-button-outline-text-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all';

const HelpSection = () => (
  <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
    <div className="border-border-subtle border-b p-6">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
          <HelpCircle className="text-text-secondary h-5 w-5" />
        </div>
        <div>
          <h2 className="text-text-primary text-lg font-semibold">Help & Support</h2>
          <p className="text-text-muted text-sm">Get help or send feedback</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="https://github.com/erfanansari/kharji#readme"
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSES}
        >
          Documentation
        </a>
        <a
          href="https://github.com/erfanansari/kharji/issues"
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSES}
        >
          Contact Support
        </a>
      </div>
    </div>
  </div>
);

export default HelpSection;
