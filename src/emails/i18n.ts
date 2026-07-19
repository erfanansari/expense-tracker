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
      preview: 'ایمیلت رو تأیید کن تا خرجی برات فعال بشه.',
      heading: 'ایمیلت رو تأیید کن',
      body: (greeting: string) =>
        `${greeting} مرسی که به خرجی اومدی. برای تأیید این ایمیل و فعال شدن حسابت، روی دکمهٔ زیر بزن.`,
      cta: 'تأیید ایمیل',
      footer: 'این لینک تا ۱ ساعت دیگه معتبره. اگه حساب خرجی نساختی، این ایمیل رو نادیده بگیر.',
      subject: 'تأیید ایمیل برای خرجی',
    },
    reset: {
      preview: 'بازیابی رمز عبور حساب خرجی.',
      heading: 'بازیابی رمز عبور',
      body: (greeting: string) =>
        `${greeting} درخواستی برای بازیابی رمز حساب خرجیت به دستمون رسید. برای ساختن رمز جدید روی دکمهٔ زیر بزن.`,
      cta: 'ساخت رمز جدید',
      footer: 'این لینک تا ۱ ساعت دیگه معتبره. اگه تو درخواست ندادی، نگران نباش — رمزت همونی که هست می‌مونه.',
      subject: 'بازیابی رمز عبور خرجی',
    },
    passwordChanged: {
      preview: 'رمز عبور حساب خرجیت عوض شد.',
      heading: 'رمزت عوض شد',
      body: (greeting: string) =>
        `${greeting} خواستیم خبر بدیم که رمز عبور حساب خرجیت همین الان عوض شد. اگه خودت این کار رو کردی، همه‌چیز مرتبه.`,
      warning: 'اگه این کار رو تو نکردی، همین الان رمزت رو بازیابی کن — ممکنه کس دیگه‌ای به حسابت دسترسی داشته باشه.',
      cta: 'بازیابی رمز عبور',
      footer: 'برای امنیت بیشتر، با این تغییر همهٔ دستگاه‌های دیگهٔ متصل به حسابت هم خارج شدن.',
      subject: 'رمز عبور خرجیت عوض شد',
    },
    welcome: {
      preview: 'حساب و کتاب پولت، بالاخره شفاف.',
      heading: 'به خرجی خوش اومدی',
      body: 'خرجی کمکت می‌کنه پولت رو با چند ارز مختلف دنبال کنی — هزینه‌ها، درآمد، دارایی‌ها و دارایی خالص، همه یک‌جا.',
      cta: '→ برو به داشبورد',
      featuresTitle: null,
      features: [
        {
          color: '#10b981',
          title: 'هزینه‌ها',
          description: 'هزینه‌های روزانه‌ت رو با دسته‌بندی، برچسب و چند ارز ثبت کن.',
        },
        {
          color: '#0070f3',
          title: 'درآمد',
          description: 'درآمد ماهانه‌ت رو به تفکیک نوع دنبال کن — حقوق، فریلنس، سرمایه‌گذاری و بقیه.',
        },
        {
          color: '#8b5cf6',
          title: 'دارایی‌ها و دارایی خالص',
          description: 'پول نقد، کریپتو، طلا، ملک و سرمایه‌گذاری‌هات رو یک‌جا زیر نظر داشته باش.',
        },
        {
          color: '#f59e0b',
          title: 'گزارش‌ها و تحلیل‌ها',
          description: 'نمودارها و روند خرج کردنت، به‌علاوهٔ خلاصه‌های ماهانه و سالانه توی ایمیلت.',
        },
        {
          color: '#171717',
          title: 'داده‌هات مال خودته',
          description: 'هر وقت خواستی یه بکاپ کامل اکسل بگیر، یا هزینه‌هات رو از CSV وارد کن.',
        },
      ],
      footer1: 'سؤالی داری یا نظری؟ فقط کافیه به همین ایمیل جواب بدی.',
      footer2: 'این ایمیل رو گرفتی چون همین حالا یه حساب خرجی ساختی.',
      subject: 'به خرجی خوش اومدی',
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
      subject: (periodLabel: string) => `گزارش ${periodLabel} تو از خرجی`,
      title: (periodLabel: string) => `گزارش ${periodLabel} تو`,
      subtitle: 'یه نگاه سریع به این که ماه چطور گذشت.',
      preview: (periodLabel: string, expenses: string, net: string) =>
        `گزارش ${periodLabel} تو — ${expenses} خرج شد، ${net} خالص.`,
      topCategoriesSubtitle: (periodLabel: string) => `پولت توی ${periodLabel} کجاها رفت.`,
    },
    yearly: {
      subject: (periodLabel: string) => `مرور سال ${periodLabel} تو`,
      title: (periodLabel: string) => `مرور سال ${periodLabel} تو`,
      subtitle: 'دوازده ماه هزینه، درآمد و پس‌انداز، همه یک‌جا.',
      preview: (periodLabel: string, expenses: string, saved: string) =>
        `مرور سال ${periodLabel} تو — ${expenses} خرج شد، ${saved} پس‌انداز شد.`,
      totalSaved: (pct: string) => `کل پس‌انداز · نرخ پس‌انداز ${pct}٪`,
      monthByMonth: 'ماه به ماه',
      bestMonth: 'بهترین ماه',
      worstMonth: 'سخت‌ترین ماه',
      topCategoriesOf: (periodLabel: string) => `دسته‌های پرخرج ${periodLabel}`,
      topCategoriesSubtitle: 'بیشتر پول امسال کجاها رفت.',
    },
    totalSpent: 'کل خرج',
    totalIncome: 'کل درآمد',
    net: 'خالص (درآمد − هزینه)',
    vsLabel: (label: string) => `نسبت به ${label}`,
    topCategories: 'دسته‌های پرخرج',
    income: 'درآمد',
    expenses: 'هزینه',
    layout: {
      defaultFooter: 'این ایمیل رو گرفتی چون گزارش‌های ایمیلی توی تنظیمات خرجیت روشنه.',
      viewDashboard: 'دیدن داشبورد',
      unsubscribe: 'لغو اشتراک',
    },
    brandFooter: 'خرجی · مدیریت مالی شخصی',
  },
} as const;
