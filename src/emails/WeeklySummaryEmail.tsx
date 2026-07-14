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
} from '@react-email/components';

interface OJTSummaryRow {
  fullName: string;
  totalHours: string;
  daysPresent: number;
  pendingTasks: number;
  completionPct: string;
}

interface WeeklySummaryEmailProps {
  supervisorName: string;
  supervisorEmail: string;
  orgName: string;
  weekStartDate: string;
  weekEndDate: string;
  totalOjts: number;
  avgAttendanceRate: string;
  ojts: OJTSummaryRow[];
}

export const WeeklySummaryEmail = ({
  supervisorName = 'Supervisor',
  supervisorEmail = 'supervisor@example.com',
  orgName = 'Organization',
  weekStartDate = 'Monday',
  weekEndDate = 'Friday',
  totalOjts = 0,
  avgAttendanceRate = '0%',
  ojts = [],
}: WeeklySummaryEmailProps) => {
  const previewText = `Weekly OJT Summary — ${orgName} (${weekStartDate} – ${weekEndDate})`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Nexus — Weekly Summary</Heading>
          <Text style={textStyle}>
            Hello <strong>{supervisorName}</strong>,
          </Text>
          <Text style={textStyle}>
            Here is the weekly OJT summary for <strong>{orgName}</strong> ({weekStartDate} – {weekEndDate}).
          </Text>

          {/* Overview Stats */}
          <Section style={statsContainerStyle}>
            <table style={statsTableStyle} cellPadding="0" cellSpacing="0" role="presentation" width="100%">
              <tr>
                <td style={statCellStyle}>
                  <Text style={statValueStyle}>{totalOjts}</Text>
                  <Text style={statLabelStyle}>Active OJTs</Text>
                </td>
                <td style={statCellStyle}>
                  <Text style={statValueStyle}>{avgAttendanceRate}</Text>
                  <Text style={statLabelStyle}>Avg Attendance</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* OJT Details Table */}
          {ojts.length > 0 && (
            <Section>
              <table style={tableStyle} cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                <tr>
                  <th style={thStyle}>OJT</th>
                  <th style={thStyle}>Hours</th>
                  <th style={thStyle}>Days</th>
                  <th style={thStyle}>Tasks</th>
                  <th style={thStyle}>Progress</th>
                </tr>
                {ojts.map((ojt, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{ojt.fullName}</td>
                    <td style={tdCenterStyle}>{ojt.totalHours}</td>
                    <td style={tdCenterStyle}>{ojt.daysPresent}</td>
                    <td style={tdCenterStyle}>{ojt.pendingTasks}</td>
                    <td style={tdCenterStyle}>{ojt.completionPct}</td>
                  </tr>
                ))}
              </table>
            </Section>
          )}

          {ojts.length === 0 && (
            <Text style={{ ...textStyle, textAlign: 'center' as const, color: '#94a3b8' }}>
              No OJT data available for this week.
            </Text>
          )}

          <Hr style={hrStyle} />
          <Text style={footerTextStyle}>
            This weekly summary was sent to <strong>{supervisorEmail}</strong>.
          </Text>
          <Text style={footerTextStyle}>
            Nexus — Connecting Students, Supervisors, and Success.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WeeklySummaryEmail;

const mainStyle = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const containerStyle = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '620px',
};

const h1Style = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '30px 0 10px',
  letterSpacing: '1px',
};

const textStyle = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '26px',
};

const statsContainerStyle = {
  margin: '20px 0',
};

const statsTableStyle = {
  width: '100%',
};

const statCellStyle = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const statValueStyle = {
  color: '#6366f1',
  fontSize: '28px',
  fontWeight: '800' as const,
  margin: '0',
  lineHeight: '1.2',
};

const statLabelStyle = {
  color: '#64748b',
  fontSize: '12px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '20px 0',
};

const thStyle = {
  backgroundColor: '#f1f5f9',
  color: '#475569',
  fontSize: '12px',
  fontWeight: '700' as const,
  padding: '10px 12px',
  textAlign: 'left' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  borderBottom: '2px solid #e2e8f0',
};

const tdStyle = {
  color: '#334155',
  fontSize: '14px',
  padding: '10px 12px',
  borderBottom: '1px solid #f1f5f9',
};

const tdCenterStyle = {
  ...tdStyle,
  textAlign: 'center' as const,
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
