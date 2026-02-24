'use client';

import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/context/AuthContext';
import { useAttendance } from '@/lib/hooks/useAttendance';
import ClockButton from '@/components/attendance/ClockButton';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import HoursProgress from '@/components/attendance/HoursProgress';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatHours } from '@/lib/utils/format';

export default function OJTDashboard() {
  const { profile } = useAuth();
  const { todayRecord, summary, loading, refresh } = useAttendance(profile?.id);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your attendance and monitor your OJT progress.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Days"
            value={summary?.total_days ?? 0}
            subtitle="Days rendered"
            icon={<CalendarIcon />}
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Hours"
            value={formatHours(summary?.total_hours ?? 0)}
            subtitle="Hours logged"
            icon={<ClockIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Required Hours"
            value={formatHours(summary?.required_hours ?? 600)}
            subtitle="Total requirement"
            icon={<TrendIcon />}
            color="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Completion"
            value={`${(summary?.completion_percentage ?? 0).toFixed(1)}%`}
            subtitle="OJT progress"
            icon={<TaskIcon />}
            color={
              (summary?.completion_percentage ?? 0) >= 100
                ? '#22c55e'
                : '#6366f1'
            }
          />
        </Grid>
      </Grid>

      {/* Clock + Progress */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          {profile && (
            <ClockButton
              userId={profile.id}
              todayRecord={todayRecord}
              onSuccess={refresh}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <HoursProgress summary={summary} />
        </Grid>
      </Grid>

      {/* Attendance history */}
      <AttendanceTable userId={profile?.id} showUser={false} />
    </Box>
  );
}
