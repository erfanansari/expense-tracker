import { BarChart3, LayoutDashboard, PieChart, TrendingUp, Wallet } from 'lucide-react';

import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Wallet className="h-6 w-6" />,
      title: 'Smart Expense Tracking',
      titleFa: 'ردیابی هوشمند هزینه‌ها',
      description: 'Track daily expenses with categories, tags, and dual currency support (USD/Toman).',
      descriptionFa: 'ردیابی هزینه‌های روزانه با دسته‌بندی، برچسب و پشتیبانی از دو ارز (دلار/تومان)',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Income Management',
      titleFa: 'مدیریت درآمدها',
      description: 'Monitor monthly income across multiple sources including salary, freelance, and investments.',
      descriptionFa: 'پیگیری درآمد ماهانه از منابع مختلف شامل حقوق، فریلنس و سرمایه‌گذاری',
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: 'Asset Portfolio',
      titleFa: 'پرتفوی دارایی‌ها',
      description: 'Track your wealth across 7 categories: cash, crypto, commodities, vehicles, property, and more.',
      descriptionFa: 'ردیابی دارایی‌های شما در ۷ دسته: نقدینگی، رمزارز، کالا، وسیله نقلیه، املاک و بیشتر',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Visual Reports',
      titleFa: 'گزارش‌های بصری',
      description: 'Analyze spending patterns with interactive charts, heatmaps, and detailed breakdowns.',
      descriptionFa: 'تحلیل الگوهای هزینه با نمودارهای تعاملی، نقشه حرارتی و جزئیات کامل',
    },
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: 'Real-time Dashboard',
      titleFa: 'داشبورد زنده',
      description:
        'Get instant insights into your financial health with income vs expenses comparisons and net worth tracking.',
      descriptionFa: 'دریافت بینش لحظه‌ای از سلامت مالی با مقایسه درآمد و هزینه و ردیابی ارزش خالص',
    },
  ];

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-text-primary mb-4 text-3xl font-bold sm:text-4xl">
            Powerful Features for Financial Success
          </h2>
          <p className="text-text-secondary mx-auto max-w-2xl text-base sm:text-lg">
            Everything you need to manage your personal finances in one place.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
