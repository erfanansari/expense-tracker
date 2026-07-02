import CtaSection from '@components/LandingPage/CtaSection';
import FeaturesSection from '@components/LandingPage/FeaturesSection';
import Footer from '@components/LandingPage/Footer';
import Header from '@components/LandingPage/Header';
import Hero from '@components/LandingPage/Hero';
import StatementSection from '@components/LandingPage/StatementSection';

const Landing = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <StatementSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
