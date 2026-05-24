import type { AnalyticsKpi, Integration } from "./types";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

/** CK-2B — third-party integration registry. Eight slots covering the
 *  common B2B SaaS surface: comms (Slack), planning (Linear, GitHub),
 *  CRM (HubSpot, Intercom), email (Resend), billing (Stripe), analytics
 *  (Segment). Mix of statuses so the admin view shows visual variety. */
export const SEED_INTEGRATIONS: Integration[] = [
  {
    id: "int-slack",
    provider: "slack",
    label: "Slack — #revenue",
    status: "connected",
    webhookUrl: "https://hooks.slack.com/services/T0***/B0***/***",
    scopes: ["chat:write", "channels:read", "incoming-webhook"],
    lastSyncAt: day(0),
    secretHint: "xoxb-***-***-Q9Ax",
    notes: "Auto-posts MRR + new-customer events to #revenue.",
  },
  {
    id: "int-linear",
    provider: "linear",
    label: "Linear — Engineering",
    status: "connected",
    webhookUrl: "https://api.linear.app/graphql",
    scopes: ["read", "write", "issues:create"],
    lastSyncAt: day(1),
    secretHint: "lin_api_***h8Kq",
    notes: "Mirrors customer bug reports into the Eng triage queue.",
  },
  {
    id: "int-hubspot",
    provider: "hubspot",
    label: "HubSpot CRM",
    status: "connected",
    webhookUrl: "https://api.hubapi.com/webhooks/v3/",
    scopes: ["contacts", "crm.objects.deals.read", "tickets"],
    lastSyncAt: day(0),
    secretHint: "pat-na1-***-***-Tm3v",
    notes: "Two-way contact sync, deal stage updates flow back to admin.",
  },
  {
    id: "int-resend",
    provider: "resend",
    label: "Resend — transactional",
    status: "connected",
    webhookUrl: "https://api.resend.com/webhooks/email",
    scopes: ["emails:send", "domains:read"],
    lastSyncAt: day(0),
    secretHint: "re_***_Vp8M2nKx",
    notes: "Sender domain: mail.example.com (DKIM + SPF verified).",
  },
  {
    id: "int-stripe",
    provider: "stripe",
    label: "Stripe — billing",
    status: "connected",
    webhookUrl: "https://api.example.com/webhooks/stripe",
    scopes: ["read_write", "customer", "subscription", "invoice"],
    lastSyncAt: day(0),
    secretHint: "sk_live_***_3Az9",
    notes: "Webhook events: customer.subscription.*, invoice.paid.",
  },
  {
    id: "int-github",
    provider: "github",
    label: "GitHub — saas-marketing-os",
    status: "connected",
    webhookUrl: "https://api.github.com/repos/acme/saas-marketing-os/hooks",
    scopes: ["repo", "read:org", "workflow"],
    lastSyncAt: day(2),
    secretHint: "ghp_***Pq4z",
    notes: "Deploy status -> Slack + changelog drafts on tagged release.",
  },
  {
    id: "int-intercom",
    provider: "intercom",
    label: "Intercom Messenger",
    status: "error",
    webhookUrl: "https://api.intercom.io/webhooks",
    scopes: ["read_users", "write_users", "read_conversations"],
    lastSyncAt: day(7),
    secretHint: "dG9rXzAxK***Yh2",
    notes: "OAuth refresh expired 2026-05-17 — re-auth required.",
  },
  {
    id: "int-segment",
    provider: "segment",
    label: "Segment — events bus",
    status: "disconnected",
    webhookUrl: "",
    scopes: [],
    lastSyncAt: day(45),
    secretHint: "",
    notes: "Replaced by self-hosted analytics in v1.6.0.",
  },
];

/** CK-2B — last 4 weekly KPI samples, ordered oldest → newest.
 *  Real product would back this with a warehouse query; the seed gives
 *  the AnalyticsView a plausible MRR ramp + a churn dip + a healthy
 *  trial-to-paid conversion arc. */
export const SEED_ANALYTICS: AnalyticsKpi[] = [
  { week: "W-04", mrrCents:  98_400, newCustomers:  7, churnedCustomers: 2, trials: 14, trialsConverted: 4 },
  { week: "W-03", mrrCents: 112_700, newCustomers:  9, churnedCustomers: 1, trials: 18, trialsConverted: 6 },
  { week: "W-02", mrrCents: 128_900, newCustomers: 11, churnedCustomers: 3, trials: 22, trialsConverted: 8 },
  { week: "W-01", mrrCents: 148_200, newCustomers: 13, churnedCustomers: 2, trials: 27, trialsConverted: 11 },
];
