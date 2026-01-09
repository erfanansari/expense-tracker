'use client';

import { User, Bell, Lock, Globe, Palette, Database, HelpCircle } from 'lucide-react';
import Button from '@components/Button';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#171717]">Settings</h1>
              <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">Manage your account and preferences</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="grid gap-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <User className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Profile</h2>
                    <p className="text-sm text-[#a3a3a3]">Update your personal information</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#525252] mb-2">Username</label>
                      <input
                        type="text"
                        defaultValue="erfanansari"
                        className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#525252] mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="dev.erfanansari@gmail.com"
                        className="w-full px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="primary">
                      Save Changes
                    </Button>
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <Bell className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Notifications</h2>
                    <p className="text-sm text-[#a3a3a3]">Manage your notification preferences</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#171717]">Email Notifications</p>
                      <p className="text-xs text-[#a3a3a3] mt-0.5">Receive email updates about your expenses</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#e5e5e5] transition-colors hover:bg-[#d4d4d4]">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#171717]">Weekly Reports</p>
                      <p className="text-xs text-[#a3a3a3] mt-0.5">Get weekly expense summaries</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0070f3]">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
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
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
                <div className="p-6 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
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
                    <select className="w-full px-4 py-2.5 pr-10 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all appearance-none cursor-pointer">
                      <option>English</option>
                      <option>فارسی (Persian)</option>
                    </select>
                    <svg className="h-4 w-4 text-[#a3a3a3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
                <div className="p-6 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
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
                    <select className="w-full px-4 py-2.5 pr-10 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all appearance-none cursor-pointer">
                      <option>Light Mode</option>
                      <option disabled>Dark Mode (Coming Soon)</option>
                    </select>
                    <svg className="h-4 w-4 text-[#a3a3a3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <Database className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Data Management</h2>
                    <p className="text-sm text-[#a3a3a3]">Export or delete your data</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <Button variant="outline">
                    Export Data
                  </Button>
                  <Button variant="danger">
                    Delete All Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm">
              <div className="p-6 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
                    <HelpCircle className="h-5 w-5 text-[#525252]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#171717]">Help & Support</h2>
                    <p className="text-sm text-[#a3a3a3]">Get help or send feedback</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <Button variant="outline">
                    Documentation
                  </Button>
                  <Button variant="outline">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
