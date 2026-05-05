---
slug: wirausaha-os
title_en: UKM Operations Hub
title_id: Wirausaha OS
status: planned
priority: 1
tagline_en: Multi-business ops, native Indonesian, AI-augmented.
tagline_id: Operasional banyak unit usaha jadi satu — AI bantu narasi laporan.

segments:
  primary: [ukm-multi-unit]
  secondary: [hospitality, freelancer-jasa, klinik-kecil]

surfaces:
  public:
    preview_path: /preview/templates/wirausaha-os/public
    default_view: mobile
  admin:
    preview_path: /preview/templates/wirausaha-os/admin
    default_view: desktop
  default_surface: admin

shared_deps:
  - auth
  - ai-router
  - convex-base
  - design-system
  - shell
  - three-column
  - billing-id
  - resend
  - whatsapp-bot

source_map:
  - from: superspace/frontend/slices/_templates
    to: frontend/slices/_template-base
  - from: superspace/frontend/shared/ui/layout/dashboard
    to: frontend/shared/ui/layout/dashboard
  - from: superspace/frontend/shared/ui/layout/container/three-column
    to: frontend/shared/ui/layout/container/three-column
  - from: superspace/frontend/shared/lib/features
    to: frontend/shared/lib/features
  - from: cescadesigns/components/cummon/hero-section.tsx
    to: frontend/slices/public-storefront/components/HeroSection.tsx

modules:
  - { id: multi-business,    name: "Multi-business Registry",        surface: [admin],         status: planned }
  - { id: lodging,           name: "Property / Lodging",             surface: [admin, public], status: planned }
  - { id: inventory,         name: "Inventory & Stock",              surface: [admin],         status: planned }
  - { id: mini-crm,          name: "Mini-CRM (pelanggan)",           surface: [admin],         status: planned }
  - { id: invoice-quote,     name: "Invoice & Quotation",            surface: [admin],         status: planned }
  - { id: ops-log,           name: "Daily Operations Log",           surface: [admin],         status: planned }
  - { id: staff,             name: "Staff & Schedule",               surface: [admin],         status: planned }
  - { id: sop-repo,          name: "SOP Repository (AI search)",     surface: [admin],         status: planned }
  - { id: reporting,         name: "Reporting Engine",               surface: [admin],         status: planned }
  - { id: expense,           name: "Expense Tracking + OCR",         surface: [admin],         status: planned }
  - { id: ai-cs,             name: "AI Customer Service",            surface: [admin],         status: planned }
  - { id: storefront-public, name: "Public mini-site / booking",     surface: [public],        status: planned }

schema_tables:
  - businesses
  - units
  - bookings
  - guests
  - inventory_items
  - inventory_movements
  - customers
  - invoices
  - quotations
  - ops_log_entries
  - staff
  - shifts
  - attendance
  - sops
  - reports
  - expenses
  - cs_templates

ai_features:
  - sop-search           # nano tier
  - report-narration     # mid tier
  - cs-reply-templates   # nano tier
  - expense-categorize   # nano tier (OCR struk)
  - methodology-anomaly  # mid tier (revenue dip narration)

market_size_id: large
differentiator: |
  Self-hosted, multi-business native, ID-tax aware (PPN/PPh + materai), WA-bot
  built-in. Murah dibanding Mekari/Jurnal/Moka. Dibangun dari pengalaman Zian Inn.
---

# T4 — Wirausaha OS

> "Pak Bayu punya 3 kos di Jogja + 1 minimarket. Tiap pagi cek 4 grup WA berbeda buat tau setoran dan stok. Wirausaha OS jadi satu dashboard — laporan harian auto-narasi AI, broadcast pengumuman ke tamu kos, restock alert ke supplier. Setor sekali, semua sub-bisnis ter-update."

## Target segment detail

- **Pengusaha UKM multi-unit**: pemilik 2-10 outlet/properti yang masih jalan pakai grup WA + Excel terpisah.
- **Concrete**: pemilik kos/kontrakan, pemilik 2-3 cafe, pemilik kelontong + warung makan, pemilik laundry kiloan multi-cabang.
- **Indonesia**: ~64M unit UKM (BPS 2023). Yang multi-unit segment kerja-keras estimasi 5-10M.
- **Current alternatives**: Mekari (Rp 200k+/bln, terlalu enterprise), Jurnal/Moka (per-fitur mahal), atau Excel + WA (gratis tapi ga scale).

## Module spec

| ID | Name | Surface | Short desc |
|---|---|---|---|
| multi-business | Multi-business Registry | admin | Owner punya N businesses, tiap business punya N units (kamar/cabang/produk-line). Superspace pattern. |
| lodging | Property / Lodging | admin + public | Booking calendar, room status (clean/dirty/occupied), check-in/out flow, guest record. Public surface = booking widget yang bisa di-embed atau standalone mini-site. |
| inventory | Inventory & Stock | admin | Item master, supplier list, stock movement log, low-stock alert ke WA owner. |
| mini-crm | Mini-CRM | admin | Customer record + transaction history, segmentation (loyal/dormant/new), broadcast WA terjadwal. |
| invoice-quote | Invoice & Quotation | admin | Template Indonesia (PPN 11%, materai 10k otomatis di atas Rp 5jt), PDF export, share via WA/email. |
| ops-log | Daily Operations Log | admin | Staff entri cepat via WA-bot atau form mobile (omzet harian, jumlah tamu, expense ad-hoc). Auto-aggregate ke reporting. |
| staff | Staff & Schedule | admin | Shift planner, attendance check-in (geofence opsional), payroll sederhana. |
| sop-repo | SOP Repository | admin | Versioned SOP per role + AI semantic search ("apa SOP komplain AC mati?"). |
| reporting | Reporting Engine | admin | Daily/weekly/monthly auto-generate. AI narasi insight ("revenue turun 12% — occupancy week 3 turun"). |
| expense | Expense Tracking | admin | Foto struk → OCR → kategorisasi otomatis (`makan`, `transport`, `inventory-resto`). |
| ai-cs | AI Customer Service | admin | Library balasan WA / Tokopedia / Shopee per-bisnis, auto-suggest dari context pertanyaan. |
| storefront-public | Public mini-site | public | Per-business landing: hero + booking widget (kos/lodging) atau katalog (retail/F&B). Embed iframe atau subdomain. |

## Public surface

Routes (relative to template root, served at owner's chosen domain or subdomain):

| Route | File | Purpose |
|---|---|---|
| `/` | `app/(public)/page.tsx` | Hero + business profile + CTA (book/order/contact) |
| `/booking` | `app/(public)/booking/page.tsx` | Lodging booking widget (kalender + form) |
| `/katalog` | `app/(public)/katalog/page.tsx` | Retail/F&B item grid + harga |
| `/sop-publik/[slug]` | `app/(public)/sop-publik/[slug]/page.tsx` | Selected SOPs marked public (e.g. "cara check-in tamu") |
| `/kontak` | `app/(public)/kontak/page.tsx` | Form kontak + maps + WA link |

### Page placeholders

```tsx
// app/(public)/page.tsx — Hero placeholder
<HeroSection
  title={business.name}
  tagline={business.tagline_id}
  cta={{ label: "Book Sekarang", href: "/booking" }}
  bg={business.heroImage}
/>
<UnitGrid units={units} />
<TestimonialCarousel quotes={business.testimonials} />
<ContactCTA whatsapp={business.whatsapp} />
```

```tsx
// app/(public)/booking/page.tsx — Booking placeholder
<BookingCalendar units={units} availability={availability} />
<BookingForm onSubmit={createBooking} />
```

## Admin surface

Routes under `/dashboard`:

| Route | File | Purpose |
|---|---|---|
| `/dashboard` | `app/(admin)/dashboard/page.tsx` | KPI overview + quick actions |
| `/dashboard/businesses` | `.../businesses/page.tsx` | List + add/edit business |
| `/dashboard/businesses/[id]/units` | `.../[id]/units/page.tsx` | Units (kamar/cabang/SKU) per business |
| `/dashboard/lodging` | `.../lodging/page.tsx` | Bookings, room board, check-in/out |
| `/dashboard/inventory` | `.../inventory/page.tsx` | Stock, movements, low-stock alerts |
| `/dashboard/customers` | `.../customers/page.tsx` | Mini-CRM list + segments |
| `/dashboard/invoices` | `.../invoices/page.tsx` | Invoice list + create + PDF |
| `/dashboard/quotations` | `.../quotations/page.tsx` | Quotation list + create |
| `/dashboard/ops-log` | `.../ops-log/page.tsx` | Today's operational entries |
| `/dashboard/staff` | `.../staff/page.tsx` | Staff list + shifts + attendance |
| `/dashboard/sop` | `.../sop/page.tsx` | SOP repo + AI search |
| `/dashboard/reports` | `.../reports/page.tsx` | Generated reports + AI narration |
| `/dashboard/expenses` | `.../expenses/page.tsx` | Expense list + receipt OCR upload |
| `/dashboard/cs` | `.../cs/page.tsx` | CS template library + AI assist |
| `/dashboard/settings/ai` | `.../settings/ai/page.tsx` | Model picker per feature, system prompt edit |

### Page placeholders

```tsx
// app/(admin)/dashboard/page.tsx — KPI overview
<ThreeColumnLayout
  preset="ukm-ops"
  left={<BusinessSwitcher />}
  center={
    <>
      <KPIRow stats={[occupancy, revenue, lowStock, openComplaints]} />
      <QuickActions actions={["new-booking", "log-omzet", "scan-receipt"]} />
      <ReportingPreview latest={latestReport} />
    </>
  }
  right={<AIAssistant feature="ops-overview" />}
/>
```

```tsx
// app/(admin)/dashboard/sop/page.tsx — SOP search placeholder
<div className="flex gap-4">
  <SOPTreeSidebar />
  <main>
    <AISearchBar feature="sop-search" placeholder="Apa SOP kalau tamu komplain AC mati?" />
    <SOPViewer sop={selected} versions={versions} />
  </main>
</div>
```

## Convex schema sketch

```ts
businesses: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  name: v.string(),
  type: v.union(v.literal("lodging"), v.literal("retail"), v.literal("fnb"), v.literal("services"), v.literal("mixed")),
  whatsapp: v.optional(v.string()),
  publicDomain: v.optional(v.string()),
  heroImage: v.optional(v.string()),
  taglineId: v.optional(v.string()),
}).index("by_workspace", ["workspaceId"]).index("by_slug", ["slug"]),

units: defineTable({
  businessId: v.id("businesses"),
  code: v.string(),                              // "K-101", "Cabang-Sanur"
  name: v.string(),
  status: v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance")),
  meta: v.optional(v.any()),                     // type-specific (room amenities, sku attrs)
}).index("by_business", ["businessId"]),

bookings: defineTable({
  businessId: v.id("businesses"),
  unitId: v.id("units"),
  guestId: v.id("guests"),
  checkIn: v.number(),
  checkOut: v.number(),
  status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("checked-in"), v.literal("checked-out"), v.literal("cancelled")),
  total: v.number(),
}).index("by_business_time", ["businessId", "checkIn"])
  .index("by_unit", ["unitId"]),

guests: defineTable({
  businessId: v.id("businesses"),
  name: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),
  ktp: v.optional(v.string()),                   // hashed
}).index("by_business_phone", ["businessId", "phone"]),

inventory_items: defineTable({
  businessId: v.id("businesses"),
  sku: v.string(),
  name: v.string(),
  unit: v.string(),                              // "pcs", "kg"
  stock: v.number(),
  minStock: v.number(),
  costPrice: v.number(),
  sellPrice: v.number(),
}).index("by_business_sku", ["businessId", "sku"])
  .index("by_business_low", ["businessId", "stock"]),

inventory_movements: defineTable({
  itemId: v.id("inventory_items"),
  type: v.union(v.literal("in"), v.literal("out"), v.literal("adjust")),
  qty: v.number(),
  note: v.optional(v.string()),
  actorId: v.id("users"),
  createdAt: v.number(),
}).index("by_item_time", ["itemId", "createdAt"]),

invoices: defineTable({
  businessId: v.id("businesses"),
  number: v.string(),
  customerId: v.optional(v.id("customers")),
  items: v.array(v.object({ desc: v.string(), qty: v.number(), price: v.number() })),
  subtotal: v.number(),
  ppn: v.number(),
  materai: v.number(),
  total: v.number(),
  status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("overdue")),
  pdfUrl: v.optional(v.string()),
}).index("by_business_status", ["businessId", "status"])
  .index("by_business_number", ["businessId", "number"]),

ops_log_entries: defineTable({
  businessId: v.id("businesses"),
  unitId: v.optional(v.id("units")),
  staffId: v.id("staff"),
  type: v.string(),                              // "omzet-harian", "stok-opname", "incident"
  payload: v.any(),
  createdAt: v.number(),
}).index("by_business_time", ["businessId", "createdAt"]),

sops: defineTable({
  businessId: v.id("businesses"),
  slug: v.string(),
  title: v.string(),
  body: v.string(),                              // markdown
  isPublic: v.boolean(),
  embedding: v.array(v.float64()),               // for vector search
  version: v.number(),
}).index("by_business_slug", ["businessId", "slug"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["businessId"] }),

reports: defineTable({
  businessId: v.id("businesses"),
  period: v.string(),                            // "2026-04" / "2026-W18" / "2026-04-30"
  type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  metrics: v.any(),
  narration: v.optional(v.string()),             // AI-generated
  createdAt: v.number(),
}).index("by_business_period", ["businessId", "period"]),

// staff, shifts, attendance, customers, expenses, cs_templates similar pattern
```

## AI integration points

| Feature | Tier | Prompt outline |
|---|---|---|
| `sop-search` | nano | Embed query → vector search SOPs filtered by `businessId` → return top 3 + extractive answer |
| `report-narration` | mid | Input: metrics object + previous-period delta → output: 3-paragraph narration in Bahasa Indonesia, bullet anomalies, suggest action |
| `cs-reply-templates` | nano | Input: incoming WA/marketplace message + business context → output: 3 reply variants (formal/friendly/apologetic) |
| `expense-categorize` | nano | Input: OCR text from receipt → output: `{ category, vendor, total, items[] }` structured |
| `methodology-anomaly` | mid | Daily cron: scan today's ops_log + yesterday → flag anomalies > 2σ → narrate to owner via WA |

## Source map

Per shared foundation `_shared-foundation.md` plus:

| Component | Source |
|---|---|
| ResponsiveDashboardShell | `superspace/frontend/shared/ui/layout/dashboard/` |
| ThreeColumnLayout | `superspace/frontend/shared/ui/layout/container/three-column/` |
| Slice templates | `superspace/frontend/slices/_templates/` |
| Hero (public) | `cescadesigns/components/cummon/hero-section.tsx` |
| Booking calendar primitives | NEW (no source — build from shadcn calendar + custom availability grid) |
| WA-bot adapter | `zianinn` (private) — extract WA send/webhook utilities |
| Invoice PDF | `react-pdf` + custom template (no source — build new w/ Indonesia tax fields) |

## Preview wiring

Kitab middle-panel will offer **Public** + **Admin** tabs (toggle).

- `previewPath` (public): `/preview/templates/wirausaha-os/public` — defaults to mobile viewport (storefront feels native on mobile)
- `adminPreviewPath`: `/preview/templates/wirausaha-os/admin` — defaults to desktop viewport (operations dashboard)
- `defaultSurface`: `admin` (the differentiator vs simple-website templates)

Right-panel inspector exposes assembler config:

- Variant: `lodging-only` | `retail-only` | `mixed-multi-business`
- Add-ons: `whatsapp-bot` · `pajak-id` · `ocr-receipt` · `cs-templates` · `public-storefront`

## Differentiator vs competition

| Competitor | Their thing | Our wedge |
|---|---|---|
| Mekari Talenta/Jurnal | Enterprise feature, Rp 250k+/mo | Self-host gratis, multi-business native |
| Moka POS | F&B/retail POS only | Plus lodging + services + SOP + reporting AI |
| Loyverse | Free POS but single-business | Multi-business + ID-tax + WA broadcast |
| Excel + WA grup | Gratis | Audit trail, AI insight, ga butuh staff yang melek tech |

## Open questions

- **WA Business API vs WA web automation** — official API mahal, web-automation rapuh. Start with web-automation behind feature flag, document upgrade path.
- **Lodging public domain** — per-business subdomain (`bookingsamata.wirausaha.app`) atau owner's own custom domain? Custom domain better but more setup. Start subdomain, add custom-domain Pro tier.
- **Tax accuracy** — PPN 11% hardcoded saat ini. Auto-update via Convex cron polling DJP? Or manual config per workspace?
- **Embedding cost** — vector index every SOP. ~Rp 100/SOP at OpenAI text-embedding-3-small. Acceptable for typical 50-200 SOPs/business.

## Status checklist

Foundation:
- [ ] Auth ready
- [ ] AI router ready
- [ ] Convex base schema
- [ ] Design system ported
- [ ] WA adapter (private repo extract)

Modules (template-specific):
- [ ] multi-business
- [ ] lodging
- [ ] inventory
- [ ] mini-crm
- [ ] invoice-quote
- [ ] ops-log
- [ ] staff
- [ ] sop-repo
- [ ] reporting
- [ ] expense
- [ ] ai-cs
- [ ] storefront-public

Kitab integration:
- [ ] Preview routes (public + admin) scaffolded
- [ ] Entry in `lib/content/templates.ts`
- [ ] Public/Admin tab toggle in `PreviewPane`
- [ ] Assembler config schema
- [ ] Showcase page at `/templates/wirausaha-os`

Distribution:
- [ ] X thread drafted
- [ ] Carousel ID
- [ ] Loom walkthrough
- [ ] Blog post (technical)
- [ ] Newsletter blast
