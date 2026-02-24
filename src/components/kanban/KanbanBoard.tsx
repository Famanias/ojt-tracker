'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { KanbanColumn, KanbanTask, Profile } from '@/types';
import KanbanColumnComponent from './KanbanColumn';
import KanbanTaskCard from './KanbanTask';
import TaskModal from './TaskModal';
import ColumnDialog from './ColumnDialog';
import { useAuth } from '@/lib/context/AuthContext';

export default function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [allOjts, setAllOjts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>('');
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const supabase = createClient();
  const { profile } = useAuth();

  const canManage = profile?.role === 'admin' || profile?.role === 'supervisor';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    const { data: cols, error: colError } = await supabase
      .from('kanban_columns')
      .select('*')
      .order('position');

    if (colError) { setError(colError.message); setLoading(false); return; }

    const { data: tasks } = await supabase
      .from('kanban_tasks')
      .select(`
        *,
        assignee:profiles!kanban_tasks_assignee_id_fkey(id, full_name, avatar_url, role),
        assigned_ojts:task_assignees(
          user_id,
          profile:profiles(id, full_name, avatar_url)
        ),
        attachments:task_attachments(*)
      `)
      .order('position');

    const { data: ojts } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ojt')
      .eq('is_active', true);

    setAllOjts(ojts ?? []);

    const enrichedCols = (cols ?? []).map((col) => ({
      ...col,
      tasks: (tasks ?? [])
        .filter((t) => t.column_id === col.id)
        .map((t) => ({
          ...t,
          assigned_ojts: (t.assigned_ojts ?? []).map((a: { profile: Profile }) => a.profile),
        })),
    }));

    setColumns(enrichedCols);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // ---- DnD Handlers ----

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    const col = columns.find((c) => c.id === id);
    if (col) { setActiveColumn(col); return; }

    for (const col of columns) {
      const task = col.tasks?.find((t) => t.id === id);
      if (task) { setActiveTask(task); return; }
    }
  };

  const findColumnOfTask = (taskId: string) =>
    columns.find((col) => col.tasks?.some((t) => t.id === taskId));

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = !columns.find((c) => c.id === activeId);
    const isOverColumn = !!columns.find((c) => c.id === overId);

    if (!isActiveTask) return;

    setColumns((prev) => {
      const activeCol = prev.find((c) => c.tasks?.some((t) => t.id === activeId));
      const overCol = isOverColumn
        ? prev.find((c) => c.id === overId)
        : prev.find((c) => c.tasks?.some((t) => t.id === overId));

      if (!activeCol || !overCol || activeCol.id === overCol.id) return prev;

      const activeTask = activeCol.tasks?.find((t) => t.id === activeId)!;
      const overTaskIndex = overCol.tasks?.findIndex((t) => t.id === overId) ?? overCol.tasks?.length ?? 0;

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, tasks: col.tasks?.filter((t) => t.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const newTasks = [...(col.tasks ?? [])];
          newTasks.splice(isOverColumn ? newTasks.length : overTaskIndex, 0, {
            ...activeTask,
            column_id: overCol.id,
          });
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Column reorder
    const isActiveCol = !!columns.find((c) => c.id === activeId);
    if (isActiveCol && activeId !== overId) {
      const oldIndex = columns.findIndex((c) => c.id === activeId);
      const newIndex = columns.findIndex((c) => c.id === overId);
      const newCols = arrayMove(columns, oldIndex, newIndex);
      setColumns(newCols);
      // Persist column positions
      await Promise.all(
        newCols.map((col, i) =>
          supabase.from('kanban_columns').update({ position: i }).eq('id', col.id)
        )
      );
      return;
    }

    // Task reorder / move
    setColumns((prev) => {
      const activeCol = prev.find((c) => c.tasks?.some((t) => t.id === activeId));
      const overCol =
        prev.find((c) => c.id === overId) ||
        prev.find((c) => c.tasks?.some((t) => t.id === overId));

      if (!activeCol || !overCol) return prev;

      if (activeCol.id === overCol.id) {
        const oldIdx = activeCol.tasks?.findIndex((t) => t.id === activeId) ?? 0;
        const newIdx = activeCol.tasks?.findIndex((t) => t.id === overId) ?? 0;
        const newTasks = arrayMove(activeCol.tasks ?? [], oldIdx, newIdx);
        return prev.map((c) => (c.id === activeCol.id ? { ...c, tasks: newTasks } : c));
      }

      return prev;
    });

    // Persist task position & column
    const destCol = columns.find((c) => c.id === overId) ||
      columns.find((c) => c.tasks?.some((t) => t.id === overId));
    if (destCol) {
      const taskIndex = destCol.tasks?.findIndex((t) => t.id === activeId) ?? 0;
      await supabase
        .from('kanban_tasks')
        .update({ column_id: destCol.id, position: taskIndex })
        .eq('id', activeId);

      // Re-index positions
      await Promise.all(
        (destCol.tasks ?? []).map((t, i) =>
          supabase.from('kanban_tasks').update({ position: i }).eq('id', t.id)
        )
      );
    }
  };

  const openCreateTask = (columnId: string) => {
    setDefaultColumnId(columnId);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('kanban_tasks').delete().eq('id', taskId);
    fetchBoard();
  };

  const openCreateColumn = () => {
    setEditingColumn(null);
    setColumnDialogOpen(true);
  };

  const openEditColumn = (col: KanbanColumn) => {
    setEditingColumn(col);
    setColumnDialogOpen(true);
  };

  const deleteColumn = async (colId: string) => {
    await supabase.from('kanban_columns').delete().eq('id', colId);
    fetchBoard();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading board...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Kanban Board</Typography>
          <Typography color="text.secondary">Manage and track OJT tasks</Typography>
        </Box>
        {canManage && (
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateColumn}>
            Add Column
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                height: '100%',
                pb: 2,
                alignItems: 'flex-start',
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
              }}
            >
              {columns.map((col) => (
                <KanbanColumnComponent
                  key={col.id}
                  column={col}
                  canManage={canManage}
                  onAddTask={() => openCreateTask(col.id)}
                  onEditColumn={() => openEditColumn(col)}
                  onDeleteColumn={() => deleteColumn(col.id)}
                  onEditTask={openEditTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </Box>
          </SortableContext>

          <DragOverlay>
            {activeTask && <KanbanTaskCard task={activeTask} isDragging />}
            {activeColumn && (
              <KanbanColumnComponent
                column={activeColumn}
                canManage={false}
                isDragging
                onAddTask={() => {}}
                onEditColumn={() => {}}
                onDeleteColumn={() => {}}
                onEditTask={() => {}}
                onDeleteTask={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      </Box>

      {/* Task Create/Edit Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSave={() => { setTaskModalOpen(false); setEditingTask(null); fetchBoard(); }}
        editingTask={editingTask}
        defaultColumnId={defaultColumnId}
        columns={columns}
        ojts={allOjts}
        currentUser={profile}
      />

      {/* Column Create/Edit Dialog */}
      <ColumnDialog
        open={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        onSave={() => { setColumnDialogOpen(false); fetchBoard(); }}
        editingColumn={editingColumn}
        nextPosition={columns.length}
      />
    </Box>
  );
}
