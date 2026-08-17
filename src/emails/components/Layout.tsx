import * as React from 'react';

import { Body, Container, Head, Hr, Html, Link, Preview, Section, Tailwind, Text } from '@react-email/components';

import { emailDir, type EmailLocale, FONT_STACKS, REPORT_STRINGS } from '../i18n';

import BrandHeader from './BrandHeader';
import FontStyles from './FontStyles';

interface LayoutProps {
  preview: string;
  unsubscribeUrl?: string; // omit for transactional emails (welcome, password reset)
  webViewUrl?: string;
  logoUrl?: string;
  footerText?: string; // override the default footer copy
  locale?: EmailLocale;
  children: React.ReactNode;
}

export const Layout = ({
  preview,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
  footerText,
  locale = 'fa',
  children,
}: LayoutProps) => {
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const font = FONT_STACKS[locale];
  const t = REPORT_STRINGS[locale].layout;

  return (
    <Html dir={dir} lang={locale}>
      <Head>
        <FontStyles locale={locale} />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#f3f6fa]" style={{ fontFamily: font }}>
          <Container
            dir={dir}
            className="mx-auto my-0 max-w-[560px] bg-[#ffffff] px-0 py-0"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            {/* Header */}
            <Section className="px-8 pt-8 pb-6">
              <BrandHeader locale={locale} logoUrl={logoUrl} />
            </Section>

            {/* Body content */}
            <Section className="px-8 pb-8" style={{ fontFamily: font }}>
              {children}
            </Section>

            {/* Footer */}
            <Hr className="mx-8 my-0 border-t border-[#e2e8f1]" />
            <Section className="px-8 py-6">
              <Text className="m-0 text-[12px] leading-5 text-[#6f8199]" style={{ fontFamily: font }}>
                {footerText ?? t.defaultFooter}
              </Text>
              {(webViewUrl || unsubscribeUrl) && (
                <Text className="m-0 mt-2 text-[12px] leading-5 text-[#6f8199]" style={{ fontFamily: font }}>
                  {webViewUrl && (
                    <>
                      <Link href={webViewUrl} className="text-[#46586e] underline">
                        {t.viewDashboard}
                      </Link>{' '}
                      &middot;{' '}
                    </>
                  )}
                  {unsubscribeUrl && (
                    <Link href={unsubscribeUrl} className="text-[#46586e] underline">
                      {t.unsubscribe}
                    </Link>
                  )}
                </Text>
              )}
              <Text className="m-0 mt-4 text-[11px] text-[#6f8199]" style={{ fontFamily: font }}>
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
