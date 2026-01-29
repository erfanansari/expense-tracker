import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import FeaturesSection from '@/components/LandingPage/FeaturesSection';
import Header from '@/components/LandingPage/Header';
import Hero from '@/components/LandingPage/Hero';

export const metadata: Metadata = {
  title: 'Kharji - Personal Finance Tracker',
  description:
    'Track expenses, manage income, and grow your wealth with Kharji personal finance tracker. Free and open source.',
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="bg-background-content flex-1">
        <Hero />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
