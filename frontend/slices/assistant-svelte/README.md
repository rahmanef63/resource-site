# Assistant — Svelte 5 / SvelteKit

Native Svelte workspace for the same portable Assistant contract as React:
streaming chat, global tool calling, agents, skills, and ordered automations.

```svelte
<script lang="ts">
  import { Assistant, configureAgentStream } from "@/features/assistant-svelte";
</script>

<Assistant />
```

- Agents/skills/automations persist in localStorage over the shared observable store core.
- Chat uses the exact shared agent loop + global tool registry. Wire one model with `configureAgentStream`; unwired mode retains the typing demo.
- Tool collections are registered through `registerAssistantTools`, identical to React.
- Svelte carries no React, Next, shadcn, or `use-agent-tools`; only non-React agentic core files are installed.
