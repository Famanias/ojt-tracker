'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControl, InputLabel, Select,
  MenuItem, CircularProgress, Typography, Box, Avatar,
  Checkbox, ListItemText, OutlinedInput, Chip, Alert,
  IconButton, Tooltip, Divider, LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { KanbanTask, KanbanColumn, Profile, TaskAttachment } from '@/types';
import { getFileType, formatFileSize, priorityColor } from '@/lib/utils/format';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editingTask: KanbanTask | null;
  defaultColumnId: string;
  columns: KanbanColumn[];
  ojts: Profile[];
  currentUser: Profile | null;
}

const PRIORITIES = ['low', 'medium', 'high'];

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export default function TaskModal({
  open, onClose, onSave, editingTask, defaultColumnId, columns, ojts, currentUser,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [assignedOjtIds, setAssignedOjtIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingAttachments, setExistingAttachments] = useState<TaskAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description ?? '');
        setColumnId(editingTask.column_id);
        setAssignedOjtIds((editingTask.assigned_ojts ?? []).map((o) => o.id));
        setPriority(editingTask.priority);
        setDueDate(editingTask.due_date ?? '');
        setExistingAttachments(editingTask.attachments ?? []);
      } else {
        setTitle('');
        setDescription('');
        setColumnId(defaultColumnId);
        setAssignedOjtIds([]);
        setPriority('medium');
        setDueDate('');
        setExistingAttachments([]);
      }
      setUploadingFiles([]);
      setError('');
    }
  }, [open, editingTask, defaultColumnId]);

  const uploadFile = async (taskId: string, file: File, uploadId: string) => {
    const ext = file.name.split('.').pop();
    const path = `${taskId}/${uuidv4()}.${ext}`;

    // Update progress
    const updateProgress = (progress: number) =>
      setUploadingFiles((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
      );

    updateProgress(20);

    const { data: storageData, error: storageError } = await supabase.storage
      .from('task-attachments')
      .upload(path, file, { upsert: false });

    if (storageError) {
      setUploadingFiles((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, error: storageError.message, progress: 0 } : u))
      );
      return;
    }

    updateProgress(80);

    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(path);

    await supabase.from('task_attachments').insert({
      task_id: taskId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: getFileType(file.type),
      file_size: file.size,
      uploaded_by: currentUser?.id,
    });

    updateProgress(100);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Task title is required.'); return; }
    if (assignedOjtIds.length === 0) { setError('Please assign at least one OJT.'); return; }
    setSaving(true);
    setError('');

    let taskId = editingTask?.id;

    if (editingTask) {
      const { error: updateError } = await supabase
        .from('kanban_tasks')
        .update({
          title: title.trim(),
          description: description || null,
          column_id: columnId,
          priority,
          due_date: dueDate || null,
        })
        .eq('id', editingTask.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }

      // Sync assignees
      await supabase.from('task_assignees').delete().eq('task_id', editingTask.id);
    } else {
      const { data: newTask, error: insertError } = await supabase
        .from('kanban_tasks')
        .insert({
          column_id: columnId,
          title: title.trim(),
          description: description || null,
          assignee_id: currentUser?.id,
          priority,
          due_date: dueDate || null,
          position: columns.find((c) => c.id === columnId)?.tasks?.length ?? 0,
        })
        .select()
        .single();

      if (insertError || !newTask) { setError(insertError?.message ?? 'Failed to create task'); setSaving(false); return; }
      taskId = newTask.id;
    }

    // Insert task assignees
    await supabase.from('task_assignees').insert(
      assignedOjtIds.map((uid) => ({ task_id: taskId!, user_id: uid }))
    );

    // Upload pending files
    const pending = uploadingFiles.filter((u) => !u.error && u.progress < 100);
    await Promise.all(pending.map((u) => uploadFile(taskId!, u.file, u.id)));

    setSaving(false);
    onSave();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: UploadingFile[] = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      progress: 0,
    }));
    setUploadingFiles((prev) => [...prev, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeUploadingFile = (id: string) =>
    setUploadingFiles((prev) => prev.filter((u) => u.id !== id));

  const deleteAttachment = async (attachmentId: string, fileUrl: string) => {
    await supabase.from('task_attachments').delete().eq('id', attachmentId);
    // Optionally delete from storage
    const path = new URL(fileUrl).pathname.split('/task-attachments/')[1];
    if (path) await supabase.storage.from('task-attachments').remove([path]);
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const fileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon sx={{ fontSize: 18, color: '#6366f1' }} />;
    if (type === 'video') return <VideoIcon sx={{ fontSize: 18, color: '#f59e0b' }} />;
    return <AttachIcon sx={{ fontSize: 18, color: '#64748b' }} />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {editingTask ? 'Edit Task' : 'New Task'}
        </Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2.5}>
          {/* Title */}
          <Grid size={12}>
            <TextField
              fullWidth label="Task Title *" value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </Grid>

          {/* Column + Priority */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Column</InputLabel>
              <Select value={columnId} label="Column" onChange={(e) => setColumnId(e.target.value)}>
                {columns.map((col) => (
                  <MenuItem key={col.id} value={col.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color }} />
                      {col.title}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: priorityColor(p) }} />
                      <Typography sx={{ textTransform: 'capitalize' }}>{p}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              fullWidth label="Description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline rows={3}
              placeholder="Add task details..."
            />
          </Grid>

          {/* Assigned OJTs (required) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Assigned OJTs *</InputLabel>
              <Select
                multiple
                value={assignedOjtIds}
                onChange={(e) => setAssignedOjtIds(e.target.value as string[])}
                input={<OutlinedInput label="Assigned OJTs *" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => {
                      const ojt = ojts.find((o) => o.id === id);
                      return (
                        <Chip
                          key={id}
                          size="small"
                          avatar={<Avatar src={ojt?.avatar_url}>{ojt?.full_name.charAt(0)}</Avatar>}
                          label={ojt?.full_name ?? id}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {ojts.map((ojt) => (
                  <MenuItem key={ojt.id} value={ojt.id}>
                    <Checkbox checked={assignedOjtIds.includes(ojt.id)} />
                    <Avatar src={ojt.avatar_url} sx={{ width: 24, height: 24, mr: 1 }}>
                      {ojt.full_name.charAt(0)}
                    </Avatar>
                    <ListItemText primary={ojt.full_name} secondary={ojt.department} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth label="Due Date" type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Assignee (auto-set, display only) */}
          {currentUser && (
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.5, bgcolor: '#f8fafc', borderRadius: 2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Avatar src={currentUser.avatar_url} sx={{ width: 32, height: 32 }}>
                  {currentUser.full_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{currentUser.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">Task creator (auto-set)</Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Attachments */}
          <Grid size={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Attachments
            </Typography>

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {existingAttachments.map((att) => (
                  <Box
                    key={att.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      p: 1.5, bg: '#f8fafc', borderRadius: 1.5,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {fileIcon(att.file_type)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap fontWeight={500}>{att.file_name}</Typography>
                      {att.file_size && (
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(att.file_size)}
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Download">
                      <IconButton size="small" href={att.file_url} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => deleteAttachment(att.id, att.file_url)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}

            {/* New uploads */}
            {uploadingFiles.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {uploadingFiles.map((upload) => (
                  <Box
                    key={upload.id}
                    sx={{
                      p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {fileIcon(getFileType(upload.file.type))}
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>{upload.file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(upload.file.size)}
                      </Typography>
                      <IconButton size="small" onClick={() => removeUploadingFile(upload.id)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {upload.error ? (
                      <Typography variant="caption" color="error">{upload.error}</Typography>
                    ) : (
                      <LinearProgress
                        variant={upload.progress === 0 ? 'indeterminate' : 'determinate'}
                        value={upload.progress}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Dropzone */}
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${isDragActive ? '#6366f1' : '#e2e8f0'}`,
                borderRadius: 2, p: 3, textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                bgcolor: isDragActive ? '#6366f108' : '#fafafa',
                '&:hover': { borderColor: '#6366f1', bgcolor: '#6366f108' },
              }}
            >
              <input {...getInputProps()} />
              <AttachIcon sx={{ color: '#94a3b8', fontSize: 32, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports images, videos, PDFs, Word, Excel — max 50MB each
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {editingTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
