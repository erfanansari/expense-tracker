import * as React from 'react';

import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from '@react-email/components';

import { emailDir, type EmailLocale, FONT_STACKS, REPORT_STRINGS, VAZIRMATN_FONT_LINK } from '../i18n';

interface LayoutProps {
  preview: string;
  unsubscribeUrl?: string; // omit for transactional emails (welcome, password reset)
  webViewUrl?: string;
  logoUrl: string;
  footerText?: string; // override the default footer copy
  locale?: EmailLocale;
  children: React.ReactNode;
}

const BRAND_NAME: Record<EmailLocale, string> = { en: 'Kharji', fa: 'خرجی' };

export const Layout = ({
  preview,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
  footerText,
  locale = 'en',
  children,
}: LayoutProps) => {
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const font = FONT_STACKS[locale];
  const t = REPORT_STRINGS[locale].layout;
  const brand = BRAND_NAME[locale];

  return (
    <Html dir={dir} lang={locale}>
      <Head>{locale === 'fa' && <link rel="stylesheet" href={VAZIRMATN_FONT_LINK} />}</Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#fafafa]" style={{ fontFamily: font }}>
          <Container
            dir={dir}
            className="mx-auto my-0 max-w-[560px] bg-white px-0 py-0"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            {/* Header */}
            <Section className="px-8 pt-8 pb-6">
              <table cellPadding={0} cellSpacing={0} role="presentation" dir={dir}>
                <tr>
                  <td style={{ verticalAlign: 'middle' }}>
                    <Img
                      src={logoUrl}
                      width="32"
                      height="32"
                      alt={brand}
                      style={{ display: 'block', borderRadius: '8px' }}
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

            {/* Body content */}
            <Section className="px-8 pb-8" style={{ fontFamily: font }}>
              {children}
            </Section>

            {/* Footer */}
            <Hr className="mx-8 my-0 border-t border-[#e5e5e5]" />
            <Section className="px-8 py-6">
              <Text className="m-0 text-[12px] leading-5 text-[#a3a3a3]" style={{ fontFamily: font }}>
                {footerText ?? t.defaultFooter}
              </Text>
              {(webViewUrl || unsubscribeUrl) && (
                <Text className="m-0 mt-2 text-[12px] leading-5 text-[#a3a3a3]" style={{ fontFamily: font }}>
                  {webViewUrl && (
                    <>
                      <Link href={webViewUrl} className="text-[#525252] underline">
                        {t.viewDashboard}
                      </Link>{' '}
                      &middot;{' '}
                    </>
                  )}
                  {unsubscribeUrl && (
                    <Link href={unsubscribeUrl} className="text-[#525252] underline">
                      {t.unsubscribe}
                    </Link>
                  )}
                </Text>
              )}
              <Text className="m-0 mt-4 text-[11px] text-[#a3a3a3]" style={{ fontFamily: font }}>
                {REPORT_STRINGS[locale].brandFooter}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Layout;
