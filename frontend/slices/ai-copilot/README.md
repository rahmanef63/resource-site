# ai-copilot

Sidebar AI companion. Sits beside an existing CRUD app, reads the focused entity (PR / doc / ticket / record), surfaces context-aware suggestions. Inline accept/dismiss diff hunks, slash-command palette, multi-turn drill-down.

## Install

```bash
npx rr add ai-copilot
```

Peers: `convex-auth`, `ai-router`, `ai-admin`.

## Usage

```tsx
import { CopilotProvider, CopilotPanel } from "@/features/ai-copilot";

<CopilotProvider entity={{ kind: "pr", id: pr.id, summary: pr.description }}>
  <YourAppShell>
    <YourMainContent />
    <CopilotPanel />
  </YourAppShell>
</CopilotProvider>
```

## Surfaces

- **Public** — `<CopilotPanel />` collapsible sidebar.
- **Admin** — trigger rules (which entity → which suggestions) + persona + tone + per-role rollout. Mounts as `admin-panel` section.

## Status

**Scaffold (0.1.0)** — contract + metadata + types. Real impl pending. UX target at `/preview/slices/ai-copilot`.
