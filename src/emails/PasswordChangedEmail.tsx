import * as React from 'react';

import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

export interface PasswordChangedEmailProps {
  userName: string | null;
  resetUrl: string;
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const PasswordChangedEmail = ({ userName, resetUrl }: PasswordChangedEmailProps) => {
  const firstName = userName ? userName.split(' ')[0] : null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  return (
    <Html>
      <Head />
      <Preview>Your Kharji password was changed.</Preview>
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
              Your password was changed
            </Heading>
            <Text style={{ color: '#525252', fontSize: '15px', lineHeight: '24px', margin: 0 }}>
              {greeting} this is a confirmation that the password for your Kharji account was just changed. If this was
              you, no action is needed.
            </Text>
          </Section>

          <Section style={{ padding: '0 40px 8px' }}>
            <Text style={{ color: '#525252', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }}>
              If you didn&apos;t make this change, reset your password immediately — someone else may have access to
              your account.
            </Text>
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
              }}
            >
              Reset password
            </Button>
          </Section>

          <Section style={{ padding: '16px 40px 32px' }}>
            <Hr style={{ borderColor: '#e5e5e5', margin: '0 0 16px' }} />
            <Text style={{ color: '#a3a3a3', fontSize: '13px', lineHeight: '20px', margin: 0 }}>
              For security, this change also signed out all other devices on your account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;
