import {
  Sparkles, KeyRound, FileText, GraduationCap, Wrench, Bot, Receipt, Activity,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";

export const STATUS_COLOR = {
  connected: "bg-success/15 text-success",
  error: "bg-danger/15 text-danger",
  "missing-key": "bg-warning/15 text-warning-foreground",
} as const;

export const STATUS_ICON = {
  connected: CheckCircle2,
  error: XCircle,
  "missing-key": AlertTriangle,
};

// Build-flow order: infrastructure → catalog → behavior → safety.
export const TAB_LIST = [
  { id: "providers", label: "1. Providers", icon: KeyRound },
  { id: "models", label: "2. Models", icon: Sparkles },
  { id: "instructions", label: "3. Instructions", icon: FileText },
  { id: "skills", label: "4. Skills", icon: GraduationCap },
  { id: "tools", label: "5. Tools", icon: Wrench },
  { id: "agents", label: "6. Agents", icon: Bot },
  { id: "budgets", label: "7. Budgets", icon: Receipt },
  { id: "audit", label: "8. Audit", icon: Activity },
];

export const INSTRUCTIONS = [
  { slug: "house-style", name: "House style", body: "Reply in user's language. Cite docs. Refuse off-topic.", uses: 412 },
  { slug: "brief", name: "Brief mode", body: "Short answers. No filler. Code blocks only when asked.", uses: 248 },
  { slug: "tutor", name: "Patient tutor", body: "Explain like to a smart beginner. Use analogies.", uses: 91 },
  { slug: "shipper", name: "Senior shipper", body: "Production-ready code. Edge cases. No prose.", uses: 188 },
];

export const AGENT_STATUS_COLOR = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  draft: "bg-muted text-muted-foreground",
} as const;

export const AUDIT_ROWS = [
  { ts: "12:04:18", actor: "alice@acme", agent: "audit-bp", model: "claude-opus-4-7", in: "8,124", out: "1,808", cost: "$0.26", lat: "9.4s" },
  { ts: "11:58:02", actor: "bob@acme", agent: "research", model: "gpt-5", in: "12,400", out: "3,210", cost: "$0.31", lat: "14.2s" },
  { ts: "11:42:51", actor: "carol@acme", agent: "pr-reviewer", model: "claude-sonnet-4-6", in: "4,200", out: "812", cost: "$0.03", lat: "3.1s" },
];
