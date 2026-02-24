'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, TextField,
  InputAdornment, IconButton, Tooltip, Select, MenuItem, FormControl,
  InputLabel, Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { Attendance, Profile } from '@/types';
import { formatDate, formatTime, formatHours } from '@/lib/utils/format';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Props {
  userId?: string; // if undefined, shows all (for admin/supervisor)
  showUser?: boolean;
}

export default function AttendanceTable({ userId, showUser = false }: Props) {
  const [records, setRecords] = useState<(Attendance & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const supabase = createClient();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const start = format(startOfMonth(new Date(month + '-01')), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date(month + '-01')), 'yyyy-MM-dd');

    let query = supabase
      .from('attendance')
      .select('*, profile:profiles(id, full_name, email, avatar_url, department)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data } = await query;
    setRecords(data ?? []);
    setLoading(false);
  }, [userId, month]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const name = r.profile?.full_name?.toLowerCase() ?? '';
    return name.includes(search.toLowerCase()) || r.date.includes(search);
  });

  const exportCSV = () => {
    const headers = ['Date', 'Name', 'Clock In', 'Clock Out', 'Total Hours', 'Status'];
    const rows = filtered.map((r) => [
      r.date,
      r.profile?.full_name ?? 'N/A',
      r.clock_in ? formatTime(r.clock_in) : '',
      r.clock_out ? formatTime(r.clock_out) : '',
      r.total_hours ? formatHours(r.total_hours) : '',
      r.clock_out ? 'Complete' : r.clock_in ? 'In Progress' : 'Absent',
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${month}.csv`;
    a.click();
  };

  const statusChip = (record: Attendance) => {
    if (record.clock_out)
      return <Chip label="Complete" color="success" size="small" icon={<CheckIcon />} />;
    if (record.clock_in)
      return <Chip label="In Progress" color="warning" size="small" />;
    return <Chip label="Absent" color="error" size="small" icon={<CancelIcon />} />;
  };

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return format(d, 'yyyy-MM');
  });

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>Attendance Records</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {monthOptions.map((m) => (
                  <MenuItem key={m} value={m}>
                    {format(new Date(m + '-01'), 'MMM yyyy')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {showUser && (
              <TextField
                size="small"
                placeholder="Search name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <Tooltip title="Export CSV">
              <IconButton onClick={exportCSV} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f8fafc' } }}>
                <TableCell>Date</TableCell>
                {showUser && <TableCell>Name</TableCell>}
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: showUser ? 6 : 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((record) => (
                    <TableRow
                      key={record.id}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>{formatDate(record.date)}</TableCell>
                      {showUser && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={record.profile?.avatar_url}
                              sx={{ width: 28, height: 28, fontSize: 12 }}
                            >
                              {record.profile?.full_name?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">{record.profile?.full_name}</Typography>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        {record.clock_in ? formatTime(record.clock_in) : '—'}
                      </TableCell>
                      <TableCell>
                        {record.clock_out ? formatTime(record.clock_out) : '—'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={record.total_hours ? 'success.main' : 'text.secondary'}
                        >
                          {record.total_hours ? formatHours(record.total_hours) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{statusChip(record)}</TableCell>
                    </TableRow>
                  ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showUser ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No attendance records found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
