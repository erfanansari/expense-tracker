'use client';

import { Bell } from 'lucide-react';

const ToggleStub = () => (
  <button
    disabled
    aria-label="Toggle"
    className="bg-background-secondary relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full"
  >
    <span className="bg-background-elevated inline-block h-4 w-4 translate-x-1 transform rounded-full" />
  </button>
);

const NotificationsSection = () => (
  <div className="border-border-subtle bg-background rounded-xl border opacity-60 shadow-sm">
    <div className="border-border-subtle border-b p-6">
      <div className="flex items-center gap-3">
        <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
          <Bell className="text-text-secondary h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-text-primary text-lg font-semibold">Notifications</h2>
            <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
              Coming Soon
            </span>
          </div>
          <p className="text-text-muted text-sm">Manage your notification preferences</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm font-medium">Email Notifications</p>
            <p className="text-text-muted mt-0.5 text-xs">Receive email updates about your expenses</p>
          </div>
          <ToggleStub />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm font-medium">Weekly Reports</p>
            <p className="text-text-muted mt-0.5 text-xs">Get weekly expense summaries</p>
          </div>
          <ToggleStub />
        </div>
      </div>
    </div>
  </div>
);

export default NotificationsSection;
