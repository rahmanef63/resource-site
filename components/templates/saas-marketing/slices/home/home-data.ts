/** CK-2B — static copy for the public Home page enhancements. Kept out of
 *  HomePage.tsx so each section file stays under the 200 LOC cap. */

export const SOCIAL_PROOF_LOGOS = [
  "Northwind",
  "Kestrel",
  "SwiftPay",
  "OrbitLabs",
  "BlueMoon",
  "Harbor",
  "Vega Health",
  "Flint",
];

export const HOME_STATS = [
  { value: "10M+", label: "Signed PDFs / yr",  hint: "Across 4,200 paying teams." },
  { value: "99.99%", label: "Render uptime",   hint: "Rolling 12-month average." },
  { value: "<400ms", label: "p95 sign latency", hint: "Per render-queue worker." },
  { value: "SOC 2",  label: "Type II + ISO 27001", hint: "Audited Q1 2026." },
];

export const HOME_TESTIMONIALS = [
  {
    quote:
      "We replaced our DocuSign stack in a single afternoon. The audit log alone paid for the year.",
    name: "Rae H.",
    role: "Head of Engineering, Northwind",
  },
  {
    quote:
      "Per-document EU residency without an SDK rewrite. Procurement loved it as much as our SREs.",
    name: "Ivo M.",
    role: "VP Eng, Kestrel",
  },
  {
    quote:
      "Predictable pricing means we stopped budgeting around per-seat creep every renewal cycle.",
    name: "Annika R.",
    role: "Ops Lead, SwiftPay",
  },
  {
    quote:
      "Webhook retries Just Work. We deleted ~400 lines of custom queue code on the migration.",
    name: "Sven A.",
    role: "Staff SWE, Vega Health",
  },
];

export const HOME_PRICING_TEASER = [
  { plan: "Free",  price: "$0",    blurb: "100 signed PDFs / mo, 1 seat." },
  { plan: "Team",  price: "$49",   blurb: "10k signed PDFs / mo, 10 seats, SSO." },
  { plan: "Scale", price: "Custom", blurb: "Unlimited + dedicated residency." },
];
