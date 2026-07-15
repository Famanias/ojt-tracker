Implementation Plan — Standardize Automation Workflow Payloads
Objective

Refactor all Next.js automation workflow endpoints to consume the standardized automation event envelope instead of expecting flattened JSON payloads.

Repository Review Required

[!IMPORTANT]
This implementation plan is based on the intended architecture, not the current repository structure. Before making any changes, inspect the existing codebase and reuse existing files, utilities, and abstractions whenever possible.

Do NOT create new files, helpers, modules, or types if an equivalent implementation already exists. For example:

If a shared request parser already exists, extend it instead of creating another.
If API key validation is already centralized, reuse it rather than duplicating the logic.
If automation utilities already exist (src/lib/automation/*), integrate with them instead of introducing parallel implementations.
If payload types already exist in types.ts, reuse and extend those definitions instead of creating new interfaces.

Any file paths in this plan marked as [NEW] are suggestions, not requirements. If the repository already contains an appropriate file or module, modify that file instead. Prefer extending the existing architecture over introducing additional files.

This makes the event contract consistent across the Gateway, n8n, and all workflow endpoints, eliminates per-workflow payload mapping inside n8n, and significantly improves maintainability as the automation platform grows.

Goals
Adopt a single automation request format for all workflows.
Keep n8n as a pure orchestrator (no payload transformations).
Reduce duplicated request parsing.
Make future workflow creation nearly boilerplate.
Phase 1 — Create Shared Automation Request Parser
[NEW] src/lib/automation/workflow-request.ts

Create a reusable helper for workflow endpoints.

Responsibilities
Validate the automation API key.
Parse the request body.
Validate the standard automation envelope.
Return the typed payload.
Expose envelope metadata when needed (event, actorId, organizationId, timestamp, id).

Example API:

const automation = await parseAutomationRequest<UserCreatedPayload>(request);

automation.payload;
automation.event;
automation.actorId;
automation.organizationId;
automation.timestamp;
automation.id;

This replaces duplicated logic currently found in every workflow endpoint.

Phase 2 — Standardize Workflow Endpoints

Refactor every workflow endpoint to consume the standardized envelope.

[MODIFY]

src/app/api/automation/workflows/welcome-email/route.ts

Replace:

const body = await request.json();

const {
  email,
  fullName,
  role,
  orgName
} = body;

with

const automation =
    await parseAutomationRequest<UserCreatedPayload>(request);

const {
    email,
    fullName,
    role,
    orgName
} = automation.payload;

No changes required inside n8n.

[MODIFY]

task-assignment/route.ts

Instead of reading flattened JSON:

const {
    ...
} = body;

Use

automation.payload
[MODIFY]

attendance-reminder/route.ts

Same pattern.

[MODIFY]

weekly-summary/route.ts

Same pattern.

Phase 3 — Remove Duplicate API Key Validation

Each workflow currently contains:

validateApiKey(...)

Remove these duplicated helpers.

Instead:

workflow-request.ts

↓

validate API key

↓

throw Unauthorized

There should only be one implementation.

Phase 4 — Strong Typing

Each workflow should explicitly declare the payload it expects.

Example

parseAutomationRequest<UserCreatedPayload>()

instead of

any

Reuse the payload interfaces already defined in

src/lib/automation/types.ts

No duplicate interfaces.

Phase 5 — Improve Error Messages

Instead of

Missing required fields

Return contextual automation errors.

Example:

{
  "error": "Invalid automation event payload",
  "workflow": "welcome-email",
  "missing": [
    "email",
    "fullName"
  ]
}

This makes debugging inside n8n much easier.

Phase 6 — Update Documentation

Update

docs/automation-guide.md

to establish the official workflow contract.

Every workflow endpoint must expect:

{
  "id": "...",
  "event": "...",
  "timestamp": "...",
  "actorId": "...",
  "organizationId": "...",
  "payload": {
    ...
  }
}

Rule:

n8n must forward the automation event unchanged. Workflow endpoints are responsible for reading body.payload.

Phase 7 — Regression Testing
PowerShell

Run

test-router.ps1

Expected:

user.created
user.invited
task.assigned
task.completed
attendance.clocked_in
attendance.clocked_out
report.generated

all return

{
    "received": true
}
Real Application

Verify from the actual application:

Register user
Invite user
Assign task
Complete task
Clock in
Clock out

Confirm:

Event reaches Master Router
Correct sub-workflow executes
Workflow endpoint returns HTTP 200
Email is delivered (where applicable)
Expected Architecture
Next.js Business Logic
        │
        ▼
createEvent()
        │
        ▼
Gateway (client.ts)
        │
        ▼
n8n Master Router
        │
        ▼
Users / Kanban / Attendance / Reports / Organizations
        │
        ▼
Workflow Endpoint
        │
        ▼
parseAutomationRequest()
        │
        ▼
automation.payload
        │
        ▼
Business Logic
Benefits
✅ Single, consistent automation event contract across the entire system.
✅ No payload reshaping in n8n, making workflows simpler and easier to maintain.
✅ Shared request parsing, API key validation, and error handling reduce duplicated code.
✅ Strong typing using your existing automation payload interfaces.
✅ Easier to add future workflows because every endpoint follows the same pattern.
✅ Aligns your production architecture with an event-driven design where n8n orchestrates events rather than transforming them.