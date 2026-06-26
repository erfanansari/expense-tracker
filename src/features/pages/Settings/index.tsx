'use client';

import Pulse from '@components/Skeleton';

import { useAuth } from '@hooks/use-auth';

import AppearanceSection from './components/AppearanceSection';
import CategoryManagement from './components/CategoryManagement';
import CurrencySection from './components/CurrencySection';
import DataManagement from './components/DataManagement';
import HelpSection from './components/HelpSection';
import LanguageSection from './components/LanguageSection';
import NotificationsSection from './components/NotificationsSection';
import ProfileCard from './components/ProfileCard';
import SecuritySection from './components/SecuritySection';
import TagManagement from './components/TagManagement';

function SettingsSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-border-subtle bg-background rounded-xl border shadow-sm">
          <div className="border-border-subtle border-b p-6">
            <div className="flex items-center gap-3">
              <Pulse className="h-9 w-9 rounded-lg" />
              <Pulse className="h-9 w-40 rounded-lg" />
              <div className="flex flex-col gap-2">
                <Pulse className="h-8" />
                <Pulse className="h-6" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-3">
              <Pulse className="h-6 md:w-1/2" />
              <Pulse className="h-8 md:w-1/2" />
              <Pulse className="h-6 md:w-1/2" />
              <Pulse className="h-8 md:w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const SettingsPage = () => {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-text-primary text-xl font-semibold sm:text-2xl md:text-3xl">Settings</h1>
            <p className="text-text-muted mt-1 text-xs sm:text-sm">Manage your account and preferences</p>
          </div>
        </div>

        {loading ? (
          <SettingsSkeleton />
        ) : (
          <div className="grid gap-6">
            <ProfileCard />
            <CurrencySection />
            <CategoryManagement />
            <TagManagement />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <LanguageSection />
              <AppearanceSection />
            </div>

            <NotificationsSection />
            <SecuritySection />
            <DataManagement />
            <HelpSection />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
