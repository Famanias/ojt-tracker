# OJT Tracker System

A comprehensive On-the-Job Training tracker with time tracking, GPS clock-in/out enforcement, role-based dashboards, and a drag-and-drop Kanban board.

## Features

- **Time Tracking**  OJTs clock in and out; total hours automatically calculated
- **GPS Enforcement**  OJTs can only clock in/out within a configurable radius of the workplace (set by admin); supervisors and admins are exempt
- **Three User Roles**
  - **OJT**  clock in/out, view own attendance history and hours progress, use Kanban board
  - **Supervisor**  oversee all OJT attendance records, view Kanban board
  - **Admin**  full user CRUD, site location settings, reports, Kanban board management
- **Kanban Board**  drag-and-drop tasks and columns, assign tasks to OJTs, file/image/video attachments, priorities, due dates
- **Reports**  CSV export of attendance data

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Material UI v7**
- **Tailwind CSS v4**
- **@dnd-kit** (drag-and-drop)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ojt-tracker
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### 3. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and click **Run**

This creates all tables, RLS policies, triggers, storage buckets, and default data (default Kanban columns, default site settings pointing to Manila).

### 4. Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in your Supabase dashboard under **Project Settings  API**.

> **Security**: Never commit `.env.local` to version control. The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies and is only used server-side.

### 5. Create the First Admin User

Since there is no public registration, create the first admin manually:

1. In your Supabase dashboard, go to **Authentication  Users**
2. Click **Add user** and create a user with email/password
3. Go to **Table Editor  profiles** and find that user
4. Set the `role` column to `admin`

Or via SQL Editor:

```sql
update profiles set role = 'admin' where email = 'your-admin@email.com';
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  you will be redirected to `/login`.

---

## User Roles & Permissions

| Feature | OJT | Supervisor | Admin |
|---|:---:|:---:|:---:|
| Clock in/out (GPS required) | Yes |  |  |
| View own attendance | Yes | Yes | Yes |
| View all OJT attendance |  | Yes | Yes |
| Kanban board | Yes | Yes | Yes |
| Manage Kanban columns/tasks | Yes | Yes | Yes |
| Reports & CSV export |  | Yes | Yes |
| Manage users |  |  | Yes |
| Configure site location/GPS |  |  | Yes |

---

## GPS / Location Settings

- Default location: Manila (14.5995 N, 120.9842 E) with 200m radius
- Admins change GPS coordinates and radius in **Admin  Site Settings**
- Use the **"Use My Current Location"** button to auto-fill coordinates
- OJTs outside the radius will see an error when trying to clock in/out

---

## Adding Users

Admins can create users from **Admin  Manage Users**:

- Fill in name, email, password, role, department, and required OJT hours
- Users are created immediately (no email confirmation)
- Users can be deactivated (soft-delete)

---

## Kanban Board

- Default columns: **To Do**, **Doing**, **Done**
- Drag columns to reorder; drag tasks between columns
- Create custom columns with color coding
- Tasks require a title and at least one assigned OJT
- Attachments: images, videos, PDFs, Word/Excel (up to 50MB each)

---

## Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
 app/
    api/users/          # Admin user creation API
    dashboard/
       admin/          # Admin dashboards (users, settings)
       supervisor/     # Supervisor dashboard
       ojt/            # OJT dashboard with clock-in/out
       attendance/     # Attendance history
       kanban/         # Kanban board
       reports/        # Reports & CSV export
    login/
 components/
    attendance/         # ClockButton, AttendanceTable, HoursProgress
    kanban/             # KanbanBoard, KanbanColumn, KanbanTask, TaskModal
    shared/             # Sidebar, MuiThemeProvider, StatCard, LoadingSpinner
 lib/
    context/            # AuthContext
    hooks/              # useAttendance, useLocation
    supabase/           # client.ts, server.ts
    utils/              # distance.ts (GPS), format.ts
 proxy.ts                # Route protection & role-based redirects
 types/index.ts          # TypeScript type definitions
supabase/
 schema.sql              # Full database schema + storage setup
```
