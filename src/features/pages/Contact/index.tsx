import { useTranslations } from 'next-intl';

import LegalPageLayout from '@components/LandingPage/LegalPageLayout';

import ContactForm from './components/ContactForm';

const emailTag = {
  email: (chunks: React.ReactNode) => (
    <a href="mailto:support@kharji.app" className="text-blue hover:underline" dir="ltr">
      {chunks}
    </a>
  ),
};

const Contact = () => {
  const t = useTranslations('legal.contact');

  return (
    <LegalPageLayout title={t('title')}>
      <p className="text-text-secondary text-sm leading-relaxed sm:text-base">{t('intro')}</p>

      <ContactForm />

      <div className="text-text-secondary flex flex-col gap-2 text-sm leading-relaxed sm:text-base">
        <p>{t.rich('direct', emailTag)}</p>
        <p>{t('inApp')}</p>
      </div>
    </LegalPageLayout>
  );
};

export default Contact;
