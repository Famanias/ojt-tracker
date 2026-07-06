Overall Architecture

Current

Drag Card
      ↓
React State Updated
      ↓
UI Looks Correct
      ↓
Refresh
      ↓
Everything Resets

Target

Drag Card
      ↓
Optimistic UI Update
      ↓
Background API Call
      ↓
Database Updated
      ↓
Done

Refresh
      ↓
Correct Order Loaded

The user should never wait for the database.

Phase 1 — Backend APIs

Instead of many APIs, create only two.

PATCH /api/kanban/reorder/tasks

PATCH /api/kanban/reorder/columns

These endpoints exist ONLY for ordering.

Do NOT reuse edit task.

Keep them dedicated.

Phase 2 — Reordering Columns

Your table already has

kanban_columns

id
title
position

Dragging

Todo
Doing
Review
Done

to

Doing
Todo
Review
Done

should update

Doing -> position 0
Todo -> position 1
Review -> position 2
Done -> position 3

The frontend should send

[
  {
    id,
    position
  }
]

Example

[
  {
    "id":"column-a",
    "position":0
  },
  {
    "id":"column-b",
    "position":1
  },
  {
    "id":"column-c",
    "position":2
  }
]

Backend

Loop

update column
set position = ?
where id = ?

Since there are usually fewer than 10 columns, this is very fast.

Phase 3 — Reordering Tasks Inside Same Column

Example

Before

Todo

0 Task A
1 Task B
2 Task C
3 Task D

Move

Task D

to index 1

Result

Task A
Task D
Task B
Task C

Database should become

Task A position 0

Task D position 1

Task B position 2

Task C position 3

Don't only update Task D.

Update every affected task.

This guarantees

0
1
2
3

No gaps.

No duplicates.

Phase 4 — Moving Between Columns

Example

Todo

Task A
Task B
Task C

Doing

Task D
Task E

Move

Task B

↓

Doing

Result

Todo

Task A
Task C

Doing

Task D
Task B
Task E

Database must update BOTH columns.

Todo

Task A

position 0

Task C

position 1

Doing

Task D

position 0

Task B

position 1

Task E

position 2

Also update

Task B

column_id = Doing

This is the most common bug people miss.

Phase 5 — API Payload

Instead of sending one task,

send only the affected tasks.

Example

{
    "tasks":[
        {
            "id":"1",
            "column_id":"todo",
            "position":0
        },
        {
            "id":"2",
            "column_id":"todo",
            "position":1
        },
        {
            "id":"3",
            "column_id":"doing",
            "position":0
        }
    ]
}

Backend

for task

update

column_id
position

One request.

Many updates.

Phase 6 — Optimistic Updates

Do NOT wait for Supabase.

Flow

Drag

↓

Immediately update React state

↓

User sees movement instantly

↓

Send PATCH request

↓

Success

nothing happens

↓

Failure

rollback previous state

This makes the board feel instant.

Phase 7 — Loading the Board

When fetching columns

Always

order by position asc

When fetching tasks

Always

order by position asc

Never rely on creation date.

Phase 8 — Database Transaction

If using PostgreSQL directly,

all updates should happen inside one transaction.

BEGIN

update

update

update

COMMIT

Not

update

update

update

Otherwise one failed update leaves inconsistent positions.

Since you're using Supabase, the cleanest approach is to expose a PostgreSQL RPC function that performs the reorder inside a single transaction rather than issuing multiple client-side updates.

Phase 9 — Performance

Do not do this

drag

↓

20 API requests

Do

drag

↓

1 API request

↓

contains every changed task

Example

PATCH

tasks

[
...
...
...
]

One network call.

Phase 10 — React Query / SWR

If you're using React Query

optimistically update cache

↓

mutation

↓

invalidate kanban query

If using plain React

setColumns()

↓

PATCH

↓

done
Phase 11 — Race Conditions

Suppose

Admin A

and

Admin B

drag simultaneously.

Always trust the database.

After every successful reorder,

reload

columns

tasks

or invalidate the cache.

That guarantees everyone eventually sees the same order.

Phase 12 — Future-Proofing

If you later implement real-time collaboration using Supabase Realtime, this architecture still works:

Admin A drags

↓

Database updated

↓

Realtime event

↓

Admin B receives update

↓

Board automatically reorders

No redesign required.

Suggested Project Structure
lib/
    services/
        kanban.ts
            reorderTasks()
            reorderColumns()

app/
    api/
        kanban/
            reorder/
                tasks/
                    route.ts
                columns/
                    route.ts
Database Changes Needed

None are strictly required. Your schema already has the necessary fields:

kanban_columns.position for column ordering.
kanban_tasks.position for ordering tasks within a column.
kanban_tasks.column_id for moving tasks between columns.

I would only add indexes to make ordering queries more efficient as your data grows:

create index if not exists idx_kanban_columns_org_position
on kanban_columns(org_id, position);

create index if not exists idx_kanban_tasks_column_position
on kanban_tasks(column_id, position);

create index if not exists idx_kanban_tasks_org_column_position
on kanban_tasks(org_id, column_id, position);

These indexes match your most common query pattern (WHERE org_id/column_id ... ORDER BY position) and will keep board loading and reordering fast.

Implementation Order

I would tackle the work in this order to minimize bugs and keep each milestone testable:

Column drag persistence
Create PATCH /api/kanban/reorder/columns.
Update all position values after a column drag.
Load columns ordered by position.
Task reorder within the same column
Create PATCH /api/kanban/reorder/tasks.
Recalculate positions for every affected task in that column.
Persist in a single request.
Task moves across columns
Update the task's column_id.
Recalculate positions in both the source and destination columns.
Persist all affected rows in one request.
Optimistic UI
Update local state immediately.
Send the reorder request in the background.
Roll back only if the request fails.
Transactional persistence
Move the reorder logic into a PostgreSQL RPC function so all updates succeed or fail together.
Refresh or invalidate the Kanban query after success.