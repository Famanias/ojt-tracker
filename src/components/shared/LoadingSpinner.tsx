'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ message = 'Loading...', fullPage = false }: Props) {
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          gap: 2,
          zIndex: 9999,
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 4, justifyContent: 'center' }}>
      <CircularProgress size={24} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
