# n8n Automation Plan — Revised Implementation Plan

## Changes from Review

1. **Gateway logging decoupled** — DB writes move to a separate `automation/logger-db.ts` module, not inside `client.ts`. Gateway stays single-responsibility.
2. **Configurable payload storage** — `AUTOMATION_LOG_LEVEL` env var controls what gets stored: `full` | `minimal` | `errors-only`. Prevents table bloat.
3. **Dead Letter Queue (Phase 5.5)** — Failed events that exhaust retries go to `automation_dead_letters`. Dashboard shows failed events with Retry / Delete / Inspect.
4. **Metric cards on dashboard** — Events Today, Success %, Failed %, Avg Runtime, Retries, Most Triggered Event, Slowest Workflow.
5. **Phase 6 deferred** — Kept in plan, not implemented. System gets polished after Phase 5.5 first.
6. **Approval page** — Standalone (no login), GET renders / POST acts. 72-hour token expiry. (Deferred with Phase 6.)

---

## Revised Scope

| Phase | Work | Status |
|---|---|---|
| 2 — Event gap | Add `task.completed` emission; log `attendance.updated` as deferred | ✅ Build now |
| 5 — Monitoring | DB logger, `automation_logs` table, dashboard with metrics | ✅ Build now |
| 5.5 — Reliability | Dead letter queue, replay, retry button, failure visibility | ✅ Build now |
| 6 — Approval Workflow | Attendance corrections — full spec kept in plan | ⏸️ Deferred |
| 7 — Extensibility | Developer playbook | ✅ Build now |

---

## Phase 2 Correction

### `attendance.updated` — Deferred
No attendance editing UI exists. The only update is clock-out (`attendance.clocked_out`). Type + registry entries already exist for future use.

### `task.completed` — Build now

#### [MODIFY] [KanbanBoard.tsx](file:///d:/repos/ojt-tracker/src/components/kanban/KanbanBoard.tsx)
- In the cross-column `onDragEnd` handler, after successful reorder API call, check if the destination column title matches "Done" (case-insensitive).
- If so, emit `task.completed` via `emitClientEvent`.

---

## Phase 5 — Monitoring

### 5.1 Database

#### [NEW] `supabase/migrations/20260715000000_create_automation_logs.sql`

Schema per the plan spec, with RLS:
- Admins/supervisors can SELECT rows for their own org
- No client INSERT/UPDATE/DELETE — only service role writes

### 5.2 Decoupled DB Logger

#### [NEW] `src/lib/automation/logger-db.ts`

Standalone module. Single function: `logAutomationResult()`.
- Accepts: event envelope, response, duration, retries, error
- Writes to `automation_logs` via Supabase admin client (service role)
- Respects `AUTOMATION_LOG_LEVEL`:
  - `full` — stores full request + response payloads
  - `minimal` — stores event metadata only, no payloads
  - `errors-only` — stores payloads only on failures
- Fire-and-forget: if the DB write fails, console.warn, never throw
- **Swappable later** — this module is the only thing that touches the logs table

#### [MODIFY] [client.ts](file:///d:/repos/ojt-tracker/src/lib/automation/client.ts)
- After `sendToGateway` returns (both success and failure), call `logAutomationResult()` — but don't await it in the critical path. Fire-and-forget.
- Gateway stays clean: fetch → retry → return. No DB dependency.

#### [MODIFY] [automation.ts](file:///d:/repos/ojt-tracker/src/lib/config/automation.ts)
- Add `logLevel` config reading from `AUTOMATION_LOG_LEVEL` env var (default: `errors-only`)

### 5.3 Dashboard

#### [NEW] `src/app/dashboard/admin/automation/page.tsx`
Server component: fetches metrics + recent logs for admin's org.

#### [NEW] `src/app/dashboard/admin/automation/AutomationLogsClient.tsx`
Client component with:
- **Metric cards** at the top:
  - Events Today
  - Success %
  - Failed %
  - Average Runtime (ms)
  - Total Retries
  - Most Triggered Event
  - Slowest Workflow
- **Logs table** below:
  - Columns: Event, Status, Duration, Retries, Timestamp
  - Filters: status, event type, date range
  - Click row → detail drawer with full payload (if stored)
- Dark theme matching existing admin pages

#### [MODIFY] [Sidebar.tsx](file:///d:/repos/ojt-tracker/src/components/shared/Sidebar.tsx)
- Add "Automation" nav item, admin-only, path `/dashboard/admin/automation`

#### [NEW] `src/app/api/automation/logs/route.ts`
- GET: Returns logs + aggregated metrics for the authenticated admin's org
- Query params: `status`, `eventType`, `from`, `to`, `page`, `limit`

---

## Phase 5.5 — Reliability (Dead Letter Queue)

### 5.5.1 Database

#### [MODIFY] `supabase/migrations/20260715000000_create_automation_logs.sql`
Add to the same migration:

```sql
create table automation_dead_letters (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  event_type text not null,
  organization_id uuid,
  actor_id uuid,
  payload jsonb not null,
  error_message text,
  retry_count int not null default 0,
  max_retries int not null,
  last_attempt_at timestamptz,
  status text not null default 'failed'
    check (status in ('failed', 'retried', 'discarded')),
  created_at timestamptz not null default now()
);
create index on automation_dead_letters (status, created_at desc);
create index on automation_dead_letters (organization_id);
```

### 5.5.2 Dead Letter Writer

#### [MODIFY] `src/lib/automation/logger-db.ts`
- Add `writeDeadLetter()` function
- Called when gateway exhausts all retries and still fails
- Stores the full event payload (always — this is the recovery mechanism)

#### [MODIFY] [client.ts](file:///d:/repos/ojt-tracker/src/lib/automation/client.ts)
- In the catch block (after all retries exhausted), call `writeDeadLetter()` with the full event envelope

### 5.5.3 Replay Endpoint

#### [NEW] `src/app/api/automation/dead-letters/route.ts`
- GET: List dead letters for admin's org (filterable by status)
- POST: Replay a dead letter — re-emits the event through the gateway
- DELETE: Discard a dead letter (mark as `discarded`)

### 5.5.4 Dashboard Integration

#### [MODIFY] `AutomationLogsClient.tsx`
- Add a "⚠ Failed Events" tab/section showing dead letters
- Each row has: Retry button, Delete button, Inspect Payload drawer
- Status badge: failed / retried / discarded

---

## Phase 6 — Approval Workflow (DEFERRED)

> [!NOTE]
> Kept for future reference. Not building now — polish Phase 5/5.5 first.

- `attendance_corrections` table with signed approval tokens (72-hour expiry)
- New events: `attendance.correction.requested`, `attendance.correction.resolved`
- Standalone approval page: GET renders, POST acts (safe from email prefetch bots)
- Two email templates: correction request to supervisor, outcome to student
- Two workflow endpoints + token-validated approval endpoint

---

## Phase 7 — Extensibility

#### [NEW] `docs/automation-guide.md`
7-step checklist for adding new events, router grouping conventions, candidate future integrations.

---

## Verification Plan

### Automated
- `npx tsc --noEmit` — TypeScript compilation
- `npx eslint src/` — Lint
- `npm run build` — Production build

### Manual
- Phase 2: Move task to "Done" column → `task.completed` event in server logs
- Phase 5: Trigger events with `AUTOMATION_ENABLED=true` → rows in `automation_logs` → dashboard shows metrics + logs
- Phase 5.5: Disable n8n → trigger event → verify dead letter created → retry from dashboard → verify re-emission
