import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

import BrandHeader from './components/BrandHeader';
import FontStyles from './components/FontStyles';
import { AUTH_EMAIL_STRINGS, emailDir, type EmailLocale, FONT_STACKS } from './i18n';

export interface PasswordChangedEmailProps {
  userName: string | null;
  resetUrl: string;
  locale?: EmailLocale;
}

const PasswordChangedEmail = ({ userName, resetUrl, locale = 'fa' }: PasswordChangedEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const t = AUTH_EMAIL_STRINGS[locale].passwordChanged;
  const greeting = AUTH_EMAIL_STRINGS[locale].greeting(firstName);
  const dir = emailDir(locale);
  const font = FONT_STACKS[locale];

  return (
    <Html dir={dir} lang={locale}>
      <Head>
        <FontStyles locale={locale} />
      </Head>
      <Preview>{t.preview}</Preview>
      <Body style={{ backgroundColor: '#e9eff7', fontFamily: font, margin: 0, padding: '40px 0' }}>
        <Container
          dir={dir}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '560px',
            margin: '0 auto',
            overflow: 'hidden',
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}
        >
          <Section style={{ padding: '32px 40px 24px' }}>
            <BrandHeader locale={locale} />
            <Heading
              style={{ color: '#0f1b2d', fontSize: '22px', fontWeight: 700, margin: '24px 0 8px', fontFamily: font }}
            >
              {t.heading}
            </Heading>
            <Text style={{ color: '#46586e', fontSize: '15px', lineHeight: '24px', margin: 0, fontFamily: font }}>
              {t.body(greeting)}
            </Text>
          </Section>

          <Section style={{ padding: '0 40px 8px' }}>
            <Text
              style={{ color: '#46586e', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px', fontFamily: font }}
            >
              {t.warning}
            </Text>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: '#1a56db',
                borderRadius: '999px',
                color: '#ffffff',
                display: 'inline-block',
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px 24px',
                textDecoration: 'none',
                fontFamily: font,
              }}
            >
              {t.cta}
            </Button>
          </Section>

          <Section style={{ padding: '16px 40px 32px' }}>
            <Hr style={{ borderColor: '#e2e8f1', margin: '0 0 16px' }} />
            <Text style={{ color: '#6f8199', fontSize: '13px', lineHeight: '20px', margin: 0, fontFamily: font }}>
              {t.footer}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;
