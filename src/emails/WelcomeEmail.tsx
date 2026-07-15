import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';

interface WelcomeEmailProps {
  fullName: string;
  email: string;
  role: string;
  orgName?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  fullName = 'User',
  email = 'user@example.com',
  role = 'OJT',
  orgName,
  loginUrl = 'https://nexxus.lol/login',
}: WelcomeEmailProps) => {
  const previewText = `Welcome to Nexus${orgName ? ` — ${orgName}` : ''}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Welcome to Nexus!</Heading>
          <Text style={textStyle}>
            Hello <strong>{fullName}</strong>,
          </Text>
          <Text style={textStyle}>
            Your account has been created successfully{orgName ? ` for ${orgName}` : ''}.
            You are registered as <strong>{role.toUpperCase()}</strong>.
          </Text>
          <Text style={textStyle}>
            Here&apos;s what you can do next:
          </Text>
          <Section style={listStyle}>
            <Text style={listItemStyle}>📋 Track your attendance with GPS verification</Text>
            <Text style={listItemStyle}>✅ Manage tasks on the Kanban board</Text>
            <Text style={listItemStyle}>📊 View your progress reports</Text>
          </Section>
          <Section style={btnContainerStyle}>
            <Button style={buttonStyle} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerTextStyle}>
            This email was sent to <strong>{email}</strong>.
          </Text>
          <Text style={footerTextStyle}>
            Nexus — Connecting Students, Supervisors, and Success.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const mainStyle = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const containerStyle = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '580px',
};

const h1Style = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '30px 0',
  letterSpacing: '1px',
};

const textStyle = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
};

const listStyle = {
  padding: '0 20px',
};

const listItemStyle = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0',
};

const btnContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const buttonStyle = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hrStyle = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
};

const footerTextStyle = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
};
