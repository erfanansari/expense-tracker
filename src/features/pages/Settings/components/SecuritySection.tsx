'use client';

import { Lock } from 'lucide-react';

import Button from '@components/Button';

const SecuritySection = () => (
  <div className="border-border-subtle bg-background rounded-xl border opacity-60 shadow-sm">
    <div className="border-border-subtle border-b p-6">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
          <Lock className="text-text-secondary h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-text-primary text-lg font-semibold">Security</h2>
            <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
              Coming Soon
            </span>
          </div>
          <p className="text-text-muted text-sm">Manage your password and security settings</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="max-w-2xl">
        <Button variant="outline" disabled className="cursor-not-allowed opacity-50">
          Change Password
        </Button>
      </div>
    </div>
  </div>
);

export default SecuritySection;
