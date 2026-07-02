# ai-agents

Autonomous background AI worker dashboard. Task queue + step-by-step traces, Devin / Replit-Agent style. Each run produces an audit-log entry, cost tally, shareable trace URL.

## Install

```bash
npx rr add ai-agents
```

Peers: `convex-auth`, `ai-router`, `ai-admin`, `audit-log`.

## Usage

```tsx
// Page entry re-exports the dashboard view (default export AiAgentsPage).
export { default } from "@/frontend/slices/ai-agents/page";

// Runner surface (non-functional scaffold — no provider/SDK call is made).
import { createAgentRunner } from "@/frontend/slices/ai-agents";
```

## Surfaces

- **Public** — `<AiAgentsPage />` (`views/AiAgentsPage.tsx`) — queue + run trace + agent registry cards. Route: `/dashboard/ai-agents`.
- **Admin** — agent definitions, cron schedules, retry policy, cost cap. Not yet wired.

## Status

**Non-functional scaffold (0.1.0)** — adopted into SuperSpace ALONGSIDE the existing AI engine (`convex/features/ai`, untouched). rr's `ai-router` convex was relocated to `convex/features/aiRouter`. This slice ships no live convex wiring (`hasConvex: false`); the shared agentic loop (rr `@/shared/agentic`, absent here) is stubbed locally in `runner.ts`. Make it live by wiring `createAgentRunner` to a real ToolHost.
