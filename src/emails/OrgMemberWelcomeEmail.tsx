import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface OrgMemberWelcomeEmailProps {
  memberName: string;
  memberEmail: string;
  orgName: string;
  role: string;
  dashboardUrl?: string;
}

export const OrgMemberWelcomeEmail = ({
  memberName = 'Member',
  memberEmail = 'member@example.com',
  orgName = 'Nexus Organization',
  role = 'Member',
  dashboardUrl = 'https://nexxus.lol/dashboard',
}: OrgMemberWelcomeEmailProps) => {
  const previewText = `Welcome to ${orgName} on Nexus!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Welcome to {orgName}!</Heading>
          <Text style={textStyle}>
            Hello <strong>{memberName}</strong>,
          </Text>
          <Text style={textStyle}>
            You have been added to <strong>{orgName}</strong> as a <strong>{role.toUpperCase()}</strong>.
          </Text>
          <Text style={textStyle}>
            You can now access organization tasks, log attendance, and view performance reports.
          </Text>
          <Section style={btnContainerStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              Open Dashboard
            </Button>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerTextStyle}>
            This notification was sent to <strong>{memberEmail}</strong>.
          </Text>
          <Text style={footerTextStyle}>
            Nexus — Connecting Students, Supervisors, and Success.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrgMemberWelcomeEmail;

const mainStyle = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const containerStyle = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '580px',
};

const h1Style = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 'bold',
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
