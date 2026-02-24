-- ============================================================
-- OJT Tracker System - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('ojt', 'supervisor', 'admin');
create type attendance_status as enum ('clocked_in', 'clocked_out');

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'ojt',
  avatar_url text,
  department text,
  required_hours numeric(6,2) not null default 600,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SITE SETTINGS TABLE
-- ============================================================
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_name text not null default 'OJT Training Site',
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  radius_meters integer not null default 150,
  address text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- Insert default settings (update with your actual coordinates)
insert into site_settings (site_name, latitude, longitude, radius_meters, address)
values ('Company Office', 14.5995, 120.9842, 150, 'Manila, Philippines');

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  clock_in timestamptz,
  clock_out timestamptz,
  clock_in_latitude numeric(10,7),
  clock_in_longitude numeric(10,7),
  clock_out_latitude numeric(10,7),
  clock_out_longitude numeric(10,7),
  clock_in_distance_meters numeric(8,2),
  clock_out_distance_meters numeric(8,2),
  total_hours numeric(6,4),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- KANBAN COLUMNS TABLE
-- ============================================================
create table kanban_columns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  color text default '#6366f1',
  position integer not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default columns
insert into kanban_columns (title, color, position) values
  ('To Do', '#ef4444', 0),
  ('Doing', '#f59e0b', 1),
  ('Done', '#22c55e', 2);

-- ============================================================
-- KANBAN TASKS TABLE
-- ============================================================
create table kanban_tasks (
  id uuid primary key default uuid_generate_v4(),
  column_id uuid not null references kanban_columns(id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references profiles(id),      -- who created/assigned the task (supervisor/admin)
  position integer not null default 0,
  due_date date,
  priority text default 'medium',                -- low, medium, high
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TASK ASSIGNEES (OJTs assigned to a task)
-- ============================================================
create table task_assignees (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references kanban_tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique(task_id, user_id)
);

-- ============================================================
-- TASK ATTACHMENTS
-- ============================================================
create table task_attachments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references kanban_tasks(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,   -- image, video, document
  file_size bigint,
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table attendance enable row level security;
alter table kanban_columns enable row level security;
alter table kanban_tasks enable row level security;
alter table task_assignees enable row level security;
alter table task_attachments enable row level security;

-- Profiles policies
create policy "Users can view all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can insert profiles" on profiles for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update any profile" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete profiles" on profiles for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Site settings policies
create policy "Anyone authenticated can view site settings" on site_settings for select using (auth.uid() is not null);
create policy "Admins can update site settings" on site_settings for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Attendance policies
create policy "Users can view own attendance" on attendance for select using (auth.uid() = user_id);
create policy "Supervisors/Admins can view all attendance" on attendance for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'admin'))
);
create policy "Users can insert own attendance" on attendance for insert with check (auth.uid() = user_id);
create policy "Users can update own attendance" on attendance for update using (auth.uid() = user_id);
create policy "Admins can update any attendance" on attendance for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Kanban columns policies
create policy "All authenticated can view columns" on kanban_columns for select using (auth.uid() is not null);
create policy "Supervisors/Admins can manage columns" on kanban_columns for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'admin'))
);

-- Kanban tasks policies
create policy "All authenticated can view tasks" on kanban_tasks for select using (auth.uid() is not null);
create policy "Supervisors/Admins can manage tasks" on kanban_tasks for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'admin'))
);
-- OJTs can create tasks (they become the assignee_id)
create policy "OJTs can insert own tasks" on kanban_tasks for insert with check (
  auth.uid() = assignee_id
);
-- OJTs can update/delete their own tasks
create policy "OJTs can update own tasks" on kanban_tasks for update using (
  auth.uid() = assignee_id
);
create policy "OJTs can delete own tasks" on kanban_tasks for delete using (
  auth.uid() = assignee_id
);

-- Task assignees policies
create policy "All authenticated can view task assignees" on task_assignees for select using (auth.uid() is not null);
create policy "Supervisors/Admins can manage task assignees" on task_assignees for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'admin'))
);
-- OJTs can insert assignees for tasks they created
create policy "OJTs can insert assignees for own tasks" on task_assignees for insert with check (
  exists (select 1 from kanban_tasks where id = task_id and assignee_id = auth.uid())
);
-- OJTs can update their own assignment row (accept/reject invitations)
create policy "OJTs can update own assignment status" on task_assignees for update using (
  auth.uid() = user_id
);
-- OJTs can delete assignees from tasks they created
create policy "OJTs can delete assignees for own tasks" on task_assignees for delete using (
  exists (select 1 from kanban_tasks where id = task_id and assignee_id = auth.uid())
);

-- Task attachments policies
create policy "All authenticated can view attachments" on task_attachments for select using (auth.uid() is not null);
create policy "Supervisors/Admins can manage attachments" on task_attachments for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('supervisor', 'admin'))
);
-- OJTs can upload attachments to tasks they created
create policy "OJTs can insert attachments for own tasks" on task_attachments for insert with check (
  exists (select 1 from kanban_tasks where id = task_id and assignee_id = auth.uid())
);
-- OJTs can delete attachments from tasks they created
create policy "OJTs can delete attachments for own tasks" on task_attachments for delete using (
  exists (select 1 from kanban_tasks where id = task_id and assignee_id = auth.uid())
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger trg_attendance_updated_at before update on attendance for each row execute function update_updated_at();
create trigger trg_kanban_columns_updated_at before update on kanban_columns for each row execute function update_updated_at();
create trigger trg_kanban_tasks_updated_at before update on kanban_tasks for each row execute function update_updated_at();
create trigger trg_site_settings_updated_at before update on site_settings for each row execute function update_updated_at();

-- Calculate total hours when clocking out
create or replace function calculate_total_hours()
returns trigger as $$
begin
  if new.clock_out is not null and new.clock_in is not null then
    new.total_hours = extract(epoch from (new.clock_out - new.clock_in)) / 3600.0;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_attendance_total_hours before update on attendance for each row execute function calculate_total_hours();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  v_role user_role := 'ojt';
  v_role_str text;
begin
  v_role_str := new.raw_user_meta_data->>'role';
  if v_role_str in ('ojt', 'supervisor', 'admin') then
    v_role := v_role_str::user_role;
  end if;

  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    new.email,
    v_role
  )
  on conflict (id) do update
    set
      full_name = excluded.full_name,
      email     = excluded.email,
      role      = excluded.role,
      updated_at = now();

  return new;
exception when others then
  -- Never let a trigger failure block auth user creation
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('task-attachments', 'task-attachments', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- Storage policies for task-attachments (private, authenticated access)
create policy "Authenticated users can upload task attachments"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'task-attachments');

create policy "Authenticated users can view task attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'task-attachments');

create policy "Users can delete their own task attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'task-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars (public read, authenticated write)
create policy "Anyone can view avatars"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
