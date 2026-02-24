'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Avatar,
  LinearProgress, Chip, TextField, InputAdornment, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton, Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as ClockIcon,
  TrendingUp as TrendIcon,
  CheckCircle as CompleteIcon,
  Search as SearchIcon,
  ViewKanban as KanbanIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { Profile, Attendance } from '@/types';
import { formatHours, formatTime } from '@/lib/utils/format';
import { format } from 'date-fns';
import StatCard from '@/components/shared/StatCard';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface OJTSummary {
  profile: Profile;
  total_hours: number;
  total_days: number;
  today_record?: Attendance;
  completion_pct: number;
}

export default function SupervisorDashboard() {
  const [ojtSummaries, setOjtSummaries] = useState<OJTSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, present: 0, completed: 0, avg_hours: 0 });
  const supabase = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Get all OJTs
    const { data: ojts } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ojt')
      .eq('is_active', true);

    if (!ojts) { setLoading(false); return; }

    // Get today's attendance
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', today);

    // Get all attendance for hours calculation
    const { data: allAttendance } = await supabase
      .from('attendance')
      .select('user_id, total_hours, date')
      .not('total_hours', 'is', null);

    const summaries: OJTSummary[] = ojts.map((ojt) => {
      const ojtAttendance = (allAttendance ?? []).filter((a) => a.user_id === ojt.id);
      const total_hours = ojtAttendance.reduce((acc, a) => acc + (a.total_hours ?? 0), 0);
      const total_days = ojtAttendance.length;
      const today_record = (todayAttendance ?? []).find((a) => a.user_id === ojt.id);
      const completion_pct = Math.min(100, (total_hours / ojt.required_hours) * 100);
      return { profile: ojt, total_hours, total_days, today_record, completion_pct };
    });

    setOjtSummaries(summaries);

    const present = summaries.filter((s) => s.today_record?.clock_in).length;
    const completed_ojts = summaries.filter((s) => s.completion_pct >= 100).length;
    const avg_hours = summaries.length
      ? summaries.reduce((acc, s) => acc + s.total_hours, 0) / summaries.length
      : 0;

    setStats({ total: ojts.length, present, completed: completed_ojts, avg_hours });
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = ojtSummaries.filter((s) =>
    s.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Supervisor Dashboard</Typography>
          <Typography color="text.secondary">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')} — Monitoring {stats.total} OJTs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<KanbanIcon />}
          onClick={() => router.push('/dashboard/kanban')}
        >
          Kanban Board
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total OJTs" value={stats.total} subtitle="Active trainees" icon={<PeopleIcon />} color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Present Today" value={stats.present} subtitle={`${stats.total - stats.present} absent`} icon={<ClockIcon />} color="#22c55e" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="OJT Complete" value={stats.completed} subtitle="Finished requirements" icon={<CompleteIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Avg Hours" value={formatHours(stats.avg_hours)} subtitle="Per trainee" icon={<TrendIcon />} color="#ec4899" />
        </Grid>
      </Grid>

      {/* OJT Progress Table */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>OJT Progress Overview</Typography>
            <TextField
              size="small"
              placeholder="Search OJT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f8fafc' } }}>
                  <TableCell>Trainee</TableCell>
                  <TableCell>Today</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1,2,3,4,5].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}
                      </TableRow>
                    ))
                  : filtered.map((s) => (
                      <TableRow key={s.profile.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={s.profile.avatar_url} sx={{ width: 36, height: 36 }}>
                              {s.profile.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{s.profile.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{s.profile.department ?? s.profile.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {s.today_record?.clock_in ? (
                            <Box>
                              <Chip
                                label={s.today_record.clock_out ? 'Done' : 'In Office'}
                                color={s.today_record.clock_out ? 'default' : 'success'}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatTime(s.today_record.clock_in)}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Absent" color="error" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatHours(s.total_hours)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            of {formatHours(s.profile.required_hours)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={s.completion_pct}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  background: s.completion_pct >= 100 ? '#22c55e' : '#6366f1',
                                },
                              }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 36 }}>
                              {s.completion_pct.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {s.completion_pct >= 100 ? (
                            <Chip label="Complete" color="success" size="small" />
                          ) : (
                            <Chip label="In Progress" color="primary" size="small" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* All Attendance Records */}
      <AttendanceTable showUser={true} />
    </Box>
  );
}
