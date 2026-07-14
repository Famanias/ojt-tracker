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

interface AttendanceReminderEmailProps {
  fullName: string;
  email: string;
  date: string;
  dashboardUrl?: string;
}

export const AttendanceReminderEmail = ({
  fullName = 'OJT Member',
  email = 'user@example.com',
  date = new Date().toLocaleDateString(),
  dashboardUrl = 'https://nexxus.lol/dashboard/attendance',
}: AttendanceReminderEmailProps) => {
  const previewText = `Reminder: Clock in for ${date}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Nexus</Heading>
          <Text style={textStyle}>
            Hello <strong>{fullName}</strong>,
          </Text>
          <Text style={textStyle}>
            This is a friendly reminder that you haven&apos;t clocked in today (<strong>{date}</strong>).
          </Text>
          <Text style={textStyle}>
            Please remember to clock in to track your OJT hours accurately.
          </Text>
          <Section style={btnContainerStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              Clock In Now
            </Button>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerTextStyle}>
            This reminder was sent to <strong>{email}</strong>.
          </Text>
          <Text style={footerTextStyle}>
            Nexus — Connecting Students, Supervisors, and Success.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AttendanceReminderEmail;

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
