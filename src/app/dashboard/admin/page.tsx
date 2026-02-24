'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import StatCard from '@/components/shared/StatCard';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { formatHours } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_ojts: 0,
    total_supervisors: 0,
    present_today: 0,
    total_hours_all: 0,
  });
  const supabase = createClient();
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchStats = useCallback(async () => {
    const [{ count: ojts }, { count: supervisors }, { data: todayAtt }, { data: allHours }] =
      await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ojt').eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'supervisor').eq('is_active', true),
        supabase.from('attendance').select('id').eq('date', today).not('clock_in', 'is', null),
        supabase.from('attendance').select('total_hours').not('total_hours', 'is', null),
      ]);

    const total_hours = (allHours ?? []).reduce((a, r) => a + (r.total_hours ?? 0), 0);

    setStats({
      total_ojts: ojts ?? 0,
      total_supervisors: supervisors ?? 0,
      present_today: todayAtt?.length ?? 0,
      total_hours_all: total_hours,
    });
  }, [today]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Manage Users', desc: 'Add, edit, or deactivate OJTs and supervisors', icon: <PeopleIcon />, path: '/dashboard/admin/users', color: '#6366f1' },
          { label: 'Site Settings', desc: 'Configure location, radius, and site details', icon: <SettingsIcon />, path: '/dashboard/admin/settings', color: '#f59e0b' },
          { label: 'Kanban Board', desc: 'Manage tasks and track OJT assignments', icon: <KanbanIcon />, path: '/dashboard/kanban', color: '#22c55e' },
          { label: 'Reports', desc: 'View detailed attendance and hours reports', icon: <ReportIcon />, path: '/dashboard/reports', color: '#ec4899' },
        ].map((action) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={action.label}>
            <Card
              sx={{
                borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid transparent`,
                '&:hover': { transform: 'translateY(-3px)', border: `2px solid ${action.color}40`, boxShadow: `0 8px 24px ${action.color}20` },
              }}
              onClick={() => router.push(action.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: 2, bgcolor: `${action.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>{action.label}</Typography>
                <Typography variant="body2" color="text.secondary">{action.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* All Attendance */}
      <AttendanceTable showUser={true} />
    </Box>
  );
}
