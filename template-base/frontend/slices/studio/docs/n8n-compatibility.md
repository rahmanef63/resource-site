# n8n Compatibility Guide

> **Converter**: `workflow/schema/n8n-converter.ts`
> **Types**: `workflow/schema/n8n.types.ts`

Studio workflows can be exported to n8n format and imported from n8n exports — no manual conversion needed.

---

## Quick Start

### Export Studio → n8n

In Studio header toolbar: click the **`n8n`** button (next to the Download ↓ button).

Or programmatically:
```ts
import { toN8nWorkflow, legacyFlowToStudioFlow } from './workflow/schema/n8n-converter';

const studioFlow = legacyFlowToStudioFlow(flowDefinition);
const n8nJson = toN8nWorkflow(studioFlow);
// → paste into n8n "Import from JSON" dialog
```

### Import n8n → Studio

In Studio header: click **Upload ↑**, paste or select an n8n workflow JSON file.
The importer auto-detects n8n format (looks for `connections` + `nodes` array).

Or programmatically:
```ts
import { fromN8nWorkflow } from './workflow/schema/n8n-converter';

const studioDoc = fromN8nWorkflow(n8nWorkflowJson);
// studioDoc.flow.nodes, studioDoc.flow.edges → load into canvas
```

---

## Node Type Mapping

| Studio Type | n8n Node Type | Notes |
|-------------|---------------|-------|
| `trigger.manual` | `n8n-nodes-base.manualTrigger` | |
| `trigger.webhook` | `n8n-nodes-base.webhook` | |
| `trigger.schedule` | `n8n-nodes-base.scheduleTrigger` | |
| `trigger.event` | `n8n-nodes-base.n8nTrigger` | |
| `http.request` | `n8n-nodes-base.httpRequest` | |
| `http.respond` | `n8n-nodes-base.respondToWebhook` | |
| `data.set` | `n8n-nodes-base.set` | |
| `data.code` | `n8n-nodes-base.code` | |
| `data.expression` | `n8n-nodes-base.function` | Legacy n8n |
| `flow.if` | `n8n-nodes-base.if` | 2 outputs: true/false |
| `flow.switch` | `n8n-nodes-base.switch` | N outputs |
| `flow.loop` | `n8n-nodes-base.splitInBatches` | |
| `flow.wait` | `n8n-nodes-base.wait` | |
| `ai.openai` | `@n8n/n8n-nodes-langchain.openAi` | |
| `ai.claude` | `@n8n/n8n-nodes-langchain.anthropic` | |
| `integrations.slack` | `n8n-nodes-base.slack` | |
| `integrations.email` | `n8n-nodes-base.emailSend` | |
| `integrations.database` | `n8n-nodes-base.postgres` | Approximation |
| `error.tryCatch` | `n8n-nodes-base.errorTrigger` | Approximation |
| `error.retry` | `n8n-nodes-base.executeWorkflow` | Approximation |

Unknown n8n types not in the map are imported with their original type key prefixed as-is (no conversion loss — they round-trip correctly via `n8nType` field).

---

## Field Mapping Table

| Studio field | n8n field | Notes |
|-------------|-----------|-------|
| `node.id` | `node.id` | Preserved |
| `node.name` | `node.name` | Canvas label |
| `node.type` | — | Mapped via table above |
| `node.n8nType` | `node.type` | n8n's type field |
| `node.position` | `node.position` | `{x,y}` ↔ `[x,y]` tuple |
| `node.parameters` | `node.parameters` | Props/config — direct passthrough |
| `node.credentials` | `node.credentials` | `{type, id, name}` ↔ `{id, name}` |
| `node.settings.disabled` | `node.disabled` | |
| `node.settings.continueOnFail` | `node.settings.continueOnFail` | |
| `node.settings.retry.maxRetries` | `node.settings.retry.maxTries` | Name difference |
| `node.settings.notes` | `node.notes` | |
| `node.settings.notesInFlow` | `node.notesInFlow` | |
| `edge.source → edge.target` | `connections[sourceName].main[i][j]` | ID-based ↔ Name-based |
| `edge.sourceHandle` | connection output index | 0=main, 1=else |

---

## Connection Format Differences

**Studio** uses edge objects (React Flow compatible):
```json
{ "id": "e1", "source": "node-id-1", "target": "node-id-2", "sourceHandle": 0 }
```

**n8n** uses a name-keyed connection map:
```json
{
  "Webhook Trigger": {
    "main": [
      [{ "node": "HTTP Request", "type": "main", "index": 0 }],
      []
    ]
  }
}
```

The converter handles this automatically. The outer array index = `sourceHandle` (0=main/true, 1=else/false for IF nodes).

---

## Limitations / Known Gaps

| Feature | Status | Notes |
|---------|--------|-------|
| Credentials by reference | ⚠️ Partial | IDs preserved but no credential store yet |
| Sub-workflow calls | ❌ Not supported | Planned in Phase 3 |
| Batch/splitInBatches | ⚠️ Basic | No batch-size inspector field |
| `pinData` (test data) | ❌ Ignored on import | n8n-specific |
| Expression syntax `{{ }}` | ✅ Pass-through | Strings preserved as-is |
| Webhook registration | ❌ Not real | Planned (Convex HTTP actions) |
| Schedule trigger (cron) | ❌ Not real | Planned (Convex cron) |
| n8n `onError` routing | ⚠️ Mapped to `continueOnFail` | Approximation |

---

## n8n Workflow JSON Structure (Reference)

```jsonc
{
  "id": "workflow-uuid",
  "name": "My Workflow",
  "active": false,
  "nodes": [
    {
      "id": "node-uuid",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 200],      // [x, y] tuple — different from Studio's {x,y}
      "parameters": {
        "path": "/webhook/test",
        "httpMethod": "POST"
      },
      "disabled": false,
      "settings": {
        "continueOnFail": false
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [{ "node": "HTTP Request", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "timezone": "UTC"
  },
  "tags": []
}
```

---

## Adding n8n Mapping to a New Node Manifest

When creating a new node manifest, add `n8nType` and `n8nTypeVersion`:

```ts
// workflow/nodes/mycat/mynode/manifest.ts
export const myNodeManifest: NodeManifest = {
  key: 'mycat.mynode',
  label: 'My Node',
  category: 'Integration',
  description: 'Does something useful',
  n8nType: 'n8n-nodes-base.someNode',    // ← add this
  n8nTypeVersion: 1,                       // ← optional, defaults to 1
  props: {
    // ...
  },
};
```

If no direct n8n equivalent exists, omit `n8nType` — the converter will use `superspace.mycat.mynode` as the type string (round-trips correctly through Studio but not importable into real n8n).
