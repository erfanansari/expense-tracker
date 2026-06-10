import * as React from 'react';

import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from '@react-email/components';

interface LayoutProps {
  preview: string;
  unsubscribeUrl?: string; // omit for transactional emails (welcome, password reset)
  webViewUrl?: string;
  logoUrl: string;
  footerText?: string; // override the default footer copy
  children: React.ReactNode;
}

export const Layout = ({ preview, unsubscribeUrl, webViewUrl, logoUrl, footerText, children }: LayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind>
      <Body className="bg-[#fafafa] font-sans">
        <Container className="mx-auto my-0 max-w-[560px] bg-white px-0 py-0">
          {/* Header */}
          <Section className="px-8 pt-8 pb-6">
            <table cellPadding={0} cellSpacing={0} role="presentation">
              <tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <Img
                    src={logoUrl}
                    width="32"
                    height="32"
                    alt="Kharji"
                    style={{ display: 'block', borderRadius: '8px' }}
                  />
                </td>
                <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                  <span
                    style={{
                      color: '#171717',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Kharji
                  </span>
                </td>
              </tr>
            </table>
          </Section>

          {/* Body content */}
          <Section className="px-8 pb-8">{children}</Section>

          {/* Footer */}
          <Hr className="mx-8 my-0 border-t border-[#e5e5e5]" />
          <Section className="px-8 py-6">
            <Text className="m-0 text-[12px] leading-5 text-[#a3a3a3]">
              {footerText ?? "You're receiving this because you have report emails enabled in your Kharji settings."}
            </Text>
            {(webViewUrl || unsubscribeUrl) && (
              <Text className="m-0 mt-2 text-[12px] leading-5 text-[#a3a3a3]">
                {webViewUrl && (
                  <>
                    <Link href={webViewUrl} className="text-[#525252] underline">
                      View dashboard
                    </Link>{' '}
                    &middot;{' '}
                  </>
                )}
                {unsubscribeUrl && (
                  <Link href={unsubscribeUrl} className="text-[#525252] underline">
                    Unsubscribe
                  </Link>
                )}
              </Text>
            )}
            <Text className="m-0 mt-4 text-[11px] text-[#a3a3a3]">Kharji &middot; Personal Finance Tracker</Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default Layout;
