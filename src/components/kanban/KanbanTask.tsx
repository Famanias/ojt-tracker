'use client';

import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, AvatarGroup,
  Chip, IconButton, Menu, MenuItem, ListItemIcon, Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTask } from '@/types';
import { formatDate, priorityColor } from '@/lib/utils/format';

interface Props {
  task: KanbanTask;
  canManage?: boolean;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function KanbanTaskCard({ task, canManage = false, isDragging = false, onEdit, onDelete }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortable } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortable ? 0.4 : 1,
  };

  const pColor = priorityColor(task.priority);
  const assignedOjts = task.assigned_ojts ?? [];
  const attachments = task.attachments ?? [];

  return (
    <Box ref={setNodeRef} style={style}>
      <Card
        {...attributes}
        {...listeners}
        sx={{
          borderRadius: 2,
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging
            ? '0 16px 32px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
          transition: 'box-shadow 0.2s, transform 0.1s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            borderColor: '#e2e8f0',
          },
          borderLeft: `4px solid ${pColor}`,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Priority + Menu */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: `${pColor}20`,
                color: pColor,
                fontWeight: 600,
                fontSize: 10,
                height: 20,
                textTransform: 'capitalize',
              }}
            />
            {canManage && (
              <IconButton
                size="small"
                sx={{ mt: -0.5, mr: -0.5 }}
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Title */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.4 }}>
            {task.title}
          </Typography>

          {/* Description preview */}
          {task.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Due date */}
          {task.due_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <DateIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(task.due_date)}
              </Typography>
            </Box>
          )}

          {/* Footer: assignees + attachments */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
            {/* Assigned OJTs */}
            {assignedOjts.length > 0 && (
              <AvatarGroup
                max={4}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 24, height: 24, fontSize: 10, border: '1.5px solid white',
                  },
                }}
              >
                {assignedOjts.map((ojt) => (
                  <Tooltip key={ojt.id} title={ojt.full_name}>
                    <Avatar src={ojt.avatar_url} sx={{ width: 24, height: 24 }}>
                      {ojt.full_name.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}

            {/* Attachments count */}
            {attachments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                <AttachIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{attachments.length}</Typography>
              </Box>
            )}
          </Box>

          {/* Assigned by */}
          {task.assignee && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">by</Typography>
              <Avatar src={task.assignee.avatar_url} sx={{ width: 16, height: 16, fontSize: 8 }}>
                {task.assignee.full_name?.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">{task.assignee.full_name}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); onEdit?.(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit Task
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuAnchor(null); onDelete?.(); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete Task
        </MenuItem>
      </Menu>
    </Box>
  );
}
