'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Tooltip, Alert, Pagination
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Replay as RetryIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Metrics {
  eventsToday: number;
  successPercent: number;
  failedPercent: number;
  avgRuntimeMs: number;
  totalRetries: number;
  mostTriggeredEvent: string;
  slowestWorkflow: string;
}

interface LogEntry {
  id: string;
  event_id: string;
  event_type: string;
  workflow_name: string;
  status: string;
  attempt_count: number;
  duration_ms: number;
  created_at: string;
  error_message?: string;
  request_payload?: unknown;
  response_payload?: unknown;
}

interface DeadLetter {
  id: string;
  event_id: string;
  event_type: string;
  status: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  payload?: unknown;
  created_at: string;
  last_attempt_at: string;
}

export default function AutomationLogsClient() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deadLetters, setDeadLetters] = useState<DeadLetter[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [selectedDeadLetter, setSelectedDeadLetter] = useState<DeadLetter | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLogs = async (p = 1) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/automation/logs?page=${p}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs);
      setMetrics(data.metrics);
      setTotalPages(data.pagination.totalPages);
      setPage(p);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchDeadLetters = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/automation/dead-letters?status=failed`);
      if (!res.ok) throw new Error('Failed to fetch dead letters');
      const data = await res.json();
      setDeadLetters(data.deadLetters);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) {
      fetchLogs(1);
    } else {
      fetchDeadLetters();
    }
  }, [tab]);

  const handleReplay = async (id: string) => {
    if (!confirm('Are you sure you want to replay this failed event?')) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/automation/dead-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Replay failed');
      await fetchDeadLetters();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = async (id: string) => {
    if (!confirm('Are you sure you want to discard this event? It cannot be recovered.')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/automation/dead-letters?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Discard failed');
      await fetchDeadLetters();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3, pb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#111111">
          Automation
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => tab === 0 ? fetchLogs(page) : fetchDeadLetters()}
          variant="outlined"
          sx={{ color: '#555555', borderColor: '#cccccc', '&:hover': { bgcolor: '#f9f9f9', borderColor: '#999999' } }}
        >
          Refresh
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>
      )}

      {/* Metrics Section */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Events Today', value: metrics.eventsToday },
            { label: 'Success Rate', value: `${metrics.successPercent}%`, color: '#10b981' },
            { label: 'Failed Rate', value: `${metrics.failedPercent}%`, color: '#ef4444' },
            { label: 'Avg Runtime', value: `${metrics.avgRuntimeMs}ms` },
            { label: 'Total Retries', value: metrics.totalRetries },
            { label: 'Top Event', value: metrics.mostTriggeredEvent },
            { label: 'Slowest', value: metrics.slowestWorkflow || 'N/A' },
          ].map((m, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 12 / 7 }} key={i}>
              <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="#555555" display="block" gutterBottom>
                    {m.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color={m.color || '#111111'} noWrap>
                    {m.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: '1px solid #e5e5e5', mb: 3, '.MuiTab-root': { color: '#555555', fontWeight: 500 }, '.Mui-selected': { color: '#111111 !important', fontWeight: 600 } }}
      >
        <Tab label="Execution Logs" />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚠ Failed Events
              {deadLetters.length > 0 && tab !== 1 && (
                <Chip label={deadLetters.length} size="small" color="error" sx={{ height: 20 }} />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* Content */}
      <Paper sx={{ bgcolor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : tab === 0 ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Status</TableCell>
                    <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Event Type</TableCell>
                    <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Duration</TableCell>
                    <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Retries</TableCell>
                    <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Time</TableCell>
                    <TableCell align="right" sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#555555', py: 4, borderBottom: 'none' }}>No logs found.</TableCell></TableRow>
                  ) : (
                    logs.map(log => (
                      <TableRow key={log.id} sx={{ '& td': { borderBottom: '1px solid #e5e5e5' }, '&:hover': { bgcolor: '#f9f9f9' } }}>
                        <TableCell>
                          <Chip
                            icon={log.status === 'success' ? <SuccessIcon /> : log.status === 'failed' ? <ErrorIcon /> : <WarningIcon />}
                            label={log.status}
                            size="small"
                            color={log.status === 'success' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#111111', fontWeight: 500 }}>{log.event_type}</TableCell>
                        <TableCell sx={{ color: '#555555' }}>{log.duration_ms}ms</TableCell>
                        <TableCell sx={{ color: '#555555' }}>{log.attempt_count - 1}</TableCell>
                        <TableCell sx={{ color: '#555555' }}>{format(new Date(log.created_at), 'MMM d, HH:mm:ss')}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Payload">
                            <IconButton size="small" onClick={() => setSelectedLog(log)} sx={{ color: '#555555' }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 'none' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => fetchLogs(p)}
                  sx={{ '.MuiPaginationItem-root': { color: '#555555' }, '.Mui-selected': { bgcolor: '#e5e5e5', color: '#111111', fontWeight: 600 } }}
                />
              </Box>
            )}
          </>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                <TableRow>
                  <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Event Type</TableCell>
                  <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Error Message</TableCell>
                  <TableCell sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Failed At</TableCell>
                  <TableCell align="right" sx={{ color: '#444444', fontWeight: 600, borderBottom: '1px solid #e5e5e5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deadLetters.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ color: '#555555', py: 4, borderBottom: 'none' }}>No failed events in queue.</TableCell></TableRow>
                ) : (
                  deadLetters.map(dl => (
                    <TableRow key={dl.id} sx={{ '& td': { borderBottom: '1px solid #e5e5e5' }, '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <TableCell sx={{ color: '#111111', fontWeight: 500 }}>{dl.event_type}</TableCell>
                      <TableCell sx={{ color: '#ef4444', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dl.error_message || 'Unknown error'}
                      </TableCell>
                      <TableCell sx={{ color: '#555555' }}>{format(new Date(dl.created_at), 'MMM d, HH:mm:ss')}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Inspect Payload">
                          <IconButton size="small" onClick={() => setSelectedDeadLetter(dl)} sx={{ color: '#555555' }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Retry Event">
                          <IconButton size="small" onClick={() => handleReplay(dl.id)} sx={{ color: '#10b981' }} disabled={actionLoading}>
                            <RetryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Discard">
                          <IconButton size="small" onClick={() => handleDiscard(dl.id)} sx={{ color: '#ef4444' }} disabled={actionLoading}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Log Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#ffffff', color: '#111111', borderRadius: 2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e5e5e5', fontWeight: 700 }}>Execution Details</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedLog?.error_message && (
            <Alert severity="error" sx={{ mb: 2 }}>{selectedLog.error_message}</Alert>
          )}
          <Typography variant="subtitle2" color="#555555" gutterBottom>Request Payload</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e5e5e5', overflow: 'auto', mb: 3, fontSize: 12 }}>
            {selectedLog?.request_payload ? JSON.stringify(selectedLog.request_payload, null, 2) : 'Not stored (log level is minimal or errors-only)'}
          </Box>
          <Typography variant="subtitle2" color="#555555" gutterBottom>Response Payload</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e5e5e5', overflow: 'auto', fontSize: 12 }}>
            {selectedLog?.response_payload ? JSON.stringify(selectedLog.response_payload, null, 2) : 'Not stored'}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e5e5e5', p: 2, bgcolor: '#f9f9f9' }}>
          <Button onClick={() => setSelectedLog(null)} sx={{ color: '#555555', fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dead Letter Dialog */}
      <Dialog
        open={!!selectedDeadLetter}
        onClose={() => setSelectedDeadLetter(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#ffffff', color: '#111111', borderRadius: 2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e5e5e5', fontWeight: 700 }}>Failed Event Details</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{selectedDeadLetter?.error_message}</Alert>
          <Typography variant="subtitle2" color="#555555" gutterBottom>Full Payload for Recovery</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e5e5e5', overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(selectedDeadLetter?.payload, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e5e5e5', p: 2, bgcolor: '#f9f9f9' }}>
          <Button onClick={() => setSelectedDeadLetter(null)} sx={{ color: '#555555', fontWeight: 600 }}>Close</Button>
          <Button
            onClick={() => {
              if (selectedDeadLetter) {
                handleReplay(selectedDeadLetter.id);
                setSelectedDeadLetter(null);
              }
            }}
            variant="contained"
            color="success"
            disableElevation
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
            disabled={actionLoading}
          >
            Retry Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
