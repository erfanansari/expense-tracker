'use client';

import { Bell, Database, Globe, HelpCircle, Lock, Palette, Tag, User } from 'lucide-react';

import Button from '@components/Button';

import TagManagementList from '@/features/expenses/components/TagManagementList';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[#171717] sm:text-2xl md:text-3xl">Settings</h1>
            <p className="mt-1 text-xs text-[#a3a3a3] sm:text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6">
          {/* Profile Settings */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <User className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Profile</h2>
                  <p className="text-sm text-[#a3a3a3]">Update your personal information</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid max-w-2xl gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#525252]">Username</label>
                    <input
                      type="text"
                      defaultValue="erfanansari"
                      className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#525252]">Email</label>
                    <input
                      type="email"
                      defaultValue="dev.erfanansari@gmail.com"
                      className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
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
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <Tag className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Tags</h2>
                  <p className="text-sm text-[#a3a3a3]">Manage your expense tags</p>
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
            <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <div className="border-b border-[#e5e5e5] p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                    <Globe className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Language</h2>
                    <p className="text-sm text-[#a3a3a3]">Select your preferred language</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none">
                    <option>English</option>
                    <option>فارسی (Persian)</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]"
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
            <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <div className="border-b border-[#e5e5e5] p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                    <Palette className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Appearance</h2>
                    <p className="text-sm text-[#a3a3a3]">Customize the look and feel</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none">
                    <option>Light Mode</option>
                    <option disabled>Dark Mode (Coming Soon)</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]"
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
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <Bell className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Notifications</h2>
                  <p className="text-sm text-[#a3a3a3]">Manage your notification preferences</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#171717]">Email Notifications</p>
                    <p className="mt-0.5 text-xs text-[#a3a3a3]">Receive email updates about your expenses</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#e5e5e5] transition-colors hover:bg-[#d4d4d4]">
                    <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#171717]">Weekly Reports</p>
                    <p className="mt-0.5 text-xs text-[#a3a3a3]">Get weekly expense summaries</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0070f3]">
                    <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <Lock className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Security</h2>
                  <p className="text-sm text-[#a3a3a3]">Manage your password and security settings</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="max-w-2xl">
                <Button variant="outline">Change Password</Button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <Database className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Data Management</h2>
                  <p className="text-sm text-[#a3a3a3]">Export or delete your data</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
                <Button variant="outline">Export Data</Button>
                <Button variant="danger">Delete All Data</Button>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
            <div className="border-b border-[#e5e5e5] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2">
                  <HelpCircle className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#171717]">Help & Support</h2>
                  <p className="text-sm text-[#a3a3a3]">Get help or send feedback</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
                <Button variant="outline">Documentation</Button>
                <Button variant="outline">Contact Support</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
