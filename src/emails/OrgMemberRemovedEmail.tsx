import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from '@react-email/components';

interface OrgMemberRemovedEmailProps {
  memberName?: string;
  memberEmail: string;
  orgName: string;
  reason?: string;
}

export const OrgMemberRemovedEmail = ({
  memberName,
  memberEmail = 'member@example.com',
  orgName = 'Organization',
  reason,
}: OrgMemberRemovedEmailProps) => {
  const previewText = `Organization membership update for ${orgName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Nexus Update</Heading>
          <Text style={textStyle}>
            Hello {memberName ? <strong>{memberName}</strong> : 'there'},
          </Text>
          <Text style={textStyle}>
            Your membership in <strong>{orgName}</strong> has been removed.
          </Text>
          {reason && (
            <Text style={reasonBoxStyle}>
              <strong>Note:</strong> {reason}
            </Text>
          )}
          <Text style={textStyle}>
            If you believe this was an error, please reach out to your administrator.
          </Text>
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

export default OrgMemberRemovedEmail;

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

const reasonBoxStyle = {
  backgroundColor: '#f8fafc',
  borderLeft: '4px solid #94a3b8',
  padding: '12px 16px',
  color: '#334155',
  fontSize: '15px',
  margin: '20px 0',
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
