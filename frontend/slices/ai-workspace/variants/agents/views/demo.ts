/**
 * Static demo data for the AiAgentsPage scaffold — no backend, no LLM call.
 * Replace with `createAgentRunner` (../runner) wired to a real ToolHost.
 */
import type { AgentRun, RunStep } from "../types";

export const DEMO_AGENTS = [
  {
    slug: "audit-bp",
    name: "Best-Practice Auditor",
    description: "Scans slices for RBAC / audit / index gaps and files findings.",
    runs: 42,
  },
  {
    slug: "content-writer",
    name: "Content Writer",
    description: "Drafts storefront copy and product descriptions from a brief.",
    runs: 17,
  },
  {
    slug: "triage-bot",
    name: "Inbox Triage",
    description: "Labels and routes incoming support threads by intent.",
    runs: 8,
  },
] as const;

const DEMO_STEPS: RunStep[] = [
  { index: 0, name: "plan", result: "Break task into 3 subtasks", status: "done" },
  { index: 1, name: "search_slices", args: '{"query":"mutation"}', result: "12 files", status: "done" },
  { index: 2, name: "read_file", args: '{"path":"convex/features/sales/mutations.ts"}', result: "ok", status: "done" },
  { index: 3, name: "respond", result: "No RBAC gaps found in sales.", status: "done" },
];

export const DEMO_RUNS: AgentRun[] = [
  {
    id: "run_demo_1",
    workspaceId: "local",
    agentSlug: "audit-bp",
    input: "Audit frontend/slices/sales for RBAC gaps",
    status: "success",
    steps: DEMO_STEPS,
    costUsd: 0.021,
    latencyMs: 4200,
    startedAt: Date.now() - 60_000,
    finishedAt: Date.now() - 55_800,
  },
  {
    id: "run_demo_2",
    workspaceId: "local",
    agentSlug: "content-writer",
    input: "Write hero copy for the new POS onboarding screen",
    status: "running",
    steps: DEMO_STEPS.slice(0, 2),
    startedAt: Date.now() - 8_000,
  },
  {
    id: "run_demo_3",
    workspaceId: "local",
    agentSlug: "triage-bot",
    input: "Triage 14 unread support threads",
    status: "queued",
    steps: [],
    scheduleAt: Date.now() + 120_000,
  },
  {
    id: "run_demo_4",
    workspaceId: "local",
    agentSlug: "audit-bp",
    input: "Audit frontend/slices/cmsLite for missing indexes",
    status: "failed",
    steps: [
      { index: 0, name: "plan", result: "ok", status: "done" },
      { index: 1, name: "error", result: "Tool host unavailable (scaffold)", status: "error" },
    ],
    costUsd: 0.004,
    latencyMs: 1300,
    startedAt: Date.now() - 300_000,
    finishedAt: Date.now() - 298_700,
  },
];
