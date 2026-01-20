import type { Metadata } from 'next';

import FeaturesSection from '@/components/LandingPage/FeaturesSection';
import Footer from '@/components/LandingPage/Footer';
import Header from '@/components/LandingPage/Header';
import Hero from '@/components/LandingPage/Hero';

export const metadata: Metadata = {
  title: 'Kharji - Personal Finance Tracker',
  description:
    'Track expenses, manage income, and grow your wealth with Kharji personal finance tracker. Free and open source.',
};

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
