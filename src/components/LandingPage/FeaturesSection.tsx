import { BarChart3, DollarSign, LayoutDashboard, PieChart, TrendingUp, Wallet } from 'lucide-react';

import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Wallet className="h-5 w-5" />,
      title: 'Smart Expense Tracking',
      titleFa: 'ردیابی هوشمند هزینه‌ها',
      description:
        'Categorize spending with tags, notes, and automatic dual currency conversion between USD and Toman.',
      descriptionFa: 'دسته‌بندی هزینه‌ها با برچسب، یادداشت و تبدیل خودکار دو ارز دلار و تومان',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Income Management',
      titleFa: 'مدیریت درآمدها',
      description: 'Monitor salary, freelance, investment returns, and gifts — all income sources in one timeline.',
      descriptionFa: 'پیگیری حقوق، فریلنس، سود سرمایه‌گذاری و هدایا — تمام منابع درآمد در یک جا',
    },
    {
      icon: <PieChart className="h-5 w-5" />,
      title: 'Asset Portfolio',
      titleFa: 'پرتفوی دارایی‌ها',
      description: 'Track wealth across cash, crypto, commodities, vehicles, property, bank accounts, and investments.',
      descriptionFa: 'ردیابی دارایی در نقدینگی، رمزارز، کالا، وسیله نقلیه، املاک، بانک و سرمایه‌گذاری',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Visual Reports',
      titleFa: 'گزارش‌های بصری',
      description: 'Spending heatmaps, category breakdowns, and monthly trends to understand where your money goes.',
      descriptionFa: 'نقشه حرارتی هزینه، تحلیل دسته‌بندی و روندهای ماهانه برای درک بهتر مالی',
    },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: 'Live Dashboard',
      titleFa: 'داشبورد زنده',
      description: 'Real-time overview with income vs expenses, net worth tracking, and asset distribution charts.',
      descriptionFa: 'نمای کلی لحظه‌ای با مقایسه درآمد و هزینه، ارزش خالص و نمودار توزیع دارایی',
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: 'Dual Currency',
      titleFa: 'دو ارزی',
      description: 'Every transaction is recorded in both USD and Toman with live exchange rates built in.',
      descriptionFa: 'هر تراکنش به دلار و تومان با نرخ ارز زنده ثبت می‌شود',
    },
  ];

  return (
    <section className="bg-background-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-12 sm:mb-16">
          <p className="text-text-muted mb-3 text-xs font-semibold tracking-widest uppercase">Features</p>
          <h2 className="text-text-primary mb-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Everything to manage
            <br className="hidden sm:block" /> your financial life
          </h2>
          <p className="text-text-tertiary text-sm" dir="rtl">
            همه آنچه برای مدیریت زندگی مالی‌تان نیاز دارید
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
