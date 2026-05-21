'use client';

import { Palette } from 'lucide-react';

import Select from '@components/Select';

const APPEARANCE_OPTIONS = [
  { value: 'light', label: 'Light Mode' },
  { value: 'dark', label: 'Dark Mode' },
];

const AppearanceSection = () => (
  <div className="border-border-subtle bg-background rounded-xl border opacity-60 shadow-sm">
    <div className="border-border-subtle border-b p-6">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
          <Palette className="text-text-secondary h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-text-primary text-lg font-semibold">Appearance</h2>
            <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
              Coming Soon
            </span>
          </div>
          <p className="text-text-muted text-sm">Customize the look and feel</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <Select value="light" onChange={() => {}} options={APPEARANCE_OPTIONS} disabled />
    </div>
  </div>
);

export default AppearanceSection;
