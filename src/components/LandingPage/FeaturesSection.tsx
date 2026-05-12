import { Banknote, Building2, LineChart } from 'lucide-react';

const FEATURES = [
  {
    icon: Banknote,
    title: 'Dual currency',
    description: 'Every transaction in USD and Toman, side-by-side. Live conversion, manual override when you need it.',
  },
  {
    icon: LineChart,
    title: 'Clear reports',
    description: 'Cashflow, categories, net worth. Clean charts that surface decisions instead of vanity metrics.',
  },
  {
    icon: Building2,
    title: 'Assets watched',
    description: 'Cash, crypto, property, vehicles — log once and your net worth recomputes as rates move.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-24 lg:px-8">
      <div className="grid gap-10 sm:gap-12 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title}>
            <Icon className="text-text-primary h-5 w-5" aria-hidden="true" />
            <h3 className="text-text-primary mt-5 text-base font-semibold">{title}</h3>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
