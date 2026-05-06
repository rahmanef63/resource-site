# Studio Unified JSON Schema v1.0

> **Source of truth**: `workflow/schema/studio-unified.types.ts`
> Compatible with: n8n workflow JSON (bidirectional via `n8n-converter.ts`)

---

## Overview

Studio uses a **single unified JSON format** for all projects:

| Kind | `flow` section | `ui` section | Use case |
|------|---------------|-------------|---------|
| `"workflow"` | ✅ Required | — | Automation-only project |
| `"ui-layout"` | — | ✅ Required | UI page / dashboard layout |
| `"unified"` | ✅ Required | ✅ Required | Full Studio project |

---

## Top-Level Structure

```jsonc
{
  "$schema": "https://superspace.app/schemas/studio/v1.0",
  "studioVersion": "1.0",
  "kind": "workflow",          // "workflow" | "ui-layout" | "unified"
  "metadata": { ... },         // Project metadata (shared)
  "flow": { ... },             // Automation flow (required for "workflow"/"unified")
  "ui": { ... }                // UI layout (required for "ui-layout"/"unified")
}
```

---

## `metadata` Object

Consistent across all kinds. Maps directly to `StudioProjectMetadata`.

```jsonc
{
  "metadata": {
    "id": "a1b2c3d4-e5f6-...",          // UUID — stable across exports
    "name": "My Automation",
    "description": "Syncs CRM + Slack",
    "author": "Jane Doe",
    "tags": ["crm", "slack", "nightly"],
    "version": "1.0.0",                  // SemVer
    "createdAt": "2026-03-14T10:00:00Z", // ISO 8601
    "updatedAt": "2026-03-14T12:00:00Z",
    "workspaceId": "ws_abc123",
    "isTemplate": false,
    "$schema": "https://superspace.app/schemas/studio/v1.0"
  }
}
```

---

## `flow` Object (workflow section)

```jsonc
{
  "flow": {
    "version": "1.0",
    "nodes": [ /* StudioFlowNode[] */ ],
    "edges": [ /* StudioFlowEdge[] */ ],
    "settings": {
      "executionOrder": "v1",  // "v0" | "v1" (v1 recommended)
      "timezone": "UTC",
      "maxConcurrency": 0,     // 0 = unlimited
      "saveHistory": true,
      "errorWorkflowId": ""    // ID of error-handling workflow
    }
  }
}
```

### `StudioFlowNode`

```jsonc
{
  "id": "node-uuid",
  "name": "Webhook Trigger",            // Canvas display name
  "type": "trigger.webhook",            // Studio node type key
  "n8nType": "n8n-nodes-base.webhook",  // n8n equivalent (auto-set by converter)
  "position": { "x": 100, "y": 200 },
  "parameters": {                        // Node configuration (was "props" in legacy)
    "path": "/webhook/my-flow",
    "method": "POST",
    "responseMode": "onReceived",
    "authType": "none"
  },
  "credentials": {
    "httpBasicAuth": {
      "id": "cred-123",
      "type": "httpBasicAuth",
      "name": "My API Credentials"
    }
  },
  "settings": {
    "disabled": false,
    "continueOnFail": false,
    "alwaysOutputData": false,
    "retry": {
      "maxRetries": 3,
      "waitBetweenTries": 1000,          // ms
      "backoffMultiplier": 2             // exponential backoff
    },
    "timeout": 30000,                    // ms, 0 = no timeout
    "notes": "Entry point for CRM sync",
    "notesInFlow": true,
    "color": "#6366f1"                   // Accent color on canvas
  },
  "category": "Trigger",                // Visual only — from manifest
  "feature": "crm"                      // Feature slug (for feature nodes)
}
```

### `StudioFlowEdge`

```jsonc
{
  "id": "edge-uuid",
  "source": "node-uuid-1",
  "target": "node-uuid-2",
  "sourceHandle": 0,   // 0 = main/true output, 1 = else/false output (IF nodes)
  "targetHandle": 0,   // Input index on target
  "label": "On Success",
  "condition": "{{ $node.prev.data.status === 200 }}",
  "order": 0           // Ordering within parallel branches
}
```

---

## `ui` Object (UI layout section)

Backwards-compatible with v0.4. Version `"0.5"` adds optional `metadata`.

```jsonc
{
  "ui": {
    "version": "0.5",
    "root": ["page-root"],
    "nodes": {
      "page-root": {
        "type": "div",
        "props": {
          "tag": "section",
          "path": "/dashboard",
          "display": "flex",
          "flexDirection": "col",
          "gap": "6",
          "padding": "6"
        },
        "children": ["header-node", "content-node"]
      },
      "header-node": {
        "type": "text",
        "props": {
          "tag": "h1",
          "content": "Dashboard",
          "fontSize": "2xl",
          "fontWeight": "bold",
          "color": "#1a1a2e"
        },
        "children": []
      }
    }
  }
}
```

See `public/docs/studio-json-template.md` for the full list of 54+ widget types and their props.

---

## Full Unified Example

```json
{
  "$schema": "https://superspace.app/schemas/studio/v1.0",
  "studioVersion": "1.0",
  "kind": "unified",
  "metadata": {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "name": "CRM Onboarding Automation",
    "description": "Webhook → enrich → Slack + update CRM page",
    "author": "Studio AI",
    "tags": ["crm", "onboarding", "slack"],
    "version": "1.0.0",
    "createdAt": "2026-03-14T10:00:00Z",
    "updatedAt": "2026-03-14T12:00:00Z"
  },
  "flow": {
    "version": "1.0",
    "nodes": [
      {
        "id": "n1",
        "name": "New Lead Webhook",
        "type": "trigger.webhook",
        "n8nType": "n8n-nodes-base.webhook",
        "position": { "x": 100, "y": 100 },
        "parameters": { "path": "/webhook/new-lead", "method": "POST" }
      },
      {
        "id": "n2",
        "name": "Enrich Lead Data",
        "type": "http.request",
        "n8nType": "n8n-nodes-base.httpRequest",
        "position": { "x": 350, "y": 100 },
        "parameters": {
          "method": "GET",
          "url": "https://api.clearbit.com/v2/people/find?email={{ $node.n1.parameters.email }}"
        },
        "settings": { "continueOnFail": true }
      },
      {
        "id": "n3",
        "name": "Notify Slack",
        "type": "integrations.slack",
        "n8nType": "n8n-nodes-base.slack",
        "position": { "x": 600, "y": 100 },
        "parameters": {
          "channel": "#new-leads",
          "message": "New lead: {{ $node.n1.parameters.email }}"
        },
        "credentials": {
          "slackApi": { "id": "cred-slack-001", "type": "slackApi", "name": "Slack Workspace" }
        }
      }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2" },
      { "id": "e2", "source": "n2", "target": "n3" }
    ],
    "settings": { "executionOrder": "v1", "timezone": "UTC" }
  },
  "ui": {
    "version": "0.5",
    "root": ["page-root"],
    "nodes": {
      "page-root": {
        "type": "div",
        "props": { "display": "flex", "flexDirection": "col", "gap": "4", "padding": "6" },
        "children": ["title", "lead-table"]
      },
      "title": {
        "type": "text",
        "props": { "tag": "h1", "content": "CRM Onboarding", "fontSize": "2xl", "fontWeight": "bold" },
        "children": []
      },
      "lead-table": {
        "type": "tableBlock",
        "props": { "feature": "crm", "view": "table" },
        "children": []
      }
    }
  }
}
```

---

## Export Envelope

When downloaded as a file via Studio:

```jsonc
{
  "document": { /* StudioDocument */ },
  "exportedAt": "2026-03-14T12:34:56Z",
  "exporter": {
    "name": "SuperSpace Studio",
    "version": "1.0.0"
  }
}
```

---

## Migration from v0.4

v0.4 UI schemas are still valid. To upgrade:

1. Wrap in a `StudioDocument` with `kind: "ui-layout"`
2. Move your existing `{ version, root, nodes }` into the `ui` field
3. Set `ui.version = "0.5"`
4. Add `metadata` block

```jsonc
// Before (v0.4)
{ "version": "0.4", "root": [...], "nodes": {...} }

// After (v0.5 inside StudioDocument)
{
  "$schema": "https://superspace.app/schemas/studio/v1.0",
  "studioVersion": "1.0",
  "kind": "ui-layout",
  "metadata": { "name": "My Layout", "createdAt": "..." },
  "ui": { "version": "0.5", "root": [...], "nodes": {...} }
}
```
