import { Briefcase, Globe, Layers, LineChart, Tags } from 'lucide-react';

const stats = [
  {
    icon: <Layers className="h-5 w-5" />,
    value: '7',
    label: 'Asset Categories',
    labelFa: 'دسته دارایی',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    value: '2',
    label: 'Currencies',
    labelFa: 'ارز',
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    value: '5',
    label: 'Income Types',
    labelFa: 'نوع درآمد',
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    value: '5+',
    label: 'Report Types',
    labelFa: 'نوع گزارش',
  },
  {
    icon: <Tags className="h-5 w-5" />,
    value: '\u221E',
    label: 'Custom Tags',
    labelFa: 'برچسب دلخواه',
  },
];

const StatsSection = () => {
  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="border-border-subtle bg-background-secondary overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`border-border-subtle flex flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10 ${
                  i < stats.length - 1 ? 'border-b lg:border-r lg:border-b-0' : ''
                } ${i < stats.length - 2 ? 'sm:border-r' : ''} ${i === stats.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="text-text-muted mb-3">{stat.icon}</div>
                <div className="text-text-primary mb-1 text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</div>
                <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
                <div className="text-text-muted mt-0.5 text-xs" dir="rtl">
                  {stat.labelFa}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
