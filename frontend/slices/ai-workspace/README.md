# AI Workspace

Three AI surfaces behind one slug, as shadcn-style variants.

```bash
npx rr add ai-workspace chat      # floating assistant FAB (convex/features/aiChat)
npx rr add ai-workspace studio    # generation canvas + agentic generate tool
npx rr add ai-workspace agents    # autonomous-worker run dashboard
npx rr add ai-workspace           # all three + root switcher
```

Only the `chat` variant pulls a Convex backend (per-variant convex gating).
`studio` and `agents` are frontend-only — wire your own persistence.

## Variants

- **chat** — `<AiChatFab chat={...} />` + `createAgenticChatSend`. Real
  function-calling over any ToolHost (`@/shared/agentic`); key-guarded, falls
  back to a wire-me-up notice when `ANTHROPIC_API_KEY` is unset.
- **studio** — `<AiStudioPage />` single-prompt generation canvas (variation
  grid + version tree) + `aiStudioTools` so a shared agent can drive it.
- **agents** — `<AiAgentsPage />` run-monitoring dashboard + `createAgentRunner(host)`
  which drives the shared function-calling loop and records each `tool_use` as
  a `RunStep` trace.

Merged 2026-07-04 from the former `ai-chat` + `ai-studio` + `ai-agents` slices
(all three old slugs alias here). Studio/agents views lifted from superspace.
