'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip,
  IconButton, Tooltip, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Alert, CircularProgress, Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { Profile, UserRole } from '@/types';
import { roleLabel, formatDate } from '@/lib/utils/format';

interface UserFormData {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  required_hours: number;
  is_active: boolean;
}

const defaultForm: UserFormData = {
  full_name: '',
  email: '',
  password: '',
  role: 'ojt',
  department: '',
  required_hours: 600,
  is_active: true,
};

export default function UsersClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Profile | null>(null);
  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditingUser(null);
    setFormData(defaultForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department ?? '',
      required_hours: user.required_hours,
      is_active: user.is_active,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    if (!formData.full_name || !formData.email) {
      setError('Full name and email are required.');
      setSubmitting(false);
      return;
    }

    if (editingUser) {
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          department: formData.department || null,
          required_hours: formData.required_hours,
          is_active: formData.is_active,
        })
        .eq('id', editingUser.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setDialogOpen(false);
        fetchUsers();
      }
    } else {
      // Create new user via API route
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to create user.');
      } else {
        setDialogOpen(false);
        fetchUsers();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    const { error: deleteError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', deleteDialog.id);

    if (!deleteError) {
      fetchUsers();
    }
    setDeleteDialog(null);
  };

  const roleColor: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success'> = {
    ojt: 'default',
    supervisor: 'primary',
    admin: 'error',
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>User Management</Typography>
          <Typography color="text.secondary">Add and manage OJTs, supervisors, and admins.</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openCreate}>
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="ojt">OJT</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length} users
          </Typography>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f8fafc' } }}>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Required Hours</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={user.avatar_url} sx={{ width: 38, height: 38 }}>
                        {user.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{user.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={roleLabel(user.role)} color={roleColor[user.role]} size="small" />
                  </TableCell>
                  <TableCell>{user.department ?? '—'}</TableCell>
                  <TableCell>{user.required_hours}h</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog(user)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth label="Full Name" required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth label="Email" type="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
              />
            </Grid>
            {!editingUser && (
              <Grid size={12}>
                <TextField
                  fullWidth label="Password" type="password" required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Minimum 8 characters"
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <MenuItem value="ojt">OJT</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="admin">System Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Required Hours" type="number"
                value={formData.required_hours}
                onChange={(e) => setFormData({ ...formData, required_hours: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle fontWeight={700}>Deactivate User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{deleteDialog?.full_name}</strong>?
            They will no longer be able to log in.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
