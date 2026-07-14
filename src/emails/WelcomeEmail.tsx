import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

import { AUTH_EMAIL_STRINGS, emailDir, type EmailLocale, FONT_STACKS, VAZIRMATN_FONT_LINK } from './i18n';

export interface WelcomeEmailProps {
  userName: string | null;
  dashboardUrl: string;
  logoUrl: string;
  locale?: EmailLocale;
}

const BRAND_NAME: Record<EmailLocale, string> = { en: 'Kharji', fa: 'خرجی' };

const WelcomeEmail = ({ userName, dashboardUrl, logoUrl, locale = 'en' }: WelcomeEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const t = AUTH_EMAIL_STRINGS[locale].welcome;
  const greeting = AUTH_EMAIL_STRINGS[locale].greeting(firstName);
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const font = FONT_STACKS[locale];
  const brand = BRAND_NAME[locale];

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
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {/* Header */}
          <Section style={{ padding: '32px 40px 24px' }}>
            <table role="presentation" cellPadding={0} cellSpacing={0} dir={dir}>
              <tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <img
                    src={logoUrl}
                    width="32"
                    height="32"
                    alt={brand}
                    style={{ display: 'block', borderRadius: '8px', backgroundColor: '#171717' }}
                  />
                </td>
                <td style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: '10px', verticalAlign: 'middle' }}>
                  <span
                    style={{
                      color: '#171717',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      fontFamily: font,
                    }}
                  >
                    {brand}
                  </span>
                </td>
              </tr>
            </table>
          </Section>

          {/* Body */}
          <Section style={{ padding: '0 40px 40px' }}>
            <Text style={{ margin: '0 0 8px', fontSize: '15px', color: '#6b7280', fontFamily: font }}>{greeting}</Text>
            <Heading
              as="h1"
              style={{
                margin: '0 0 16px',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: '#171717',
                fontFamily: font,
              }}
            >
              {t.heading}
            </Heading>
            <Text
              style={{ margin: '0 0 32px', fontSize: '15px', lineHeight: '1.6', color: '#525252', fontFamily: font }}
            >
              {t.body}
            </Text>

            {/* CTA button — table wrapper keeps it auto-width, anchored to reading-start */}
            <table role="presentation" cellPadding={0} cellSpacing={0} dir={dir} style={{ marginBottom: '40px' }}>
              <tr>
                <td>
                  <Button
                    href={dashboardUrl}
                    style={{
                      backgroundColor: '#171717',
                      borderRadius: '8px',
                      color: '#ffffff',
                      display: 'inline-block',
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '14px 28px',
                      textDecoration: 'none',
                      fontFamily: font,
                    }}
                  >
                    {t.cta}
                  </Button>
                </td>
              </tr>
            </table>

            <Hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '0 0 32px' }} />

            {/* Features */}
            {t.features.map((f) => (
              <table
                key={f.title}
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                dir={dir}
                style={{ marginBottom: '20px' }}
              >
                <tr>
                  <td style={{ verticalAlign: 'top', width: '10px', paddingTop: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: f.color }} />
                  </td>
                  <td style={{ verticalAlign: 'top', [isRtl ? 'paddingRight' : 'paddingLeft']: '14px' }}>
                    <Text
                      style={{
                        margin: '0 0 3px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#171717',
                        fontFamily: font,
                      }}
                    >
                      {f.title}
                    </Text>
                    <Text
                      style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#6b7280', fontFamily: font }}
                    >
                      {f.description}
                    </Text>
                  </td>
                </tr>
              </table>
            ))}
          </Section>

          {/* Footer */}
          <Section style={{ borderTop: '1px solid #e5e5e5', padding: '24px 40px', backgroundColor: '#fafafa' }}>
            <Text style={{ margin: '0 0 6px', fontSize: '12px', color: '#a3a3a3', fontFamily: font }}>{t.footer1}</Text>
            <Text style={{ margin: 0, fontSize: '12px', color: '#a3a3a3', fontFamily: font }}>{t.footer2}</Text>
            <Text style={{ margin: '16px 0 0', fontSize: '11px', color: '#a3a3a3', fontFamily: font }}>
              {AUTH_EMAIL_STRINGS[locale].brandFooter}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  userName: 'Erfan Ansari',
  dashboardUrl: 'https://kharji.app/overview',
  logoUrl: 'https://kharji.app/icons/icon-192.png',
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
