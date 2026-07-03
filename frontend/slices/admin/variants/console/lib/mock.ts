/**
 * In-memory demo data + types for the 5 owned gap sections.
 *
 * Every owned section defaults its data prop to one of these so the whole
 * console is interactive with zero backend. Consumers pass real data (from
 * Convex or any store) to replace the mock. Pure module — no React.
 */

export interface AnalyticsData {
  metrics: { label: string; value: string; delta: number }[]
  funnel: { step: string; count: number }[]
}

export interface AuditEntry {
  id: string
  at: number
  actor: string
  action: string
  target: string
  before?: string
  after?: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  order: number
  visible: boolean
}

export type LeadStatus = "new" | "open" | "won" | "lost"
export interface Lead {
  id: string
  name: string
  email: string
  message: string
  source: string
  status: LeadStatus
  notes: string[]
  createdAt: number
}

export interface SeoPage {
  path: string
  title: string
  score: number
  issues: string[]
}

const DAY = 86_400_000

export const MOCK_ANALYTICS: AnalyticsData = {
  metrics: [
    { label: "Visitors (7d)", value: "12,481", delta: 8.2 },
    { label: "Signups (7d)", value: "342", delta: 12.5 },
    { label: "Active", value: "1,904", delta: -2.1 },
    { label: "Conversion", value: "2.7%", delta: 0.4 },
  ],
  funnel: [
    { step: "Visit", count: 12481 },
    { step: "Signup", count: 342 },
    { step: "Activated", count: 210 },
    { step: "Retained", count: 96 },
  ],
}

export const MOCK_AUDIT: AuditEntry[] = [
  { id: "a1", at: Date.now() - 2 * 3600_000, actor: "owner@acme.dev", action: "role.grant", target: "user:jane", before: "member", after: "admin" },
  { id: "a2", at: Date.now() - 6 * 3600_000, actor: "owner@acme.dev", action: "content.publish", target: "post:launch-notes" },
  { id: "a3", at: Date.now() - DAY, actor: "admin@acme.dev", action: "settings.update", target: "site.title", before: "Acme", after: "Acme Inc" },
  { id: "a4", at: Date.now() - 2 * DAY, actor: "system", action: "lead.create", target: "lead:hello@corp.io" },
]

export const MOCK_NAV: NavItem[] = [
  { id: "n1", label: "Home", href: "/", order: 0, visible: true },
  { id: "n2", label: "Blog", href: "/blog", order: 1, visible: true },
  { id: "n3", label: "Services", href: "/services", order: 2, visible: true },
  { id: "n4", label: "Pricing", href: "/pricing", order: 3, visible: false },
  { id: "n5", label: "Contact", href: "/contact", order: 4, visible: true },
]

export const MOCK_LEADS: Lead[] = [
  { id: "l1", name: "Jamie Rivera", email: "jamie@corp.io", message: "Interested in the enterprise tier.", source: "contact-form", status: "new", notes: [], createdAt: Date.now() - 3600_000 },
  { id: "l2", name: "Sam Okoye", email: "sam@studio.co", message: "Do you offer white-label?", source: "newsletter", status: "open", notes: ["Replied 2d ago"], createdAt: Date.now() - 3 * DAY },
  { id: "l3", name: "Lee Park", email: "lee@shop.kr", message: "Quote for 500 seats.", source: "referral", status: "won", notes: ["Closed $12k"], createdAt: Date.now() - 8 * DAY },
]

export const MOCK_SEO: SeoPage[] = [
  { path: "/", title: "Home", score: 92, issues: [] },
  { path: "/blog", title: "Blog", score: 74, issues: ["Missing meta description", "H1 duplicated"] },
  { path: "/services", title: "Services", score: 61, issues: ["Title too long", "No og:image", "Thin content"] },
  { path: "/pricing", title: "Pricing", score: 88, issues: ["No canonical"] },
]
