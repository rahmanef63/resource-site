import {
  Inbox, Star, Hash, Users, Settings, FileText,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { icon: Inbox, label: "Inbox", count: 12 },
      { icon: Star, label: "Starred", count: 4 },
      { icon: FileText, label: "Drafts", count: 2 },
    ],
  },
  {
    label: "Channels",
    items: [
      { icon: Hash, label: "general" },
      { icon: Hash, label: "ship-room" },
      { icon: Hash, label: "design-crit" },
      { icon: Hash, label: "ops-incidents" },
    ],
  },
  {
    label: "People",
    items: [
      { icon: Users, label: "Team" },
      { icon: Settings, label: "Settings" },
    ],
  },
];

export const DOCS = [
  { title: "Q3 launch checklist", excerpt: "Cut RC, smoke prod, page on-call…", tag: "ship", time: "12m" },
  { title: "Migration plan: Next 16", excerpt: "PPR rollout, proxy.ts, cacheComponents…", tag: "tech", time: "1h" },
  { title: "Customer interview — Acme", excerpt: "Pricing tier feedback, onboarding gap…", tag: "research", time: "3h" },
  { title: "Audit-bp ≥80 rubric", excerpt: "Gating policy, remediation flow…", tag: "policy", time: "yest" },
  { title: "Convex self-hosted topology", excerpt: "Postgres + S3, admin key sync, JWT keys…", tag: "infra", time: "2d" },
];

export const INSPECTOR_STATUS = [
  { label: "Audit-bp gate", value: "82 / 100", state: "ok" as const },
  { label: "RBAC checks", value: "passing", state: "ok" as const },
  { label: "Convex codegen", value: "stale 6m", state: "warn" as const },
  { label: "Smoke prod", value: "pending", state: "warn" as const },
];
