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

interface TaskAssignmentEmailProps {
  assigneeName: string;
  assigneeEmail: string;
  taskTitle: string;
  assignedByName: string;
  priority?: string;
  dueDate?: string;
  dashboardUrl?: string;
}

export const TaskAssignmentEmail = ({
  assigneeName = 'OJT Member',
  assigneeEmail = 'user@example.com',
  taskTitle = 'New Task',
  assignedByName = 'Supervisor',
  priority = 'medium',
  dueDate,
  dashboardUrl = 'https://nexxus.lol/dashboard/kanban',
}: TaskAssignmentEmailProps) => {
  const previewText = `New task assigned: ${taskTitle}`;

  const priorityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={h1Style}>🌌 Nexus</Heading>
          <Text style={textStyle}>
            Hello <strong>{assigneeName}</strong>,
          </Text>
          <Text style={textStyle}>
            <strong>{assignedByName}</strong> has assigned you a new task:
          </Text>
          <Section style={taskCardStyle}>
            <Text style={taskTitleStyle}>{taskTitle}</Text>
            <Text style={taskMetaStyle}>
              Priority: <span style={{ color: priorityColors[priority] || '#64748b', fontWeight: 600 }}>{priority.toUpperCase()}</span>
              {dueDate && <> · Due: <strong>{dueDate}</strong></>}
            </Text>
          </Section>
          <Section style={btnContainerStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              View Task
            </Button>
          </Section>
          <Hr style={hrStyle} />
          <Text style={footerTextStyle}>
            This notification was sent to <strong>{assigneeEmail}</strong>.
          </Text>
          <Text style={footerTextStyle}>
            Nexus — Connecting Students, Supervisors, and Success.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TaskAssignmentEmail;

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

const taskCardStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
};

const taskTitleStyle = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '700' as const,
  margin: '0 0 8px 0',
};

const taskMetaStyle = {
  color: '#64748b',
  fontSize: '14px',
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
