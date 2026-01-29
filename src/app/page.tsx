import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import CtaSection from '@/components/LandingPage/CtaSection';
import FeaturesSection from '@/components/LandingPage/FeaturesSection';
import Header from '@/components/LandingPage/Header';
import Hero from '@/components/LandingPage/Hero';
import OpenSourceSection from '@/components/LandingPage/OpenSourceSection';
import StatsSection from '@/components/LandingPage/StatsSection';

export const metadata: Metadata = {
  title: 'Kharji - Personal Finance Tracker',
  description:
    'Track expenses, manage income, and grow your wealth with Kharji personal finance tracker. Free and open source.',
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <OpenSourceSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
