Nexus Automation Roadmap (Implementation Plan)
Goal

Transform Nexus into an event-driven OJT management platform by integrating n8n without rewriting the existing application.

The current application already performs all business logic.

n8n should become an automation layer that reacts to events emitted by the CMS.

Each phase builds upon the previous one, ensuring a scalable architecture where adding future automations requires minimal code changes.

Phase 1 — Automation Foundation

Objective

Create the infrastructure that every future automation will use.

This phase should contain zero business-specific workflows.

New Components
src/
├── lib/
│   ├── automation/
│   │      client.ts
│   │      events.ts
│   │      registry.ts
│   │      types.ts
│   │      logger.ts
│   │      retry.ts
│   │
│   └── config/
│          automation.ts

app/
└── api/
      internal/
            automation/
                  route.ts
Automation Gateway

Instead of this:

Attendance

↓

Webhook

↓

n8n

everything goes through

Attendance

↓

Automation Gateway

↓

n8n

Responsibilities:

API authentication
Payload validation
Retry failed requests
Logging
Event serialization
Versioning
Event Definitions

Introduce typed events.

Example

user.created

attendance.clocked_in

attendance.clocked_out

task.created

task.assigned

task.completed

report.generated

Every event has

id

event

timestamp

organizationId

actorId

payload
Environment Variables
N8N_URL=

N8N_API_KEY=

AUTOMATION_ENABLED=true

AUTOMATION_TIMEOUT=10000

AUTOMATION_RETRIES=3
Deliverables

✔ Automation Gateway

✔ Event interfaces

✔ Event logger

✔ Retry utility

✔ Central automation client

Phase 2 — Event-Driven Refactor

Now the application starts emitting events.

Nothing changes for the user.

Instead of

Create Task

becoming

Database

↓

Done

it becomes

Create Task

↓

Database

↓

Emit Event

↓

Automation Gateway
Initial Events
Authentication
user.created

user.invited

user.deleted
Attendance
attendance.clocked_in

attendance.clocked_out

attendance.updated
Kanban
task.created

task.assigned

task.completed

task.deleted
Reports
report.generated
Organization
organization.created
Deliverables

All important business actions emit domain events.

No automation yet.

Phase 3 — n8n Infrastructure

Deploy n8n.

Recommended

Vercel

↓

Next.js

↓

Automation Gateway

↓

Railway

↓

n8n

or

Coolify

↓

n8n
Create Generic Webhook

One webhook only.

/webhook/events

Every event passes through it.

n8n decides what workflow to execute.

Example

attendance.clocked_in

↓

Switch Node

↓

Attendance Workflow

instead of having 20 webhook URLs.

Deliverables

✔ n8n deployed

✔ Generic Event Webhook

✔ Secure API key

✔ Logging

Phase 4 — Core Business Automations

Now automation finally begins.

Workflow 1
Welcome Email

Trigger

user.created

Actions

Send Welcome Email

↓

Log Event
Workflow 2
Task Assignment

Trigger

task.assigned

Actions

Send Email

↓

Log Notification
Workflow 3
Attendance Reminder

Cron

Every weekday

8:15 AM

Workflow

Find users
without clock-in

↓

Email Reminder

↓

Log Reminder
Workflow 4
Weekly Supervisor Summary

Every Friday

Workflow

Attendance Summary

↓

Pending Tasks

↓

Hours Rendered

↓

Generate HTML

↓

Email Supervisor
Deliverables

4 production workflows

Phase 5 — Monitoring

Now make automations observable.

Database
automation_logs

Example

id	event	workflow	status
1	task.assigned	Task Email	Success

Store

request
response
execution time
retries
workflow id
CMS Dashboard
Automation

✓ Welcome Email

✓ Attendance Reminder

✓ Weekly Summary

with

duration
retries
failures
Deliverables

Automation Dashboard

Execution History

Retry Viewer

Phase 6 — Approval Workflow

Now implement one advanced automation.

Example

Attendance Correction

Student

↓

Submit Request

↓

Event

↓

n8n

↓

Supervisor Email

↓

Approve

↓

Update Database

↓

Notify Student

Same architecture can later power

Leave Requests
Overtime
Document Approval
Internship Extension
Deliverables

Multi-step Approval Workflow

Phase 7 — Extensibility

Now your architecture is complete.

Adding future automations should require:

Add Event

inventory.low

Create Workflow

Done.

No core application changes.

Possible future automations

Google Calendar
Discord
Slack
Telegram
Microsoft Teams
Google Sheets
HRIS
Airtable
Notion
CRM integrations
Final Architecture
                    Users
                      │
                      ▼
             Next.js (nexxus.lol)
                      │
                 Business Logic
                      │
              Domain Events
                      │
                      ▼
          Automation Gateway (API)
                      │
          Authentication • Retry • Logs
                      │
                      ▼
                    n8n
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
   Email        Scheduled Jobs    Notifications
 (Resend)         (Cron)        (Discord/Slack)
                      │
                      ▼
              Automation Logs
                      │
                      ▼
            Nexus Admin Dashboard
Why this phased approach works

The dependency chain is intentional:

Phase 1 builds reusable infrastructure that every automation uses.
Phase 2 teaches your application to emit events without changing user-facing behavior.
Phase 3 connects those events to n8n through a single, secure entry point.
Phase 4 adds your first business automations with almost no changes to the core application.
Phase 5 adds monitoring and visibility, which is important for production systems.
Phase 6 demonstrates more advanced orchestration with approval workflows.
Phase 7 leaves you with an architecture where future integrations are mostly configuration and new workflows rather than application rewrites.