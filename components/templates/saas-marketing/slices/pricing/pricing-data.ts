/** CK-2B — pricing comparison matrix + FAQ + custom-quote copy. */

export type MatrixRow = {
  label: string;
  category: "Limits" | "Workflow" | "Admin" | "Support";
  free: string | boolean;
  team: string | boolean;
  scale: string | boolean;
};

export const PRICING_MATRIX: MatrixRow[] = [
  { label: "Signed PDFs / month",   category: "Limits",   free: "100",    team: "10,000",  scale: "Unlimited" },
  { label: "Team seats",            category: "Limits",   free: "1",      team: "10",      scale: "Unlimited" },
  { label: "Templates",             category: "Limits",   free: "5",      team: "Unlimited", scale: "Unlimited" },
  { label: "API rate limit (rps)",  category: "Limits",   free: "5",      team: "60",      scale: "Custom" },

  { label: "Sequenced flows",       category: "Workflow", free: false,    team: true,      scale: true },
  { label: "Conditional routing",   category: "Workflow", free: false,    team: true,      scale: true },
  { label: "Bulk send (CSV)",       category: "Workflow", free: false,    team: "Up to 5k", scale: "Up to 50k" },
  { label: "Custom branding",       category: "Workflow", free: false,    team: true,      scale: true },

  { label: "Audit log",             category: "Admin",    free: true,     team: true,      scale: true },
  { label: "SAML SSO",              category: "Admin",    free: false,    team: true,      scale: true },
  { label: "Data residency (EU/US)", category: "Admin",   free: false,    team: true,      scale: true },
  { label: "Custom retention + shred", category: "Admin", free: false,    team: false,     scale: true },
  { label: "BAA + DPA",             category: "Admin",    free: false,    team: false,     scale: true },

  { label: "Community support",     category: "Support",  free: true,     team: true,      scale: true },
  { label: "Email support",         category: "Support",  free: false,    team: "24h SLA", scale: "1h SLA" },
  { label: "Dedicated CSM",         category: "Support",  free: false,    team: false,     scale: true },
];

export const PRICING_FAQ = [
  {
    q: "Is there really a free forever tier?",
    a: "Yes — 100 signed PDFs per month, 1 seat, REST API + webhooks. No card required. We support it because most teams that grow stay with us; the free plan pays for itself by way of conversion.",
  },
  {
    q: "What happens if I exceed my monthly quota?",
    a: "We never silently rate-limit. You'll get an email at 80% and 100% of quota. Free + Team plans queue overflow for the next cycle; Scale is metered and billed at the contracted overage rate.",
  },
  {
    q: "Can I switch plans mid-cycle?",
    a: "Upgrades are immediate and pro-rated. Downgrades take effect at the next renewal. Cancellations stop charges instantly but you keep access through the paid period.",
  },
  {
    q: "Do you sign a BAA / DPA / on-prem agreement?",
    a: "BAA + DPA are standard on Scale. On-prem deployments (helm chart, air-gapped) are available on annual contracts — talk to sales.",
  },
  {
    q: "Is the audit log truly tamper-evident?",
    a: "Each entry is hash-chained and the chain root is published daily to a public Merkle ledger. We give you the verifier CLI so your auditors can independently confirm integrity.",
  },
  {
    q: "Can I get a discount for startups / non-profits?",
    a: "Yes — 50% off Team for YC + Techstars + a-ha companies in their first year. 100% off Free + Team for registered 501(c)(3) non-profits. Email founders@ to claim.",
  },
];
