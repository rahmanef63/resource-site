# BYOK binding — wiring rr's tool collections to YOUR model key

rr is a features library: it never holds a model key. For every slice it ships
exactly two artifacts —

1. **a custom instruction** — `registry.systemPrompt()` composes
   `BASE_AGENT_SYSTEM` (`lib/shared/agentic/prompt.ts`) with each registered
   collection's `instructions`;
2. **a function list** — `registry.anthropicTools()`.

You (the consumer) own the third piece: the model transport that carries your
`ANTHROPIC_API_KEY`. This doc is the complete copy-paste binding. Reference
implementation in rr itself: `app/api/agent-stream/route.ts` (server) +
`components/agent-bridge.tsx` (client mount).

## 1. Server route — the only file that ever sees your key

Copy `app/api/agent-stream/route.ts` into your app. It is a ONE-turn streaming
proxy: the agent loop runs client-side (tools bind to live React state), so
the route only translates one `AgentMsg[]` history → one Anthropic call,
streams text deltas as SSE, and ends with a `turn` event `{text, toolUses,
stopReason}`. It accepts `{ messages, tools, system }` — `system` is where
your composed custom instruction arrives. Keep its guards: keyless-friendly
fallback, per-IP rate limit, body-size cap.

```bash
# .env.local (server only — never NEXT_PUBLIC_*)
ANTHROPIC_API_KEY=sk-ant-...
```

## 2. Client bridge — configure the seam once

```tsx
"use client";
import { useEffect } from "react";
import {
  configureAgentStream,
  isAgentStreamConfigured,
  createSseAgentStream,
  globalToolRegistry,
} from "@/shared/agentic";

export function AgentBridge() {
  useEffect(() => {
    if (!isAgentStreamConfigured()) {
      configureAgentStream(
        // 2nd arg = the BYOK custom instruction, evaluated per call so it
        // reflects whatever collections are registered by then.
        createSseAgentStream("/api/agent-stream", () =>
          globalToolRegistry().systemPrompt(),
        ),
      );
    }
  }, []);
  return null;
}
```

Mount it once in the layout that hosts agent-driven slices.

## 3. Register collections

Each agentic slice exports a `ToolCollection` (see its `agent.md` → "Tools").
Mount-time self-registration:

```tsx
import { useAgentTools } from "@/shared/agentic";
import { cartTools } from "@/features/cart";

function CartPanel() {
  const cart = useCart();
  useAgentTools(cartTools, cart); // re-registering rebinds ctx, remount-safe
  // ...
}
```

One agent then drives every registered slice: `globalToolRegistry()` is the
aggregator (`anthropicTools()`, `invoke()`, `systemPrompt()`).

## 4. Run the loop (with the safety seam)

```ts
import { runAgentLoop, globalToolRegistry } from "@/shared/agentic";

const { history: next, text } = await runAgentLoop(history, globalToolRegistry(), {
  onDelta: (chunk) => append(chunk),
  onTool: (name, input, outcome) => log(name, outcome),
  // Tools flagged `dangerous: true` (⚠ in each slice's agent.md) reach this
  // BEFORE executing; return false → the model gets a "denied" tool_result.
  confirm: async (name, input) => window.confirm(`Allow ${name}?`),
});
```

No `confirm` handler = unguarded (back-compat) — wire it in anything
user-facing. For RBAC defense-in-depth wrap tools with
`requirePerm(perm, tool)` (`lib/shared/agentic/gated.ts`); the PRIMARY
permission gate still belongs in your binding/backend, not the tool layer.

## Notes

- The loop is client-side BY DESIGN: collection ctx binds to live React state
  (hooks, stores). For a pure server-side agent, build a registry with
  `createToolRegistry()` over server ctx objects and call your model directly —
  same `systemPrompt()` + `anthropicTools()` artifacts apply.
- rr's own deploy mounts `AgentBridge` only as a preview demo; nothing a
  consumer copies depends on rr's key or infrastructure.
- Model choice lives in YOUR route (`RR_AGENT_MODEL` in the reference route).
