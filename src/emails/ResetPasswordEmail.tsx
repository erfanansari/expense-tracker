import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

import { AUTH_EMAIL_STRINGS, emailDir, type EmailLocale, FONT_STACKS, VAZIRMATN_FONT_LINK } from './i18n';

export interface ResetPasswordEmailProps {
  userName: string | null;
  resetUrl: string;
  locale?: EmailLocale;
}

const ResetPasswordEmail = ({ userName, resetUrl, locale = 'en' }: ResetPasswordEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const t = AUTH_EMAIL_STRINGS[locale].reset;
  const greeting = AUTH_EMAIL_STRINGS[locale].greeting(firstName);
  const dir = emailDir(locale);
  const font = FONT_STACKS[locale];

  return (
    <Html dir={dir} lang={locale}>
      <Head>{locale === 'fa' && <link rel="stylesheet" href={VAZIRMATN_FONT_LINK} />}</Head>
      <Preview>{t.preview}</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: font, margin: 0, padding: '40px 0' }}>
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
            <Heading
              style={{ color: '#171717', fontSize: '22px', fontWeight: 700, margin: '0 0 8px', fontFamily: font }}
            >
              {t.heading}
            </Heading>
            <Text style={{ color: '#525252', fontSize: '15px', lineHeight: '24px', margin: 0, fontFamily: font }}>
              {t.body(greeting)}
            </Text>
          </Section>

          <Section style={{ padding: '0 40px 8px' }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: '#171717',
                borderRadius: '8px',
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
            <Hr style={{ borderColor: '#e5e5e5', margin: '0 0 16px' }} />
            <Text style={{ color: '#a3a3a3', fontSize: '13px', lineHeight: '20px', margin: 0, fontFamily: font }}>
              {t.footer}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;
