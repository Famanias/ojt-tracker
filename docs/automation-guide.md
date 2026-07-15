# Nexus Automation — Extensibility Guide

This playbook outlines how to extend the automation layer by adding new events, configuring the n8n router, and adding future integrations like Slack or Google Calendar. 

The core infrastructure (Gateway, DB Logger, Dead Letter Queue) is already built. You should **never** need to modify those core files (`client.ts`, `logger-db.ts`, `retry.ts`) just to add a new workflow.

---

## 1. Adding a New Event End-to-End

When a new business requirement demands an automation (e.g., "Email the student when their attendance is corrected"), follow this 7-step checklist:

1. **Add to Types**: Open `src/lib/automation/types.ts` and add the new event name (e.g., `attendance.correction.resolved`) to the `AutomationEventName` union. Add its payload interface (e.g., `AttendanceCorrectionResolvedPayload`).
2. **Register Event**: Open `src/lib/automation/registry.ts` and add the event to `EVENT_REGISTRY`. This ensures the Gateway accepts it and it shows up in documentation/validation.
3. **Emit Event**: Find the relevant Next.js API route or client component where the action occurs.
   - Server-side: `import { emitEvent } from '@/lib/automation';` and call it.
   - Client-side: `import { emitClientEvent } from '@/lib/automation/client-emitter';` and call it.
4. **Update n8n Router**: In n8n, open the "Nexus — Master Router" workflow. Add a new branch to the `Switch` node that matches your new event name (e.g., `attendance.correction.resolved`).
5. **Build Workflow Endpoint (if needed)**: If the automation requires sending a Nexus-branded email, create a new endpoint under `src/app/api/automation/workflows/`. Follow the exact pattern of `welcome-email/route.ts` (validate `X-Automation-Key`, use Resend, return JSON).
6. **Group in Router**: Attach an HTTP Request node (pointing to your new endpoint) to the new Switch branch. Group it logically (see Section 2).
7. **Test in Isolation**: Use `curl` or Postman to test your new Next.js workflow endpoint *before* triggering it via n8n. Then trigger the full flow via the app.

---

## 2. The Official Workflow Contract

When building Next.js workflow endpoints (Step 5 above), you must expect the standardized automation envelope. **n8n must forward the automation event exactly as received.**

Every endpoint must expect this JSON structure:

```json
{
  "id": "uuid",
  "event": "task.completed",
  "timestamp": "2026-07-15T00:00:00Z",
  "actorId": "user-uuid",
  "organizationId": "org-uuid",
  "payload": {
    // The specific data for the event
  }
}
```

**Rule:** Do NOT use n8n to reshape payloads for Next.js endpoints. Let Next.js handle parsing by wrapping your Next.js route with `parseAutomationRequest` from `@/lib/automation/workflow-request`, which will automatically extract the `payload` and validate the `X-Automation-Key`.

---

## 3. Router Grouping Conventions

As you add events, the master `Switch` node in n8n will grow. To keep the canvas readable:

- **Do not** build massive 20-node chains directly off the Master Switch.
- **Do** use **Execute Workflow** nodes to group related operations.

### Suggested Groups:
- **Users Sub-workflow**: Handles `user.created`, `user.deleted`, `user.invited`.
- **Attendance Sub-workflow**: Handles `attendance.clocked_in`, `attendance.clocked_out`.
- **Kanban Sub-workflow**: Handles `task.created`, `task.assigned`, `task.completed`.

When `task.completed` is emitted, the Master Switch routes it to the Kanban Sub-workflow, which then has its own logic (e.g., "If task priority is high, notify supervisor").

---

## 3. Future Integrations (Slack, Discord, GCal)

The beauty of n8n is that you don't need to build Next.js endpoints for everything.

If the requirement is: *"Send a Discord message when a high-priority task is created"*

**How to build it:**
1. Next.js already emits `task.created`. You don't need to touch the Next.js codebase.
2. Go to n8n → Master Router → Kanban Sub-workflow.
3. On the `task.created` branch, add an `If` node checking `{{$json.payload.priority === 'high'}}`.
4. If true, add a **Discord Node** (native to n8n). Map the task title and assignee to the Discord message fields.

**Rule of Thumb:**
- If the automation needs to read/write the Nexus Database, or send a Nexus-branded React Email → **Build a Next.js `/workflows/*` endpoint.**
- If the automation just sends data to an external tool (Slack, Google Sheets, Airtable, CRM) → **Use n8n native nodes. No Next.js code required.**

---

## 4. Troubleshooting Dead Letters

If an event completely fails after all retries (e.g., n8n is down), it is moved to the **Dead Letter Queue**.

1. Go to **Dashboard → Automation → ⚠ Failed Events**.
2. Inspect the payload to understand what data was lost.
3. Fix the underlying issue (e.g., restart n8n, fix the webhook URL).
4. Click **Retry** on the dead letter. The Gateway will inject it back into the flow as if it just happened, preserving the original payload.
