Goal

Transform the Kanban board from:

To-do
Doing
Done

into

Backlog
Ideas
Ready
To-do
In Progress
Blocked
Code Review
Testing
Done
Archived

where admins/supervisors can create, edit, delete, and reorder columns.

Phase 1 — Remove Hardcoded Columns

Currently, somewhere in the frontend, there is likely something similar to:

const columns = [
    "To-do",
    "Doing",
    "Done"
]

or

<Column title="To-do" />
<Column title="Doing" />
<Column title="Done" />

Everything should instead be driven from the database.

The board should render:

GET columns

↓

ORDER BY position

↓

Render dynamically

There should never again be hardcoded columns in the UI.

Phase 2 — Add "Create Column"

Add a button at the end of the Kanban board.

+ Add Column

Clicking it opens a small modal.

Example

---------------------
Create Column

Title

[____________]

Color

🟣 Purple

[Cancel] [Create]
---------------------

Only title should be required.

Color can default to your existing purple.

Phase 3 — Determine New Position

When creating a column,

don't ask the user where to place it.

Simply append it.

Example

Current

0 To-do

1 Doing

2 Done

New

Backlog

Database

Backlog

position = 3

Simply

SELECT MAX(position)

+1

No reordering needed.

Phase 4 — API

Create one endpoint

POST

/api/kanban/columns

Payload

{
    "title":"Testing",
    "color":"#3b82f6"
}

Backend

find highest position

↓

insert column

↓

return new column

The frontend immediately appends it.

Phase 5 — Optimistic UI

Don't wait.

Flow

Create

↓

Temporary column appears

↓

API request

↓

Replace temp ID

↓

Done

The board should feel instant.

Phase 6 — Editing Columns

Allow clicking

⋮

on every column.

Menu

Rename

Change Color

Delete

Rename modal

Title

[In Progress]

Save

Simple PATCH request.

Phase 7 — Delete Column

Deleting is the only complex part.

Never allow deleting if tasks exist without asking.

Instead show

Delete "Testing"

This column has

15 tasks.

Move them to

▼ Done

[Delete]

or

Archive all tasks

or

Cancel

Never silently delete tasks.

Phase 8 — Delete API
DELETE

/api/kanban/columns/:id

Payload

{
    "moveTasksTo":"done-column-id"
}

Backend

move tasks

↓

delete column

↓

recalculate positions

↓

return success
Phase 9 — Empty Columns

Support empty columns.

Example

Testing

-----------------

Drop tasks here

No placeholder tasks.

Phase 10 — Maximum Columns

Don't limit it.

Allow

4

8

20

50

The board should simply become horizontally scrollable.

Phase 11 — Horizontal Scrolling

Instead of wrapping,

use

-------------------------------------------------------------

To-do

Doing

Review

Testing

Done

+ Add Column

-------------------------------------------------------------

Scrollable horizontally.

This is the standard Kanban experience.

Phase 12 — Column Width

Give every column a fixed width.

Example

320px

instead of

width: auto

Otherwise the layout constantly shifts.

Phase 13 — Default Columns

When a new organization is created,

instead of hardcoding

To-do

Doing

Done

inside the frontend,

the backend should create them.

Organization Created

↓

Insert

To-do

Doing

Done

with

position

0

1

2

That already aligns with how your organization setup currently works.

Phase 14 — Drag-and-Drop Integration

Since columns already have

position

the new columns automatically participate in drag-and-drop.

Example

Before

To-do

Doing

Done

Testing

Drag

Testing

between

Doing

Done

Database

To-do

0

Doing

1

Testing

2

Done

3

Nothing special required.

Phase 15 — Permissions

Only

Admin

Supervisor

should be able to

Create columns
Rename columns
Delete columns
Reorder columns

OJTs should only be able to view the board and interact with tasks according to your existing permissions.

Phase 16 — UI Improvements

Every column header should contain:

Title

Task Count

Color Indicator

⋮ Menu

Example

🟣

Testing

(14)

⋮

The task count updates automatically based on the tasks currently in that column.

Phase 17 — Future-Proofing

This implementation will make future features straightforward:

✅ Unlimited custom workflows
✅ Organization-specific Kanban boards
✅ Drag-and-drop column ordering
✅ Custom colors
✅ Column icons (future)
✅ WIP limits (future)
✅ Collapsible columns (future)
✅ Per-column automation (future)
✅ Default column templates for new organizations (future)
Recommended Implementation Order
Replace hardcoded columns with database-driven rendering.
Implement "Create Column" (POST /api/kanban/columns) and append new columns to the end.
Allow renaming and color changes (PATCH /api/kanban/columns/:id).
Implement column deletion with task reassignment or archiving safeguards.
Integrate with the column drag-and-drop persistence by updating position values.
Polish the UI with horizontal scrolling, fixed-width columns, task counts, and contextual menus.
