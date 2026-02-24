'use client';

import dynamic from 'next/dynamic';
import { KanbanColumn, Profile } from '@/types';
import { CircularProgress, Box } from '@mui/material';

const KanbanBoard = dynamic(() => import('./KanbanBoard'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  ),
});

interface Props {
  initialColumns: KanbanColumn[];
  initialOjts: Profile[];
  initialProfile: Profile;
}

export default function KanbanBoardClient(props: Props) {
  return <KanbanBoard {...props} />;
}
