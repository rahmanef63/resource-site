# assistant — agent workspace with streaming chat

Framework-parity agent workspace with streaming chat, a global function-calling
tool registry, and a local library where users manage **agents**, **skills**, and
ordered **automations**. Presets ship as starting points; user changes persist in
localStorage. No model backend or API key is bundled.

## Install

```bash
npx rr add assistant                    # React/Next default
npx rr add assistant --framework sveltekit
```

React keeps the existing shadcn/Lucide workspace and appshell descriptor.
SvelteKit gets native Svelte 5 Chat / Agents / Skills / Automations surfaces over
the same observable store, tool catalog, stream core, and shared agent loop. It
ships no React, Next, shadcn, or `use-agent-tools` runtime.

## Mount

```tsx
import { Assistant } from "@/features/assistant";
<div className="h-dvh"><Assistant /></div>
```

```svelte
<script lang="ts">
  import { Assistant } from "@/features/assistant-svelte";
</script>
<div class="h-dvh"><Assistant /></div>
```

Unwired, both renderers use the same typing demo stream so the whole workspace
remains usable offline.

## Wire one model + all slice tools

Prefer the shared function-calling seam:

```ts
import {
  configureAgentStream,
  registerAssistantTools,
} from "@/features/assistant";

configureAgentStream(myAgentTurn); // SSE, AI SDK, Anthropic SDK, etc.
registerAssistantTools(filesTools, () => filesStore);
registerAssistantTools(browserTools, () => browserState);
```

`runAgentLoop` sees the union of every registered collection through the shared
global registry. The active agent's persona is prepended to the conversation;
tool outcomes stream into the visible reply. Keep RBAC/secrets inside each tool
context/backend — the assistant UI is not an authorization boundary.

`configureAssistantStream(async function* (messages) { ... })` remains as the
back-compatible text-only adapter and funnels into the same model seam.

Throw `Error("no_api_key")` / `Error("unauthorized")` from the model bridge to
get the workspace's friendly error notes.
