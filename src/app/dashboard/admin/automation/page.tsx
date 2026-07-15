import { Metadata } from 'next';
import AutomationLogsClient from './AutomationLogsClient';

export const metadata: Metadata = {
  title: 'Automation | Admin Dashboard',
  description: 'Monitor and manage automation logs and dead letter queue.',
};

export default function AutomationPage() {
  return <AutomationLogsClient />;
}
