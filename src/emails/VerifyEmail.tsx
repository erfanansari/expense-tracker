import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

export interface VerifyEmailProps {
  userName: string | null;
  verifyUrl: string;
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const VerifyEmail = ({ userName, verifyUrl }: VerifyEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  return (
    <Html>
      <Head />
      <Preview>Confirm your email address to start using Kharji.</Preview>
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
          <Section style={{ padding: '32px 40px 24px' }}>
            <Heading style={{ color: '#171717', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
              Verify your email
            </Heading>
            <Text style={{ color: '#525252', fontSize: '15px', lineHeight: '24px', margin: 0 }}>
              {greeting} thanks for signing up for Kharji. Click the button below to confirm this email address and
              activate your account.
            </Text>
          </Section>

          <Section style={{ padding: '0 40px 8px' }}>
            <Button
              href={verifyUrl}
              style={{
                backgroundColor: '#171717',
                borderRadius: '8px',
                color: '#ffffff',
                display: 'inline-block',
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px 24px',
                textDecoration: 'none',
              }}
            >
              Verify email
            </Button>
          </Section>

          <Section style={{ padding: '16px 40px 32px' }}>
            <Hr style={{ borderColor: '#e5e5e5', margin: '0 0 16px' }} />
            <Text style={{ color: '#a3a3a3', fontSize: '13px', lineHeight: '20px', margin: 0 }}>
              This link expires in 1 hour. If you didn&apos;t create a Kharji account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;
