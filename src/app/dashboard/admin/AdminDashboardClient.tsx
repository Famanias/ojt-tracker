'use client';

import React from 'react';
import {
  Box, Grid, Typography, Button, Card, CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as ClockIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendIcon,
  Add as AddIcon,
  ViewKanban as KanbanIcon,
  BarChart as ReportIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StatCard from '@/components/shared/StatCard';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { formatHours } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { Attendance, Profile } from '@/types';

interface AdminStats {
  total_ojts: number;
  total_supervisors: number;
  present_today: number;
  total_hours_all: number;
}

interface Props {
  stats: AdminStats;
  initialAttendance: (Attendance & { profile?: Profile })[];
}

export default function AdminDashboardClient({ stats, initialAttendance }: Props) {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography color="text.secondary">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')} — System Overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<KanbanIcon />} onClick={() => router.push('/dashboard/kanban')}>
            Kanban Board
          </Button>
          <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => router.push('/dashboard/reports')}>
            Reports
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/dashboard/admin/users')}>
            Manage Users
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total OJTs" value={stats.total_ojts} subtitle="Active trainees" icon={<PeopleIcon />} color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Supervisors" value={stats.total_supervisors} subtitle="Active supervisors" icon={<PeopleIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Present Today" value={stats.present_today} subtitle="Clocked in today" icon={<ClockIcon />} color="#22c55e" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Hours" value={formatHours(stats.total_hours_all)} subtitle="All time (all OJTs)" icon={<TrendIcon />} color="#ec4899" />
        </Grid>
      </Grid>

      {/* All Attendance */}
      <AttendanceTable showUser={true} initialRecords={initialAttendance} />
    </Box>
  );
}
