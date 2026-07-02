import { Banknote, Building2, DatabaseBackup, History, PieChart, Tags } from 'lucide-react';

const FEATURES = [
  {
    icon: Banknote,
    title: 'Multi-currency',
    description: 'Toman, dollars, euros, pounds, lira, dirham — pick your pair and see every amount in both.',
  },
  {
    icon: History,
    title: 'Rates that remember',
    description:
      'Every record converts at the live exchange rate from its own date, not today’s. History that stays true.',
  },
  {
    icon: Building2,
    title: 'Assets & net worth',
    description: 'Cash, crypto, gold, property, vehicles — with valuation history and a net-worth chart that follows.',
  },
  {
    icon: PieChart,
    title: 'Clear reports',
    description:
      'Spending by category, trends over time — daily, weekly, or monthly. Plus summaries in your inbox if you want them.',
  },
  {
    icon: Tags,
    title: 'Tags & categories',
    description: 'Organize spending your way with custom categories, and tags you create inline as you type.',
  },
  {
    icon: DatabaseBackup,
    title: 'Your data, yours',
    description: 'Backed up automatically every day. Export everything to Excel — or import it back — anytime.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="border-border-subtle border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need, nothing you don&apos;t.
          </h2>
          <p className="text-text-secondary mt-4 text-base leading-relaxed">
            No budgets that guilt you. No subscriptions to forget. Just an honest picture of your money.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border-border-subtle bg-background hover:bg-background-secondary rounded-xl border p-6 transition-colors sm:p-8"
            >
              <div className="border-border-subtle bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg border">
                <Icon className="text-text-primary h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-text-primary mt-5 text-base font-semibold">{title}</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
