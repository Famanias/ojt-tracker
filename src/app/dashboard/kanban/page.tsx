import { createClient } from '@/lib/supabase/server';
import { KanbanColumn, Profile } from '@/types';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: cols }, { data: tasks }, { data: ojts }, { data: profile }] =
    await Promise.all([
      supabase.from('kanban_columns').select('*').order('position'),
      supabase.from('kanban_tasks').select(`
        *,
        assignee:profiles!kanban_tasks_assignee_id_fkey(id, full_name, avatar_url, role),
        assigned_ojts:task_assignees(
          user_id,
          profile:profiles(id, full_name, avatar_url)
        ),
        attachments:task_attachments(*)
      `).order('position'),
      supabase.from('profiles').select('*').eq('role', 'ojt').eq('is_active', true),
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
    ]);

  const enrichedCols = (cols ?? []).map((col) => ({
    ...col,
    tasks: (tasks ?? [])
      .filter((t: { column_id: string }) => t.column_id === col.id)
      .map((t: { assigned_ojts?: { profile: Profile }[] }) => ({
        ...t,
        assigned_ojts: (t.assigned_ojts ?? []).map((a) => a.profile),
      })),
  })) as KanbanColumn[];

  return (
    <KanbanBoard
      initialColumns={enrichedCols}
      initialOjts={(ojts ?? []) as Profile[]}
      initialProfile={profile as Profile}
    />
  );
}
