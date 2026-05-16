# ai-agent-runner

Autonomous background AI worker dashboard. Task queue + step-by-step traces, Devin / Replit-Agent style. Each run produces an audit-log entry, cost tally, shareable trace URL.

## Install

```bash
npx rr add ai-agent-runner
```

Peers: `convex-auth`, `ai-router`, `ai-admin`, `audit-log`.

## Usage

```tsx
import { RunnerDashboard } from "@/features/ai-agent-runner";

export default function AgentsPage() {
  return <RunnerDashboard />;
}

// Trigger a run from server code
await ctx.runAgent({ agentSlug: "audit-bp", input: "Audit slices/comments" });
```

## Surfaces

- **Public** — `<RunnerDashboard />` — queue + live trace + agent registry cards.
- **Admin** — agent definitions, cron schedules, retry policy, hard cost cap. Mounts as `admin-panel` section.

## Status

**Scaffold (0.1.0)** — contract + metadata + types. Real impl pending. UX target at `/preview/slices/ai-agent-runner`.
