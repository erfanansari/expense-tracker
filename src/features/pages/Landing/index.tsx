'use client';

import Footer from '@components/Footer';
import CtaSection from '@components/LandingPage/CtaSection';
import FeaturesSection from '@components/LandingPage/FeaturesSection';
import Header from '@components/LandingPage/Header';
import Hero from '@components/LandingPage/Hero';
import OpenSourceSection from '@components/LandingPage/OpenSourceSection';
import StatsSection from '@components/LandingPage/StatsSection';

const Landing = () => {
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
};

export default Landing;
