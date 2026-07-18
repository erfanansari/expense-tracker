export type EmailLocale = 'en' | 'fa';

/** Cross-client Farsi-safe stack — Tahoma has solid Farsi glyph coverage in
 * Outlook/Gmail where the Google Font link may be stripped. */
export const FONT_STACKS: Record<EmailLocale, string> = {
  en: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fa: '"Vazirmatn", Tahoma, "Segoe UI", Arial, sans-serif',
};

export function emailDir(locale: EmailLocale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}

/** <link> tag markup for the Vazirmatn webfont — best-effort, clients that
 * strip <link> fall back to FONT_STACKS.fa's Tahoma stack. */
export const VAZIRMATN_FONT_LINK = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap';

export const AUTH_EMAIL_STRINGS = {
  en: {
    greeting: (firstName: string | null) => (firstName ? `Hi ${firstName},` : 'Hi there,'),
    verify: {
      preview: 'Confirm your email address to start using Kharji.',
      heading: 'Verify your email',
      body: (greeting: string) =>
        `${greeting} thanks for signing up for Kharji. Click the button below to confirm this email address and activate your account.`,
      cta: 'Verify email',
      footer: "This link expires in 1 hour. If you didn't create a Kharji account, you can safely ignore this email.",
      subject: 'Verify your email for Kharji',
    },
    reset: {
      preview: 'Reset your Kharji password.',
      heading: 'Reset your password',
      body: (greeting: string) =>
        `${greeting} we received a request to reset the password for your Kharji account. Click the button below to choose a new one.`,
      cta: 'Reset password',
      footer:
        "This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will stay the same.",
      subject: 'Reset your Kharji password',
    },
    passwordChanged: {
      preview: 'Your Kharji password was changed.',
      heading: 'Your password was changed',
      body: (greeting: string) =>
        `${greeting} this is a confirmation that the password for your Kharji account was just changed. If this was you, no action is needed.`,
      warning:
        "If you didn't make this change, reset your password immediately — someone else may have access to your account.",
      cta: 'Reset password',
      footer: 'For security, this change also signed out all other devices on your account.',
      subject: 'Your Kharji password was changed',
    },
    welcome: {
      preview: 'Your finances, finally under control.',
      heading: 'Welcome to Kharji',
      body: 'Kharji helps you track your finances across multiple currencies — expenses, income, assets, and net worth, all in one place.',
      cta: 'Go to dashboard →',
      featuresTitle: null,
      features: [
        {
          color: '#10b981',
          title: 'Expenses',
          description: 'Log daily spending with categories, tags, and multi-currency amounts.',
        },
        {
          color: '#0070f3',
          title: 'Income',
          description: 'Track monthly income by type — salary, freelance, investments, and more.',
        },
        {
          color: '#8b5cf6',
          title: 'Assets & Net Worth',
          description: 'Monitor cash, crypto, gold, real estate, and investments in one place.',
        },
        {
          color: '#f59e0b',
          title: 'Reports & Insights',
          description: 'Spending charts and trends, plus monthly and yearly summaries in your inbox.',
        },
        {
          color: '#171717',
          title: 'Your Data, Yours',
          description: 'Download a full Excel backup anytime, or import expenses from CSV.',
        },
      ],
      footer1: 'Questions or feedback? Just reply to this email.',
      footer2: "You're receiving this because you just created a Kharji account.",
      subject: 'Welcome to Kharji',
    },
    brandFooter: 'Kharji · Personal Finance Tracker',
  },
  fa: {
    greeting: (firstName: string | null) => (firstName ? `${firstName} عزیز،` : 'سلام،'),
    verify: {
      preview: 'ایمیل خود را تأیید کنید تا استفاده از خرجی را شروع کنید.',
      heading: 'ایمیل خود را تأیید کنید',
      body: (greeting: string) =>
        `${greeting} از ثبت‌نام شما در خرجی ممنونیم. برای تأیید این ایمیل و فعال‌سازی حساب خود روی دکمه زیر کلیک کنید.`,
      cta: 'تأیید ایمیل',
      footer: 'این لینک تا ۱ ساعت دیگر معتبر است. اگر حساب خرجی نساخته‌اید، نیازی به کاری نیست.',
      subject: 'تأیید ایمیل شما برای خرجی',
    },
    reset: {
      preview: 'رمز عبور خرجی خود را بازیابی کنید.',
      heading: 'رمز عبور خود را بازیابی کنید',
      body: (greeting: string) =>
        `${greeting} درخواستی برای بازیابی رمز عبور حساب خرجی شما دریافت کردیم. برای انتخاب رمز جدید روی دکمه زیر کلیک کنید.`,
      cta: 'بازیابی رمز عبور',
      footer:
        'این لینک تا ۱ ساعت دیگر معتبر است. اگر درخواست بازیابی رمز نداده‌اید، نیازی به کاری نیست — رمز عبور شما تغییر نخواهد کرد.',
      subject: 'بازیابی رمز عبور خرجی',
    },
    passwordChanged: {
      preview: 'رمز عبور خرجی شما تغییر کرد.',
      heading: 'رمز عبور شما تغییر کرد',
      body: (greeting: string) =>
        `${greeting} این پیام تأییدیه‌ای است که رمز عبور حساب خرجی شما هم‌اکنون تغییر کرد. اگر این تغییر را شما انجام داده‌اید، نیازی به کاری نیست.`,
      warning:
        'اگر این تغییر را شما انجام نداده‌اید، فوراً رمز عبور خود را بازیابی کنید — ممکن است فرد دیگری به حساب شما دسترسی داشته باشد.',
      cta: 'بازیابی رمز عبور',
      footer: 'برای امنیت بیشتر، این تغییر همچنین همه دستگاه‌های دیگر متصل به حساب شما را خارج کرد.',
      subject: 'رمز عبور خرجی شما تغییر کرد',
    },
    welcome: {
      preview: 'امور مالی شما، بالاخره مرتب و قابل‌دیدن.',
      heading: 'به خرجی خوش آمدید',
      body: 'خرجی کمک می‌کند امور مالی‌تان را در چند ارز مختلف دنبال کنید — هزینه‌ها، درآمد، دارایی‌ها و ارزش خالص، همه در یک‌جا.',
      cta: '→ رفتن به داشبورد',
      featuresTitle: null,
      features: [
        {
          color: '#10b981',
          title: 'هزینه‌ها',
          description: 'هزینه‌های روزانه را با دسته‌بندی، برچسب و مبالغ چندارزی ثبت کنید.',
        },
        {
          color: '#0070f3',
          title: 'درآمد',
          description: 'درآمد ماهانه را بر اساس نوع پیگیری کنید — حقوق، فریلنسری، سرمایه‌گذاری و موارد دیگر.',
        },
        {
          color: '#8b5cf6',
          title: 'دارایی‌ها و ارزش خالص',
          description: 'نقد، ارز دیجیتال، طلا، املاک و سرمایه‌گذاری‌ها را در یک‌جا زیر نظر داشته باشید.',
        },
        {
          color: '#f59e0b',
          title: 'گزارش‌ها و تحلیل‌ها',
          description: 'نمودارها و روندهای هزینه، به‌همراه خلاصه‌های ماهانه و سالانه در ایمیل شما.',
        },
        {
          color: '#171717',
          title: 'داده‌های شما، متعلق به شما',
          description: 'هر زمان یک نسخه پشتیبان اکسل کامل دانلود کنید، یا هزینه‌ها را از CSV وارد کنید.',
        },
      ],
      footer1: 'سؤال یا بازخوردی دارید؟ فقط به همین ایمیل پاسخ دهید.',
      footer2: 'این ایمیل به این دلیل برای شما ارسال شده که به‌تازگی یک حساب خرجی ساخته‌اید.',
      subject: 'به خرجی خوش آمدید',
    },
    brandFooter: 'خرجی · مدیریت مالی شخصی',
  },
} as const;

export const REPORT_STRINGS = {
  en: {
    greeting: (firstName: string | null) => (firstName ? `Hi ${firstName},` : 'Hi there,'),
    monthly: {
      subject: (periodLabel: string) => `Your ${periodLabel} report from Kharji`,
      title: (periodLabel: string) => `Your ${periodLabel} report`,
      subtitle: "Here's a quick look at how the month went.",
      preview: (periodLabel: string, expenses: string, net: string) =>
        `Your ${periodLabel} report — ${expenses} spent, ${net} net.`,
      topCategoriesSubtitle: (periodLabel: string) => `Where your money went in ${periodLabel}.`,
    },
    yearly: {
      subject: (periodLabel: string) => `Your ${periodLabel} year in review`,
      title: (periodLabel: string) => `Your ${periodLabel} in review`,
      subtitle: 'Twelve months of expenses, income, and savings in one place.',
      preview: (periodLabel: string, expenses: string, saved: string) =>
        `Your ${periodLabel} year in review — ${expenses} spent, ${saved} saved.`,
      totalSaved: (pct: string) => `Total saved · ${pct}% savings rate`,
      monthByMonth: 'Month by month',
      bestMonth: 'Best month',
      worstMonth: 'Worst month',
      topCategoriesOf: (periodLabel: string) => `Top categories of ${periodLabel}`,
      topCategoriesSubtitle: "Where most of the year's money went.",
    },
    totalSpent: 'Total spent',
    totalIncome: 'Total income',
    net: 'Net (income − expenses)',
    vsLabel: (label: string) => `vs ${label}`,
    topCategories: 'Top categories',
    income: 'Income',
    expenses: 'Expenses',
    layout: {
      defaultFooter: "You're receiving this because you have report emails enabled in your Kharji settings.",
      viewDashboard: 'View dashboard',
      unsubscribe: 'Unsubscribe',
    },
    brandFooter: 'Kharji · Personal Finance Tracker',
  },
  fa: {
    greeting: (firstName: string | null) => (firstName ? `${firstName} عزیز،` : 'سلام،'),
    monthly: {
      subject: (periodLabel: string) => `گزارش ${periodLabel} شما از خرجی`,
      title: (periodLabel: string) => `گزارش ${periodLabel} شما`,
      subtitle: 'نگاهی سریع به وضعیت این ماه.',
      preview: (periodLabel: string, expenses: string, net: string) =>
        `گزارش ${periodLabel} شما — ${expenses} خرج شد، ${net} خالص.`,
      topCategoriesSubtitle: (periodLabel: string) => `هزینه‌های شما در ${periodLabel} کجا رفت.`,
    },
    yearly: {
      subject: (periodLabel: string) => `مرور سال ${periodLabel} شما`,
      title: (periodLabel: string) => `مرور سال ${periodLabel} شما`,
      subtitle: 'دوازده ماه هزینه، درآمد و پس‌انداز در یک‌جا.',
      preview: (periodLabel: string, expenses: string, saved: string) =>
        `مرور سال ${periodLabel} شما — ${expenses} خرج شد، ${saved} پس‌انداز شد.`,
      totalSaved: (pct: string) => `کل پس‌انداز · نرخ پس‌انداز ${pct}٪`,
      monthByMonth: 'ماه به ماه',
      bestMonth: 'بهترین ماه',
      worstMonth: 'ضعیف‌ترین ماه',
      topCategoriesOf: (periodLabel: string) => `دسته‌های پرهزینهٔ ${periodLabel}`,
      topCategoriesSubtitle: 'بیشترین هزینه‌های سال کجا رفت.',
    },
    totalSpent: 'کل هزینه',
    totalIncome: 'کل درآمد',
    net: 'خالص (درآمد − هزینه)',
    vsLabel: (label: string) => `نسبت به ${label}`,
    topCategories: 'دسته‌های پرهزینه',
    income: 'درآمد',
    expenses: 'هزینه',
    layout: {
      defaultFooter: 'این ایمیل به این دلیل برای شما ارسال شده که گزارش‌های ایمیلی در تنظیمات خرجی شما فعال است.',
      viewDashboard: 'مشاهده داشبورد',
      unsubscribe: 'لغو اشتراک',
    },
    brandFooter: 'خرجی · مدیریت مالی شخصی',
  },
} as const;
