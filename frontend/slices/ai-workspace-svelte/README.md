# ai-workspace — Svelte 5 / SvelteKit

Native Svelte distribution for the canonical AI Workspace variants.

```bash
npx rr add ai-workspace chat --framework sveltekit
npx rr add ai-workspace studio --framework sveltekit
npx rr add ai-workspace agents --framework sveltekit
# omit the variant to install all three
```

- **chat** shares the same chat message/history core and function-calling bridge; only this variant pulls `convex/features/aiChat`, AI SDK/provider packages, and model-key environment declarations.
- **studio** keeps the current local scaffold/variation/version-tree behavior and exports the same agentic `aiStudioTools` seam.
- **agents** keeps the task queue/run-trace scaffold and exports the same `createAgentRunner(host)` function-calling runner.

Svelte carries no React/Next/shadcn/Lucide renderer runtime. Model keys and real tool authorization stay in the host/backend.
