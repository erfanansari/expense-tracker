import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

export interface WelcomeEmailProps {
  userName: string | null;
  dashboardUrl: string;
  logoUrl: string;
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const FEATURES = [
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
];

const WelcomeEmail = ({ userName, dashboardUrl, logoUrl }: WelcomeEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  return (
    <Html>
      <Head />
      <Preview>Your finances, finally under control.</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: FONT, margin: 0, padding: '40px 0' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '560px',
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Section style={{ padding: '32px 40px 24px' }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <img
                    src={logoUrl}
                    width="32"
                    height="32"
                    alt="Kharji"
                    style={{ display: 'block', borderRadius: '8px', backgroundColor: '#171717' }}
                  />
                </td>
                <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                  <span
                    style={{
                      color: '#171717',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      fontFamily: FONT,
                    }}
                  >
                    Kharji
                  </span>
                </td>
              </tr>
            </table>
          </Section>

          {/* Body */}
          <Section style={{ padding: '0 40px 40px' }}>
            <Text style={{ margin: '0 0 8px', fontSize: '15px', color: '#6b7280', fontFamily: FONT }}>{greeting}</Text>
            <Heading
              as="h1"
              style={{
                margin: '0 0 16px',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: '#171717',
                fontFamily: FONT,
              }}
            >
              Welcome to Kharji
            </Heading>
            <Text
              style={{ margin: '0 0 32px', fontSize: '15px', lineHeight: '1.6', color: '#525252', fontFamily: FONT }}
            >
              Kharji helps you track your finances across multiple currencies — expenses, income, assets, and net worth,
              all in one place.
            </Text>

            {/* CTA button — table wrapper keeps it left-aligned and auto-width */}
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: '40px' }}>
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
                      fontFamily: FONT,
                    }}
                  >
                    Go to dashboard →
                  </Button>
                </td>
              </tr>
            </table>

            <Hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '0 0 32px' }} />

            {/* Features */}
            {FEATURES.map((f) => (
              <table
                key={f.title}
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                style={{ marginBottom: '20px' }}
              >
                <tr>
                  <td style={{ verticalAlign: 'top', width: '10px', paddingTop: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: f.color }} />
                  </td>
                  <td style={{ verticalAlign: 'top', paddingLeft: '14px' }}>
                    <Text
                      style={{
                        margin: '0 0 3px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#171717',
                        fontFamily: FONT,
                      }}
                    >
                      {f.title}
                    </Text>
                    <Text
                      style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#6b7280', fontFamily: FONT }}
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
            <Text style={{ margin: '0 0 6px', fontSize: '12px', color: '#a3a3a3', fontFamily: FONT }}>
              Questions or feedback? Just reply to this email.
            </Text>
            <Text style={{ margin: 0, fontSize: '12px', color: '#a3a3a3', fontFamily: FONT }}>
              You&apos;re receiving this because you just created a Kharji account.
            </Text>
            <Text style={{ margin: '16px 0 0', fontSize: '11px', color: '#a3a3a3', fontFamily: FONT }}>
              Kharji · Personal Finance Tracker
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
