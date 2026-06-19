// Per-slug honesty copy for the tour capability cards — what a KEY-GATED slice
// needs to run its REAL action live. Seeded from the tour recon classification.
//
// `key` fills the badge ("needs <key> for live <action>"); `action` names the
// gated capability; `poster` points at a /public asset when one exists (none
// today — all key-gated slugs fall back to the iframe or icon body). Unknown
// slugs degrade to a generic message via needsFor(), never a crash. Pure data —
// no JSX, no convex import (Hard Rule 6).

export type Needs = { key: string; action: string; poster?: string };

const NEEDS: Record<string, Needs> = {
  "ai-router": {
    key: "OPENROUTER_API_KEY",
    action: "tier-routed completions",
  },
  "vector-search": {
    key: "OPENAI_API_KEY + a Convex vector index",
    action: "semantic search",
  },
  "create-your-mcp": {
    key: "MCP_API_KEY + an OAuth host allowlist",
    action: "real MCP tokens",
  },
  "resend-newsletter": {
    key: "RESEND_API_KEY",
    action: "double-opt-in email",
  },
  "cal-com-booking": {
    key: "a Cal.com username + CALCOM_WEBHOOK_SECRET",
    action: "embedded bookings",
  },
  "doku-payment": {
    key: "DOKU_CLIENT_ID + DOKU_SECRET_KEY",
    action: "checkout / VA / QRIS / e-wallet",
  },
  "midtrans-payment": {
    key: "MIDTRANS_SERVER_KEY + MIDTRANS_CLIENT_KEY",
    action: "Snap payments",
  },
};

/** Generic fallback so any future key-gated slug renders honestly without edits. */
const FALLBACK_NEEDS: Needs = { key: "a provider key", action: "the live action" };

export function needsFor(slug: string): Needs {
  return NEEDS[slug] ?? FALLBACK_NEEDS;
}
