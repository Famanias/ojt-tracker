'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/lib/context/AuthContext';
import AttendanceTable from '@/components/attendance/AttendanceTable';

export default function AttendancePage() {
  const { profile } = useAuth();
  const isOjt = profile?.role === 'ojt';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Attendance Records</Typography>
        <Typography color="text.secondary">
          {isOjt ? 'Your attendance history' : 'All OJT attendance records'}
        </Typography>
      </Box>

      <AttendanceTable
        userId={isOjt ? profile?.id : undefined}
        showUser={!isOjt}
      />
    </Box>
  );
}
