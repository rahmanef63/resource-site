/** CK-2B — feature matrix categories + use-case callouts for the public
 *  /features page. Pure data; consumed by FeatureMatrix + UseCases siblings. */

export type FeatureCategory = {
  id: string;
  label: string;
  blurb: string;
  /** Icon name resolved by FeatureMatrix → lucide-react. */
  icon: string;
  items: {
    title: string;
    body: string;
    /** Optional plan ceiling — "Free" / "Team" / "Scale". */
    availableFrom?: "Free" | "Team" | "Scale";
  }[];
};

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "cat-core",
    label: "Core API",
    blurb: "The bits you depend on every request.",
    icon: "Zap",
    items: [
      { title: "One-line signing", body: "POST a doc + signer, receive signed PDF.", availableFrom: "Free" },
      { title: "Templates", body: "Reusable docs with named signer roles + variables.", availableFrom: "Free" },
      { title: "Sequenced flows", body: "Strict signing order with optional reminders.", availableFrom: "Team" },
      { title: "Embedded signing", body: "Drop-in iframe with white-label styling.", availableFrom: "Team" },
    ],
  },
  {
    id: "cat-workflow",
    label: "Workflow",
    blurb: "Tools for moving docs through humans.",
    icon: "Workflow",
    items: [
      { title: "Reminders + nudges", body: "Auto follow-up emails at days 3, 7, 14.", availableFrom: "Free" },
      { title: "Conditional routing", body: "Skip signers based on field values.",     availableFrom: "Team" },
      { title: "Bulk send", body: "CSV up to 50k recipients; rate-limited per signer.", availableFrom: "Team" },
      { title: "Custom branding", body: "Logo, favicon, theme — applied across emails + viewer.", availableFrom: "Team" },
    ],
  },
  {
    id: "cat-admin",
    label: "Admin & compliance",
    blurb: "Defaults that keep auditors and SREs calm.",
    icon: "ShieldCheck",
    items: [
      { title: "Audit log", body: "Tamper-evident, exportable as JSON + PDF.",      availableFrom: "Free" },
      { title: "SAML SSO", body: "Okta, Azure AD, Google Workspace.",                availableFrom: "Team" },
      { title: "Data residency", body: "Pin docs to eu-central-1 or us-east-1.",     availableFrom: "Team" },
      { title: "Custom retention", body: "Per-doc TTL + cryptographic shred-on-expire.", availableFrom: "Scale" },
      { title: "BAA + DPA", body: "Signed agreements for healthcare + EU customers.",    availableFrom: "Scale" },
    ],
  },
  {
    id: "cat-integrations",
    label: "Integrations",
    blurb: "Plug into the tools your team already runs.",
    icon: "Plug",
    items: [
      { title: "Webhook reliability", body: "Idempotent payloads, exp backoff, DLQ.", availableFrom: "Free" },
      { title: "Slack notifications", body: "Per-channel routing by document tag.",   availableFrom: "Free" },
      { title: "Salesforce + HubSpot", body: "Two-way contact + opportunity sync.",   availableFrom: "Team" },
      { title: "Zapier + Make",  body: "30+ triggers covering every signing event.",  availableFrom: "Team" },
    ],
  },
];

export type UseCase = {
  industry: string;
  problem: string;
  solution: string;
  outcome: string;
};

export const USE_CASES: UseCase[] = [
  {
    industry: "Fintech onboarding",
    problem: "30+ documents per new corporate account, mailed to legal teams.",
    solution: "Sequenced flows + reusable templates trigger from your KYC pipeline.",
    outcome: "Median time-to-account dropped from 6 days to 11 hours.",
  },
  {
    industry: "Healthcare consent",
    problem: "HIPAA + state-specific consent forms with strict retention windows.",
    solution: "EU + US residency, custom retention, BAA in place.",
    outcome: "Zero compliance findings in the most recent OCR audit cycle.",
  },
  {
    industry: "B2B sales contracts",
    problem: "Sales ops chasing signatures across 4 tools + spreadsheets.",
    solution: "HubSpot sync writes deal stage on every event; Slack alerts close-the-loop.",
    outcome: "Forecast accuracy improved by 22%, close cycle by 5 days.",
  },
];
