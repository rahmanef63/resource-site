---
slug: konsultan-os
title_en: Consulting Workspace
title_id: Konsultan OS
status: planned
priority: 3
tagline_en: Client portal + proposal/contract AI + meeting workspace + PajakAware invoicing.
tagline_id: Workspace konsultan Indonesia — proposal AI, kontrak ID, PPN/PPh built-in, deck bilingual.

segments:
  primary: [konsultan, profesional-jasa, agency]
  secondary: [advokat-solo, founder-startup, freelancer-pm]

surfaces:
  public:
    preview_path: /preview/templates/konsultan-os/public
    default_view: desktop
  admin:
    preview_path: /preview/templates/konsultan-os/admin
    default_view: desktop
  default_surface: admin

shared_deps:
  - auth
  - ai-router
  - convex-base
  - design-system
  - i18n
  - shell
  - three-column
  - billing-id
  - resend
  - pdf-extract
  - vector-search

source_map:
  - from: notion-page-clone/src/slices/editor
    to: frontend/slices/proposal-editor
  - from: notion-page-clone/src/slices/databases
    to: frontend/slices/crm-databases
  - from: notion-page-clone/src/slices/comments
    to: frontend/slices/client-comments
  - from: superspace/frontend/shared/ui/layout/container/three-column
    to: frontend/shared/ui/layout/container/three-column
  - from: superspace/frontend/shared/ui/layout/dashboard
    to: frontend/shared/ui/layout/dashboard

modules:
  - { id: client-portal,      name: "Client Portal (per-client workspace)", surface: [public, admin], status: planned }
  - { id: proposal-builder,   name: "Proposal Builder (AI-fill + e-sign)", surface: [admin],         status: planned }
  - { id: contract-gen,       name: "Contract & NDA Generator (ID legal)", surface: [admin],         status: planned }
  - { id: doc-intelligence,   name: "Document Intelligence (extract+flag)", surface: [admin],        status: planned }
  - { id: project-tracker,    name: "Project Tracker (milestone+time)",     surface: [public, admin], status: planned }
  - { id: meeting-workspace,  name: "Meeting Workspace (record→minutes)",   surface: [admin],         status: planned }
  - { id: kb-internal,        name: "Knowledge Base Internal",              surface: [admin],         status: planned }
  - { id: deck-builder,       name: "Deck/Report Builder (McKinsey-style)", surface: [admin],         status: planned }
  - { id: invoice-time,       name: "Invoice + Time-tracking (PajakAware)", surface: [admin],         status: planned }
  - { id: risk-templates,     name: "Risk Assessment Templates",            surface: [admin],         status: planned }
  - { id: crm-lite,           name: "CRM Lite (lead pipeline)",             surface: [admin],         status: planned }
  - { id: public-firm,        name: "Public Firm/Solo site",                surface: [public],        status: planned }

schema_tables:
  - clients
  - client_members
  - engagements
  - deliverables
  - proposals
  - contracts
  - signatures
  - documents
  - doc_extractions
  - meetings
  - meeting_artifacts
  - knowledge_items
  - decks
  - invoices
  - time_entries
  - risk_assessments
  - leads
  - lead_activities

ai_features:
  - proposal-fill           # mid tier (brief → proposal sections)
  - contract-review         # flagship tier (review draft from client)
  - contract-generate       # mid tier (template + variables → ID legal text)
  - doc-extract-key-terms   # mid tier (extract dates, parties, $$, obligations)
  - doc-risk-flag           # mid tier (legal/financial risk flag)
  - meeting-summarize       # mid tier (transcript → minutes + action items)
  - meeting-followup        # nano tier (action items → email drafts)
  - deck-outline            # mid tier (problem/hypothesis/recommendation)
  - deck-slide-write        # mid tier (per-slide narrative)
  - kb-search               # nano tier (vector search internal KB)
  - lead-qualify            # nano tier (lead → score + next-action)

market_size_id: medium
differentiator: |
  PajakAware (PPN/PPh built-in invoicing), Indonesian legal templates
  (NDA/MoU/Service Agreement), bilingual deck output (ID/EN), client portal
  yang ga butuh klien install apa-apa. Self-hosted = data klien aman di
  server-mu.
---

# T5 — Konsultan OS

> "Pak Rizki, konsultan strategi independen di Jakarta. Klien 5-8 aktif sekaligus. Sebelumnya: Word buat proposal (template manual), Google Drive buat share file, Zoom + Otter buat meeting, Excel buat invoice (PPh 23 hitung manual), WA buat update klien. Sekarang: 1 brief klien → AI generate proposal draft + kontrak NDA + invoice template, klien login ke portal sendiri lihat progress + deliverable, meeting recording auto-minute + follow-up email draft. Deck final: outline → AI expand jadi McKinsey-style slide bilingual."

## Target segment detail

- **Konsultan independen / boutique firm**: strategi, marketing, HR, IT, sustainability — banyak banget di Jakarta/Surabaya/Bali.
- **Profesional jasa**: lawyer, accountant, financial advisor, architect.
- **Agency**: design agency, dev agency, content agency.
- **Founder startup**: pitch deck + investor update + due diligence prep.
- **Indonesia**: ~500K profesional jasa berizin + agency. ARPU tinggi (Rp 200k-2jt/mo viable).
- **Current alternatives**: Notion + Word + DocuSign + Zoom + QuickBooks/Mekari — fragmented + Western tools yang ga aware konteks ID (PPN, PPh, materai, tax invoice format).

## Module spec

| ID | Name | Surface | Short desc |
|---|---|---|---|
| client-portal | Client Portal | public + admin | Per-klien sub-workspace: dokumen share, deliverable tracker, status komunikasi. Klien login via magic-link, ga perlu install. |
| proposal-builder | Proposal Builder | admin | Template (consulting/design/legal/marketing), AI fill dari brief klien, pricing table (PPN-aware), e-signature. |
| contract-gen | Contract & NDA Generator | admin | Template legal Indonesia (NDA, MSA, SLA, MoU, Service Agreement). Klausul library. AI review draft yang dikirim klien. |
| doc-intelligence | Document Intelligence | admin | Upload kontrak/laporan keuangan klien → AI extract key terms (parties, dates, obligations, $$), risk flag, summary. |
| project-tracker | Project Tracker | public + admin | Milestone, deliverable, status, time-tracking. Klien lihat status (admin lihat detail + billing). |
| meeting-workspace | Meeting Workspace | admin | Upload recording/transcript → AI generate minutes, action items, follow-up email drafts per attendee. |
| kb-internal | Knowledge Base | admin | Internal: framework, case study lama, template re-usable. AI semantic search ("kasus mirip apa yg pernah kita kerja?"). |
| deck-builder | Deck/Report Builder | admin | Outline → AI generate slide McKinsey-style (problem, hypothesis, recommendation). Bilingual ID/EN output. |
| invoice-time | Invoice + Time-tracking | admin | Time entry per-engagement → invoice generator. PPN 11% + PPh 21/23 + materai built-in. Tax invoice format DJP-compliant. |
| risk-templates | Risk Assessment | admin | Templates untuk PM (project risk), compliance (regulatory), legal (contract review). |
| crm-lite | CRM Lite | admin | Lead → proposal → won/lost pipeline. Follow-up reminder. AI qualify lead score. |
| public-firm | Public Firm site | public | Hosted firm/solo profile: services, case studies (anonymized), team, blog, contact. |

## Public surface

Two distinct public modes:

### A) Firm/solo public site

| Route | File | Purpose |
|---|---|---|
| `/` | `app/(public)/page.tsx` | Hero + services + case studies + contact |
| `/services` | `.../services/page.tsx` | Service offerings + pricing tier |
| `/case-studies` | `.../case-studies/page.tsx` | Case study list |
| `/case-studies/[slug]` | `.../case-studies/[slug]/page.tsx` | Single case (anonymized) |
| `/team` | `.../team/page.tsx` | Team profiles |
| `/contact` | `.../contact/page.tsx` | Contact form |

### B) Client portal (per-client subdomain or `/c/[clientSlug]`)

| Route | File | Purpose |
|---|---|---|
| `/c/[client]` | `app/(public)/c/[client]/page.tsx` | Client home — overview engagements + recent deliverables |
| `/c/[client]/engagements/[id]` | `.../engagements/[id]/page.tsx` | Engagement status + milestones + deliverables |
| `/c/[client]/documents` | `.../documents/page.tsx` | Shared documents (read-only or comment) |
| `/c/[client]/invoices` | `.../invoices/page.tsx` | Invoice history (paid/pending) |
| `/c/[client]/messages` | `.../messages/page.tsx` | Threaded conversation |

### Page placeholders

```tsx
// app/(public)/c/[client]/page.tsx — Client portal home
<ClientPortalShell client={client}>
  <EngagementsOverview items={engagements} />
  <RecentDeliverables items={deliverables} />
  <InvoiceSummary outstanding={outstandingTotal} />
  <RecentMessages />
</ClientPortalShell>
```

```tsx
// app/(public)/page.tsx — Firm site
<FirmHero firm={firm} />
<ServicesGrid offerings={offerings} />
<CaseStudiesTeaser items={featuredCases} />
<TeamGrid members={team} />
<ContactCTA />
```

## Admin surface

Routes under `/k` (konsultan):

| Route | File | Purpose |
|---|---|---|
| `/k` | `app/(admin)/k/page.tsx` | Dashboard: active engagements, pending deliverables, outstanding invoices, lead pipeline summary |
| `/k/clients` | `.../clients/page.tsx` | Client list |
| `/k/clients/[id]` | `.../clients/[id]/page.tsx` | Client detail (engagements, docs, comms, billing) |
| `/k/engagements` | `.../engagements/page.tsx` | All engagements across clients |
| `/k/engagements/[id]` | `.../engagements/[id]/page.tsx` | Engagement workspace (milestones, deliverables, time, billing) |
| `/k/proposals` | `.../proposals/page.tsx` | Proposals list (draft/sent/won/lost) |
| `/k/proposals/[id]/edit` | `.../proposals/[id]/edit/page.tsx` | Proposal builder (AI fill + edit + e-sign send) |
| `/k/contracts` | `.../contracts/page.tsx` | Contracts list (draft/active/expired) |
| `/k/contracts/[id]` | `.../contracts/[id]/page.tsx` | Contract detail + version history |
| `/k/contracts/review` | `.../contracts/review/page.tsx` | Upload incoming contract → AI review |
| `/k/docs` | `.../docs/page.tsx` | Document Intelligence: upload + extract + flag |
| `/k/meetings` | `.../meetings/page.tsx` | Meeting list |
| `/k/meetings/[id]` | `.../meetings/[id]/page.tsx` | Meeting workspace: recording, transcript, minutes, action items |
| `/k/kb` | `.../kb/page.tsx` | Internal knowledge base + AI search |
| `/k/decks` | `.../decks/page.tsx` | Decks list |
| `/k/decks/[id]/edit` | `.../decks/[id]/edit/page.tsx` | Deck builder (outline → slide AI) |
| `/k/invoices` | `.../invoices/page.tsx` | Invoice list + create + PPN/PPh auto-calc |
| `/k/time` | `.../time/page.tsx` | Time entries + timer + billable summary |
| `/k/risk` | `.../risk/page.tsx` | Risk assessment templates |
| `/k/crm` | `.../crm/page.tsx` | Lead pipeline kanban |
| `/k/settings/legal` | `.../settings/legal/page.tsx` | Contract templates + clausa library |
| `/k/settings/billing` | `.../settings/billing/page.tsx` | Tax config (PPN, PPh tier), invoice template |

### Page placeholders

```tsx
// app/(admin)/k/proposals/[id]/edit/page.tsx
<ThreeColumnLayout
  preset="proposal-editor"
  left={<ProposalSectionsNav sections={proposal.sections} />}
  center={<BlockEditor proposalId={id} />}
  right={
    <Tabs defaultValue="ai">
      <TabsList>
        <TabsTrigger value="ai">AI Fill</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="sign">E-Sign</TabsTrigger>
      </TabsList>
      <TabsContent value="ai">
        <BriefImporter onImport={(brief) => api.ai.proposalFill({ brief, sections })} />
        <ToneAdjuster />
        <BilingualToggle />
      </TabsContent>
      <TabsContent value="pricing">
        <PricingTable items={pricing} taxAware />
      </TabsContent>
      <TabsContent value="sign">
        <ESignSetup signers={signers} />
      </TabsContent>
    </Tabs>
  }
/>
```

```tsx
// app/(admin)/k/meetings/[id]/page.tsx
<ThreeColumnLayout
  preset="meeting-workspace"
  left={<MeetingNav sections={["transcript","minutes","actions","followup"]} />}
  center={
    activeTab === "transcript" ? <TranscriptViewer transcript={transcript} /> :
    activeTab === "minutes"    ? <MinutesEditor minutes={minutes} /> :
    activeTab === "actions"    ? <ActionItemsList items={actions} onAssign={assign} /> :
                                 <FollowupDrafts emails={emails} />
  }
  right={
    <Tabs defaultValue="ai">
      <TabsList>
        <TabsTrigger value="ai">AI Tools</TabsTrigger>
        <TabsTrigger value="meta">Meta</TabsTrigger>
      </TabsList>
      <TabsContent value="ai">
        <SummarizeButton onClick={() => api.ai.meetingSummarize({ transcript })} />
        <ExtractActionsButton onClick={() => api.ai.meetingActions({ transcript })} />
        <DraftFollowupButton onClick={() => api.ai.meetingFollowup({ minutes, attendees })} />
      </TabsContent>
      <TabsContent value="meta">
        <MeetingMetaForm />
      </TabsContent>
    </Tabs>
  }
/>
```

```tsx
// app/(admin)/k/decks/[id]/edit/page.tsx
<DeckShell>
  <SlideOutlineSidebar slides={deck.slides} active={active} onSelect={setActive} />
  <SlidePreview slide={deck.slides[active]} bilingual={deck.bilingual} />
  <SlideEditPanel
    slide={deck.slides[active]}
    onAiExpand={() => api.ai.deckSlideWrite({ outline: deck.outline, slideIdx: active })}
  />
</DeckShell>
<DeckExportToolbar formats={["pptx","pdf","keynote-compatible"]} />
```

## Convex schema sketch

```ts
clients: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  name: v.string(),
  legalName: v.optional(v.string()),
  npwp: v.optional(v.string()),
  address: v.optional(v.string()),
  contactEmail: v.string(),
  contactPhone: v.optional(v.string()),
  portalDomain: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_workspace_slug", ["workspaceId", "slug"]),

client_members: defineTable({
  clientId: v.id("clients"),
  email: v.string(),
  name: v.string(),
  role: v.union(v.literal("primary"), v.literal("collaborator"), v.literal("viewer")),
}).index("by_client_email", ["clientId", "email"]),

engagements: defineTable({
  clientId: v.id("clients"),
  name: v.string(),
  type: v.string(),                            // "strategy", "audit", "implementation"
  status: v.union(v.literal("scoping"), v.literal("active"), v.literal("paused"), v.literal("done")),
  budget: v.optional(v.number()),
  startDate: v.number(),
  endDate: v.optional(v.number()),
  retainerHoursPerMonth: v.optional(v.number()),
}).index("by_client_status", ["clientId", "status"]),

deliverables: defineTable({
  engagementId: v.id("engagements"),
  title: v.string(),
  status: v.union(v.literal("pending"), v.literal("in-progress"), v.literal("review"), v.literal("delivered"), v.literal("accepted")),
  dueDate: v.optional(v.number()),
  fileUrl: v.optional(v.string()),
  visibleToClient: v.boolean(),
}).index("by_engagement_status", ["engagementId", "status"]),

proposals: defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.optional(v.id("clients")),
  title: v.string(),
  sections: v.any(),
  pricing: v.any(),                            // { items, subtotal, ppn, total }
  status: v.union(v.literal("draft"), v.literal("sent"), v.literal("won"), v.literal("lost")),
  language: v.union(v.literal("id"), v.literal("en"), v.literal("bilingual")),
}).index("by_workspace_status", ["workspaceId", "status"]),

contracts: defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.id("clients"),
  type: v.union(v.literal("nda"), v.literal("msa"), v.literal("sla"), v.literal("mou"), v.literal("service-agreement")),
  title: v.string(),
  body: v.string(),
  variables: v.any(),
  effectiveDate: v.optional(v.number()),
  expiryDate: v.optional(v.number()),
  status: v.union(v.literal("draft"), v.literal("sent"), v.literal("active"), v.literal("expired")),
}).index("by_workspace_status", ["workspaceId", "status"])
  .index("by_client", ["clientId"]),

signatures: defineTable({
  contractId: v.id("contracts"),
  signerEmail: v.string(),
  signerName: v.string(),
  signedAt: v.optional(v.number()),
  signatureBlob: v.optional(v.string()),
  ipHash: v.optional(v.string()),
}).index("by_contract", ["contractId"]),

documents: defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.optional(v.id("clients")),
  title: v.string(),
  fileUrl: v.string(),
  type: v.string(),
  uploadedBy: v.id("users"),
  uploadedAt: v.number(),
}).index("by_workspace_client", ["workspaceId", "clientId"]),

doc_extractions: defineTable({
  documentId: v.id("documents"),
  keyTerms: v.any(),                           // { parties, dates, $$, obligations }
  riskFlags: v.array(v.object({ severity: v.string(), kind: v.string(), location: v.string(), explanation: v.string() })),
  summary: v.string(),
  embedding: v.optional(v.array(v.float64())),
}).index("by_document", ["documentId"]),

meetings: defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.optional(v.id("clients")),
  engagementId: v.optional(v.id("engagements")),
  title: v.string(),
  startedAt: v.number(),
  durationSec: v.number(),
  recordingUrl: v.optional(v.string()),
  transcript: v.optional(v.string()),
  attendees: v.array(v.object({ name: v.string(), email: v.optional(v.string()), role: v.optional(v.string()) })),
}).index("by_workspace_time", ["workspaceId", "startedAt"]),

meeting_artifacts: defineTable({
  meetingId: v.id("meetings"),
  type: v.union(v.literal("minutes"), v.literal("actions"), v.literal("followup-email")),
  body: v.any(),
  generatedAt: v.number(),
}).index("by_meeting_type", ["meetingId", "type"]),

knowledge_items: defineTable({
  workspaceId: v.id("workspaces"),
  type: v.union(v.literal("framework"), v.literal("case-study"), v.literal("template"), v.literal("note")),
  title: v.string(),
  body: v.string(),
  tags: v.array(v.string()),
  embedding: v.array(v.float64()),
  createdAt: v.number(),
}).index("by_workspace_type", ["workspaceId", "type"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["workspaceId"] }),

decks: defineTable({
  workspaceId: v.id("workspaces"),
  engagementId: v.optional(v.id("engagements")),
  title: v.string(),
  outline: v.any(),                            // { problem, hypothesis, recommendation, sections }
  slides: v.array(v.object({ title: v.string(), narrative: v.string(), notes: v.string(), layout: v.string() })),
  bilingual: v.boolean(),
}).index("by_workspace", ["workspaceId"]),

invoices: defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.id("clients"),
  engagementId: v.optional(v.id("engagements")),
  number: v.string(),
  items: v.array(v.object({ desc: v.string(), qty: v.number(), price: v.number() })),
  subtotal: v.number(),
  ppn: v.number(),
  pphType: v.optional(v.union(v.literal("21"), v.literal("23"), v.literal("none"))),
  pph: v.number(),
  materai: v.number(),
  total: v.number(),
  taxInvoiceNumber: v.optional(v.string()),    // "Faktur Pajak" if PKP
  status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("overdue")),
  pdfUrl: v.optional(v.string()),
}).index("by_workspace_status", ["workspaceId", "status"])
  .index("by_client", ["clientId"]),

time_entries: defineTable({
  engagementId: v.id("engagements"),
  userId: v.id("users"),
  startedAt: v.number(),
  durationSec: v.number(),
  description: v.string(),
  billable: v.boolean(),
  rate: v.optional(v.number()),
}).index("by_engagement_time", ["engagementId", "startedAt"]),

risk_assessments: defineTable({
  workspaceId: v.id("workspaces"),
  engagementId: v.optional(v.id("engagements")),
  template: v.string(),                        // "project-pm", "compliance", "legal-contract"
  scores: v.any(),
  mitigations: v.any(),
}).index("by_workspace", ["workspaceId"]),

leads: defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  source: v.string(),
  stage: v.union(v.literal("new"), v.literal("qualified"), v.literal("proposal"), v.literal("won"), v.literal("lost")),
  estValue: v.optional(v.number()),
  aiScore: v.optional(v.number()),
  nextAction: v.optional(v.string()),
  nextActionAt: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_workspace_stage", ["workspaceId", "stage"]),

lead_activities: defineTable({
  leadId: v.id("leads"),
  type: v.string(),                            // "call", "email", "meeting", "proposal-sent"
  body: v.string(),
  createdAt: v.number(),
}).index("by_lead_time", ["leadId", "createdAt"]),
```

## AI integration points

| Feature | Tier | Prompt outline |
|---|---|---|
| `proposal-fill` | mid | Input: brief + section template + voice/firm-style → output: per-section content + suggested pricing tiers |
| `contract-review` | flagship | Input: incoming contract text → output: `{ summary, riskFlags, suggestedRedlines, missingClauses }` |
| `contract-generate` | mid | Input: template + variables → output: full contract text in ID legal voice |
| `doc-extract-key-terms` | mid | Input: doc text → output: `{ parties, effectiveDate, expiry, obligations[], $$amounts[], terminationTriggers[] }` |
| `doc-risk-flag` | mid | Input: doc + context → output: array of `{ severity, kind, location, explanation }` |
| `meeting-summarize` | mid | Input: transcript → output: `{ minutes (markdown), keyDecisions, openQuestions }` |
| `meeting-followup` | nano | Input: minutes + attendee list → output: per-attendee email draft (action items relevant to them) |
| `deck-outline` | mid | Input: project brief → output: McKinsey-style outline (problem-solution tree, hypothesis, recommendations) |
| `deck-slide-write` | mid | Input: outline + slide-position → output: `{ title, narrative, talkTrack, dataPointSuggestions[] }` |
| `kb-search` | nano | Vector search `knowledge_items` → return top-N with snippets |
| `lead-qualify` | nano | Input: lead profile + activities → output: `{ score 0-100, nextAction, urgency }` |

## Source map

| Component | Source |
|---|---|
| Block editor (proposals, contracts, KB notes) | `notion-page-clone/src/slices/editor/` |
| Database views (CRM kanban, deliverables, invoices) | `notion-page-clone/src/slices/databases/` |
| Comments threaded (client portal feedback) | `notion-page-clone/src/slices/comments/` |
| ThreeColumnLayout | `superspace/frontend/shared/ui/layout/container/three-column/` |
| ResponsiveDashboardShell | `superspace/frontend/shared/ui/layout/dashboard/` |
| PDF gen for proposal/contract/invoice/deck | `react-pdf` + custom (NEW) |
| Deck export to PPTX | `pptxgenjs` (NEW dep) |
| E-signature primitive | NEW (canvas signature pad + audit log; defer DocuSign integration to Pro tier) |
| Audio transcription | NEW (Convex action calling Deepgram or Whisper API) |

## Preview wiring

- `previewPath` (public): `/preview/templates/konsultan-os/public` — desktop, client portal demo
- `adminPreviewPath`: `/preview/templates/konsultan-os/admin` — desktop, proposal editor demo
- `defaultSurface`: `admin`

Assembler config:

- Variant: `solo-consultant` | `boutique-firm` | `agency` | `legal-solo`
- Add-ons: `client-portal` · `e-signature` · `meeting-transcription` · `pajak-id` · `bilingual-deck`

## Differentiator vs competition

| Competitor | Their thing | Our wedge |
|---|---|---|
| Notion + Google Workspace | DIY but no AI integration | All-in-one + AI native + ID legal/tax |
| Better Proposals / PandaDoc | Proposal SaaS, $35-65/mo, EN | Plus contract gen + meeting + KB + ID-tax |
| Clio / Practice Panther | Legal practice mgmt, $50+/mo | Broader (any consulting), self-host, ID legal templates |
| Mekari Talenta + Jurnal | ID-aware billing | Plus knowledge work workflow (proposal/deck/meeting) |
| QuickBooks ID | Accounting | We're work-management; integrate, not replace |

## Open questions

- **E-signature legal weight ID** — UU ITE valid jika "tanda tangan elektronik tersertifikasi" (PSrE seperti BeyondID, Privy). Build basic + recommend Privy/BeyondID integration for legal-binding tier.
- **Meeting transcription** — self-host Whisper (cost-server-heavy) vs Deepgram API (paid, easy)? Start API, document self-host as advanced.
- **Faktur Pajak (e-Faktur DJP integration)** — manual numbering at start; integrate with DJP later (Pro tier, requires PKP status).
- **Client portal auth** — magic-link only (low friction) vs require Convex Auth user account (more secure, more friction)? Start magic-link, allow upgrade.

## Status checklist

Foundation (per `_shared-foundation.md`):
- [ ] Auth, AI router, base schema, design system, i18n, shell, three-column, billing-id, resend, pdf-extract, vector

Modules:
- [ ] client-portal
- [ ] proposal-builder
- [ ] contract-gen
- [ ] doc-intelligence
- [ ] project-tracker
- [ ] meeting-workspace
- [ ] kb-internal
- [ ] deck-builder
- [ ] invoice-time
- [ ] risk-templates
- [ ] crm-lite
- [ ] public-firm

Kitab integration:
- [ ] Preview routes (public + admin)
- [ ] Entry in `lib/content/templates.ts`
- [ ] Public/Admin tab toggle
- [ ] Assembler config
- [ ] Showcase page `/templates/konsultan-os`

Distribution:
- [ ] X thread
- [ ] Carousel ID
- [ ] Loom walkthrough
- [ ] Blog post (technical: PajakAware deep-dive)
- [ ] Newsletter blast
