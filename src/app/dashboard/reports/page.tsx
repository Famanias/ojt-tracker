import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();
  const month = format(new Date(), 'yyyy-MM');
  const start = format(startOfMonth(new Date(month + '-01')), 'yyyy-MM-dd');
  const end = format(endOfMonth(new Date(month + '-01')), 'yyyy-MM-dd');

  const [{ data: ojts }, { data: allAtt }, { data: monthAtt }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'ojt').eq('is_active', true),
      supabase.from('attendance').select('user_id, total_hours, date').not('total_hours', 'is', null),
      supabase.from('attendance').select('user_id, total_hours, date')
        .gte('date', start).lte('date', end).not('total_hours', 'is', null),
    ]);

  const reports = (ojts ?? []).map((ojt: Profile) => {
    const all = (allAtt ?? []).filter((a) => a.user_id === ojt.id);
    const mon = (monthAtt ?? []).filter((a) => a.user_id === ojt.id);
    const total_hours = all.reduce((s: number, a) => s + (a.total_hours ?? 0), 0);
    const this_month_hours = mon.reduce((s: number, a) => s + (a.total_hours ?? 0), 0);
    const total_days = all.length;
    const this_month_days = mon.length;
    return {
      profile: ojt,
      total_hours,
      total_days,
      completion_pct: Math.min(100, (total_hours / ojt.required_hours) * 100),
      this_month_hours,
      this_month_days,
      avg_daily_hours: total_days > 0 ? total_hours / total_days : 0,
    };
  }).sort((a, b) => b.total_hours - a.total_hours);

  return <ReportsClient initialReports={reports} initialMonth={month} />;
}
