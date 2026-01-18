'use client';

import { Bell, Database, Globe, HelpCircle, Lock, Palette, Tag, User } from 'lucide-react';

import Button from '@components/Button';

import TagManagementList from '@/features/expenses/components/TagManagementList';

export default function SettingsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl md:text-3xl">Settings</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6">
          {/* Profile Settings */}
          <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
            <div className="border-border-subtle border-b p-6">
              <div className="flex items-center gap-3">
                <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
                  <User className="text-text-secondary h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-text-primary text-lg font-semibold">Profile</h2>
                  <p className="text-text-muted text-sm">Update your personal information</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid max-w-2xl gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-text-secondary mb-2 block text-sm font-medium">Username</label>
                    <input
                      type="text"
                      defaultValue="erfanansari"
                      className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary mb-2 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      defaultValue="dev.erfanansari@gmail.com"
                      className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
            <div className="border-border-subtle border-b p-6">
              <div className="flex items-center gap-3">
                <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
                  <Tag className="text-text-secondary h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-text-primary text-lg font-semibold">Tags</h2>
                  <p className="text-text-muted text-sm">Manage your expense tags</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TagManagementList />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Language */}
            <div className="border-border-subtle bg-background rounded-xl border opacity-60 shadow-sm">
              <div className="border-border-subtle border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
                    <Globe className="text-text-secondary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-text-primary text-lg font-semibold">Language</h2>
                      <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-text-muted text-sm">Select your preferred language</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  <select
                    disabled
                    className="border-border-subtle bg-background-secondary text-text-muted w-full cursor-not-allowed appearance-none rounded-lg border px-4 py-2.5 pr-10"
                  >
                    <option>English</option>
                    <option>فارسی (Persian)</option>
                  </select>
                  <svg
                    className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Appearance */}
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
                <div className="relative">
                  <select
                    disabled
                    className="border-border-subtle bg-background-secondary text-text-muted w-full cursor-not-allowed appearance-none rounded-lg border px-4 py-2.5 pr-10"
                  >
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                  </select>
                  <svg
                    className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
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
                  <button
                    disabled
                    className="bg-background-secondary relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full"
                  >
                    <span className="bg-background-elevated inline-block h-4 w-4 translate-x-1 transform rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm font-medium">Weekly Reports</p>
                    <p className="text-text-muted mt-0.5 text-xs">Get weekly expense summaries</p>
                  </div>
                  <button
                    disabled
                    className="bg-background-secondary relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full"
                  >
                    <span className="bg-background-elevated inline-block h-4 w-4 translate-x-1 transform rounded-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
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

          {/* Data Management */}
          <div className="border-border-subtle bg-background rounded-xl border opacity-60 shadow-sm">
            <div className="border-border-subtle border-b p-6">
              <div className="flex items-center gap-3">
                <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
                  <Database className="text-text-secondary h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-text-primary text-lg font-semibold">Data Management</h2>
                    <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-text-muted text-sm">Export or delete your data</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
                <Button variant="outline" disabled className="cursor-not-allowed opacity-50">
                  Export Data
                </Button>
                <Button variant="danger" disabled className="cursor-not-allowed opacity-50">
                  Delete All Data
                </Button>
              </div>
            </div>
          </div>

          {/* Help & Support */}
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
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://github.com/erfanansari/kharji#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-button-outline-border bg-background hover:bg-button-outline-bg-hover text-button-outline-text hover:text-button-outline-text-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-medium transition-all"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://github.com/erfanansari/kharji/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-button-outline-border bg-background hover:bg-button-outline-bg-hover text-button-outline-text hover:text-button-outline-text-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-medium transition-all"
                  >
                    Contact Support
                  </a>
                </div>

                {/* App Information */}
                <div className="flex items-center justify-between pt-4 text-xs">
                  <span className="text-text-muted">Version 1.0.0 (MVP)</span>
                  <span className="text-text-muted">© {new Date().getFullYear()} Kharji. All rights reserved.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
