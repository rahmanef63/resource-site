# Node Manifest Reference

> **Type definitions**: `workflow/nodes/types.ts`
> **Registry**: `workflow/nodes/registry.ts`

A **node manifest** is the single source of truth for an automation node: its identity, configuration schema, credentials, inspector UI, and execution logic.

---

## Minimal Example

```ts
// workflow/nodes/http/request/manifest.ts
import { Globe } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const httpRequestManifest: NodeManifest = {
  key: 'http.request',
  label: 'HTTP Request',
  category: 'HTTP',
  description: 'Make an HTTP request to any URL',
  icon: Globe,
  n8nType: 'n8n-nodes-base.httpRequest',   // n8n equivalent
  props: {
    method: {
      type: 'select',
      default: 'GET',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      label: 'Method',
    },
    url: {
      type: 'text',
      default: '',
      placeholder: 'https://api.example.com/endpoint',
      required: true,
    },
  },
};
```

---

## Full NodeManifest Interface

```ts
interface NodeManifest {
  // ── Identity ───────────────────────────────────────────────
  key: string;             // Unique key: "category.name" (e.g., "http.request")
  label: string;           // Display name (e.g., "HTTP Request")
  category: NodeCategory;  // "Trigger" | "HTTP" | "Data" | "Logic" | "Integration" | "AI" | "Error"
  description: string;     // One-line help text shown in library + inspector
  icon?: LucideIcon;       // Canvas node icon

  // ── n8n compatibility ──────────────────────────────────────
  n8nType?: string;        // e.g., "n8n-nodes-base.httpRequest"
  n8nTypeVersion?: number; // Defaults to 1

  // ── Props (SSOT for inspector + defaults) ──────────────────
  props?: PropsConfig;     // Record<string, PropDefinition>

  // ── Credentials ───────────────────────────────────────────
  credentials?: CredentialDefinition[];

  // ── Retry defaults ────────────────────────────────────────
  retryDefaults?: { maxRetries: number; waitBetweenTries: number };
  canContinueOnFail?: boolean; // Default true; false for trigger nodes

  // ── Branching ─────────────────────────────────────────────
  outputCount?: number;    // 1 (default), 2 (IF), N (Switch)
  outputLabels?: string[]; // ["true", "false"] for IF nodes

  // ── Rendering (optional) ──────────────────────────────────
  render?: (props: NodeRenderProps) => ReactNode;

  // ── Execution (optional) ──────────────────────────────────
  execute?: NodeExecutor;
  validate?: NodeValidator;

  // ── Legacy (keep for back-compat) ─────────────────────────
  defaults?: Record<string, any>;
  inspector?: InspectorConfig;
}
```

---

## PropDefinition

```ts
interface PropDefinition {
  type: 'text' | 'number' | 'switch' | 'select' | 'textarea' | 'code' | 'color' | 'slider';
  default: any;
  label?: string;          // Auto-generated from key if omitted
  description?: string;    // Help text
  placeholder?: string;
  options?: string[];      // For 'select' type
  hidden?: boolean;        // Hide from inspector
  advanced?: boolean;      // Show in collapsed "Advanced" section
  required?: boolean;      // Surface warning if empty
  min?: number;            // For number/slider
  max?: number;
  step?: number;
}
```

---

## Categories

| Category | Color | Examples |
|----------|-------|---------|
| `Trigger` | green | webhook, schedule, manual, event |
| `HTTP` | blue | request, respond |
| `Data` | cyan | set, code, expression |
| `Logic` | yellow | if, switch, loop, wait |
| `Integration` | orange | slack, email, database |
| `AI` | pink | openai, claude |
| `Error` | red | tryCatch, retry |

---

## Credentials

```ts
credentials: [
  {
    type: 'httpBasicAuth',       // Key in credential store
    displayName: 'HTTP Basic Auth',
    required: false,
  },
  {
    type: 'oAuth2Api',
    displayName: 'OAuth 2.0',
    required: true,
  },
]
```

---

## IF / Branching Nodes

For nodes with multiple outputs (true/false branches):

```ts
outputCount: 2,
outputLabels: ['true', 'false'],
```

The `sourceHandle` on edges maps to the output index (0=true, 1=false).

---

## Adding a New Node — Checklist

1. **Create manifest file**: `workflow/nodes/{category}/{name}/manifest.ts`
   ```ts
   export const myNodeManifest: NodeManifest = { key: 'cat.name', ... };
   ```

2. **Export from category index**: `workflow/nodes/{category}/index.ts`
   ```ts
   export { myNodeManifest } from './{name}/manifest';
   ```

3. **Register in registry**: `workflow/nodes/registry.ts`
   ```ts
   import { myNodeManifest } from './mycat';
   export const allNodeManifests = [
     ...existingManifests,
     myNodeManifest,
   ];
   ```

4. **Add n8n mapping** (if applicable):
   ```ts
   // In workflow/schema/n8n.types.ts
   'cat.name': 'n8n-nodes-base.someName',
   ```

5. **TypeScript check**: `pnpm exec tsc --noEmit | grep "studio"`

---

## Expression Syntax

Node props support n8n-style expressions referencing previous node outputs:

```
{{ $node['Node Name'].parameters.someField }}
{{ $node['Webhook'].parameters.body.email }}
{{ $vars.myVariable }}
{{ $execution.id }}
```

Expressions are evaluated at runtime by the flow execution engine. Static values (no `{{ }}`) are passed as-is.

---

## Execution (optional)

If no `execute` function is provided, the node is executed by the shared flow engine's default executor (logs the node + passes data through). For real HTTP calls etc., provide `execute`:

```ts
execute: async ({ node, context, previousOutput }) => {
  const { method, url } = node.data.props;
  const response = await fetch(url, { method });
  const data = await response.json();
  return { output: data };
}
```

---

## Validation (optional)

```ts
validate: (node, flow) => {
  const errors: string[] = [];
  if (!node.data.props.url) errors.push('URL is required');
  return { valid: errors.length === 0, errors };
}
```

Validation runs before execution and surfaces errors in the inspector and execution panel.
