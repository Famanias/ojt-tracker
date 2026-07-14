Your application expects this flow:

Nexus (Vercel)
      │
      ▼
emitEvent()
      │
      ▼
Automation Gateway
      │
POST /webhook/events
      │
      ▼
        n8n
      │
      ▼
Switch (event)
      │
      ├──────────────┐
      ▼              ▼
HTTP Request   HTTP Request
      │              │
      ▼              ▼
Next.js Workflow Routes
      │
      ▼
Resend

So your goal is simply to configure n8n to receive events and route them.

Step 1 — Install n8n Locally

For now, don't worry about VPS deployment.

The easiest option is Docker Desktop.

If you don't have Docker Desktop:

Install Docker Desktop.
Ensure WSL2 is enabled.
Verify:
docker --version
docker compose version
Step 2 — Run n8n

Create a folder.

Example:

D:\repos\n8n

Create

docker-compose.yml
services:
  n8n:
    image: n8nio/n8n:latest

    ports:
      - "5678:5678"

    restart: unless-stopped

    environment:
      - TZ=Asia/Manila
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http

    volumes:
      - ./n8n_data:/home/node/.n8n

Run

docker compose up -d

Open

http://localhost:5678

Create your administrator account.

Done.

Step 3 — Create the Main Workflow

Click

New Workflow

Rename it

Nexus Event Dispatcher

Everything in your application sends events to this workflow.

Step 4 — Create the Webhook Trigger

Add a

Webhook

node.

Configure:

Setting	Value
HTTP Method	POST
Path	events

The resulting endpoint becomes

http://localhost:5678/webhook/events

This matches your existing Automation Gateway.

Step 5 — Test Mode

Click

Listen for Test Event

Leave it waiting.

Step 6 — Configure Nexus

Your implementation expects:

N8N_URL=http://localhost:5678

N8N_API_KEY=my-secret-key

AUTOMATION_ENABLED=true

AUTOMATION_TIMEOUT=10000

AUTOMATION_RETRIES=3

Restart Next.js.

Now every

emitEvent(...)

will attempt to contact n8n.

Step 7 — Secure the Webhook

Your gateway already sends

X-Automation-Key

After the Webhook node, add an IF node.

Condition:

Header

↓

X-Automation-Key

equals

my-secret-key

If false

↓

Respond with

401 Unauthorized

If true

↓

Continue.

Step 8 — Inspect the Event

Add a

Code

node.

Inside:

return [{
    json: $json
}]

Execute.

When you perform

Create User
Clock In
Export CSV

You should receive something similar to

{
  "id": "...",
  "event": "attendance.clocked_in",
  "timestamp": "...",
  "organizationId": "...",
  "actorId": "...",
  "payload": {
    ...
  }
}

If you see this, your Automation Gateway is working correctly.

Step 9 — Build the Event Router

Delete the Code node.

Replace it with a Switch node.

Switch on

event

Cases:

user.created

organization.created

user.invited

attendance.clocked_in

attendance.clocked_out

task.created

task.assigned

task.deleted

report.generated

Your workflow should now resemble:

Webhook
      │
      ▼
Authentication
      │
      ▼
Switch(event)
      │
 ├───────────────┐
 ▼               ▼
user.created   task.created

This becomes the central dispatcher for all automation events.

Step 10 — Connect Your Existing Workflow Endpoints

For each branch, add an HTTP Request node.

Example:

user.created

↓

HTTP Request

Configure:

Method

POST

URL

http://localhost:3000/api/automation/workflows/welcome-email

Headers

X-Automation-Key

my-secret-key

Body

{{$json}}

Repeat for the remaining events:

Event	Workflow Endpoint
user.created	/api/automation/workflows/welcome-email
task.assigned	/api/automation/workflows/task-assignment
attendance.clocked_in (or scheduled reminder)	/api/automation/workflows/attendance-reminder
report.generated (or scheduled summary)	/api/automation/workflows/weekly-summary

Because you've already written the email templates and workflow handlers in Next.js, n8n doesn't need to know how to send emails—it only decides when to invoke them.

Step 11 — Activate the Workflow

Click Activate in the upper-right corner.

From now on, every call to emitEvent() from your application will be sent to n8n automatically.

Step 12 — Verify Everything

Run through these checks:

Test	Expected Result
GET /api/internal/automation	Reports automation enabled
Create a user	user.created appears in n8n Executions
Clock in	attendance.clocked_in appears
Create a task	task.created appears
Assign a task	task.assigned appears
Export a report	report.generated appears
HTTP Request nodes	Successfully call your workflow endpoints
Resend	Email is delivered (where applicable)
Don't build all the automations yet

At this stage, focus on proving that the pipeline works:

Nexus
    ↓
emitEvent()
    ↓
Automation Gateway
    ↓
n8n Webhook
    ↓
Switch(event)
    ↓
HTTP Request
    ↓
Next.js Workflow Endpoint

Once you've confirmed that events flow through this pipeline successfully, adding new automations—Slack notifications, Discord alerts, CRM updates, Google Calendar events, AI processing, and more—is simply a matter of adding new branches or nodes in n8n without changing your application's core architecture.