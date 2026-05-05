---
slug: riset-kit
title_en: Research Workspace
title_id: Riset Kit
status: planned
priority: 4
tagline_en: Document QA + literature review + writing pipeline. NotebookLM that respects EYD.
tagline_id: Baca PDF, review literatur, draft tesis — semua di satu tempat, paham bahasa akademik Indonesia.

segments:
  primary: [peneliti, mahasiswa-pascasarjana, ngo-think-tank]
  secondary: [jurnalis-investigatif, asn-kajian, dosen, self-publisher]

surfaces:
  public:
    preview_path: /preview/templates/riset-kit/public
    default_view: desktop
  admin:
    preview_path: /preview/templates/riset-kit/admin
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
  - pdf-extract
  - vector-search

source_map:
  - from: notion-page-clone/src/slices/editor
    to: frontend/slices/draft-editor
  - from: notion-page-clone/src/slices/workspace-sidebar
    to: frontend/slices/project-sidebar
  - from: notion-page-clone/src/slices/command-palette
    to: frontend/slices/command-palette
  - from: notion-page-clone/src/slices/comments
    to: frontend/slices/collab-comments
  - from: superspace/frontend/shared/ui/layout/container/three-column
    to: frontend/shared/ui/layout/container/three-column

modules:
  - { id: doc-library,        name: "Document Library (PDF/DOCX, OCR)", surface: [admin],         status: planned }
  - { id: ai-reader,          name: "AI Reader (PDF + side chat)",      surface: [admin],         status: planned }
  - { id: lit-review,         name: "Literature Review Assistant",      surface: [admin],         status: planned }
  - { id: citation,           name: "Citation Manager (BibTeX/APA/etc)", surface: [admin],        status: planned }
  - { id: smart-notes,        name: "Smart Notes (backlinks, concept map)", surface: [admin],     status: planned }
  - { id: project-workspace,  name: "Per-research-project Workspace",   surface: [admin],         status: planned }
  - { id: collaboration,      name: "Lab/Team Collaboration",           surface: [admin],         status: planned }
  - { id: outline-draft,      name: "Outline → Draft Pipeline",         surface: [admin],         status: planned }
  - { id: methodology-check,  name: "Methodology Checker",              surface: [admin],         status: planned }
  - { id: id-academic-mode,   name: "Bahasa Indonesia Academic Mode",   surface: [admin],         status: planned }
  - { id: public-publication, name: "Public Publication Page",          surface: [public],        status: planned }

schema_tables:
  - projects
  - documents
  - doc_chunks
  - doc_highlights
  - notes
  - note_links
  - citations
  - drafts
  - draft_sections
  - lit_review_matrices
  - methodology_reviews
  - publications
  - project_members

ai_features:
  - doc-qa                  # mid tier (RAG over single doc)
  - lit-synthesis           # flagship tier (10+ paper sintesis)
  - citation-extract        # nano tier (auto-extract from PDF)
  - paraphrase-eyd          # nano tier (Indonesian academic paraphrase)
  - methodology-review      # flagship tier (logika metode)
  - outline-expand          # mid tier (section draft from outline + sources)
  - concept-map             # nano tier (extract concepts + links)

market_size_id: medium
differentiator: |
  NotebookLM/Elicit equivalent yang Indonesian-first: paham EYD, terminologi
  akademik ID, citation style yang umum di Indonesia (Chicago + APA),
  collaboration mode untuk lab/tim riset.
---

# T2 — Riset Kit

> "Bayu, mahasiswa S2 ekonomi UGM. Lagi nulis tesis tentang dampak digitalisasi UMKM. Punya 47 paper PDF di folder, beberapa scan kualitas jelek. Sebelumnya: Mendeley + Word + ChatGPT (paste manual). Sekarang upload semua → AI Reader buat tanya per-paper, Lit Review Assistant buat matrix komparasi, Outline → Draft Pipeline buat expand bab dengan sitasi otomatis. Bahasa Indonesia, paham terminologi 'pendekatan kualitatif' bukan 'qualitative approach'."

## Target segment detail

- **Mahasiswa S2/S3**: thesis/disertasi writers, currently using fragmented tools.
- **Peneliti / dosen**: paper drafting + bimbingan mahasiswa.
- **NGO / think tank**: policy paper writers yang sintesis multi-source.
- **Jurnalis investigatif**: corpus research dari leaked docs, public records.
- **Indonesia**: ~500K mahasiswa pascasarjana aktif + ~250K dosen + NGO/think tank ~10K aktif.
- **Current alternatives**: Mendeley (gratis tapi sempit), NotebookLM (gratis tapi EN-centric, no writing pipeline), Elicit ($20+/mo, EN), Word + ChatGPT manual.

## Module spec

| ID | Name | Surface | Short desc |
|---|---|---|---|
| doc-library | Document Library | admin | Upload PDF/DOCX, auto-extract text, OCR untuk scanned, vector search across corpus per-project. |
| ai-reader | AI Reader | admin | Buka PDF dengan side-panel chat, tanya jawab in-context, highlight + note + quote extract. |
| lit-review | Literature Review Assistant | admin | Pilih N paper → AI generate matrix komparasi (tahun, metode, finding, gap). Export ke .docx/.xlsx. |
| citation | Citation Manager | admin | Auto-extract metadata dari PDF, manual edit, export BibTeX/APA/Chicago/IEEE/Vancouver, integrasi Zotero. |
| smart-notes | Smart Notes | admin | Roam/Obsidian-style backlink, [[double-bracket]] linking, auto-tag, concept map render. |
| project-workspace | Project Workspace | admin | Per-project: dataset (link), draft, references, milestone, kanban. |
| collaboration | Collaboration | admin | Role-based access (owner/co-author/reviewer/student), comment thread per-paragraph. |
| outline-draft | Outline → Draft Pipeline | admin | Outline (H1/H2/H3) → AI expand per section, auto-suggest citations from project's citation library. |
| methodology-check | Methodology Checker | admin | Paste research design → AI flag logical gaps, suggest alternative methods (cocok untuk dosen yang bimbing). |
| id-academic-mode | ID Academic Mode | admin | Toggle: paraphrase + grammar yang aware EYD, terminologi bidang (ekonomi, hukum, kedokteran, dll). |
| public-publication | Public Publication Page | public | Optional: profile peneliti + publication list (auto-pull dari citations + drafts published). |

## Public surface

Optional, opt-in per workspace:

| Route | File | Purpose |
|---|---|---|
| `/` | `app/(public)/page.tsx` | Researcher profile + bio + ORCID + affiliation |
| `/publications` | `app/(public)/publications/page.tsx` | Publication list (auto from `publications` table) |
| `/publications/[slug]` | `app/(public)/publications/[slug]/page.tsx` | Single paper landing — abstract, BibTeX, PDF link, related |
| `/projects` | `app/(public)/projects/page.tsx` | Public-marked research projects |

### Page placeholders

```tsx
// app/(public)/page.tsx
<ResearcherHero profile={researcher} />
<PublicationStats counts={{ papers, citations, hIndex }} />
<RecentPublications items={recent} />
<ProjectsTeaser items={publicProjects} />
```

```tsx
// app/(public)/publications/[slug]/page.tsx
<PublicationHeader pub={pub} />
<AbstractSection abstract={pub.abstract} />
<CitationCopy formats={["BibTeX", "APA", "Chicago", "IEEE"]} />
<RelatedPublications items={related} />
```

## Admin surface

Routes under `/r` (research):

| Route | File | Purpose |
|---|---|---|
| `/r` | `app/(admin)/r/page.tsx` | Project list + recent activity |
| `/r/[project]/library` | `.../[project]/library/page.tsx` | Document library (upload, list, search) |
| `/r/[project]/library/[doc]` | `.../[project]/library/[doc]/page.tsx` | AI Reader (PDF + side chat + highlights) |
| `/r/[project]/citations` | `.../[project]/citations/page.tsx` | Citation manager + export |
| `/r/[project]/notes` | `.../[project]/notes/page.tsx` | Smart notes graph + edit |
| `/r/[project]/lit-review` | `.../[project]/lit-review/page.tsx` | Lit review matrix builder |
| `/r/[project]/drafts` | `.../[project]/drafts/page.tsx` | Drafts list (chapter/section) |
| `/r/[project]/drafts/[slug]` | `.../[project]/drafts/[slug]/page.tsx` | Outline → draft editor + AI expand |
| `/r/[project]/methodology` | `.../[project]/methodology/page.tsx` | Methodology design + AI review |
| `/r/[project]/members` | `.../[project]/members/page.tsx` | Team mgmt |
| `/r/settings/ai` | `.../settings/ai/page.tsx` | Model picker per feature, EYD mode toggle, terminology dictionary |

### Page placeholders

```tsx
// app/(admin)/r/[project]/library/[doc]/page.tsx — AI Reader
<ThreeColumnLayout
  preset="ai-reader"
  left={<DocOutlineNav doc={doc} />}
  center={<PdfViewer url={doc.fileUrl} highlights={highlights} onHighlight={addHighlight} />}
  right={
    <Tabs defaultValue="chat">
      <TabsList>
        <TabsTrigger value="chat">Chat (RAG)</TabsTrigger>
        <TabsTrigger value="highlights">Highlights</TabsTrigger>
        <TabsTrigger value="meta">Citation</TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <DocChat docId={doc._id} feature="doc-qa" />
      </TabsContent>
      <TabsContent value="highlights">
        <HighlightList items={highlights} onQuoteToNote={quoteToNote} />
      </TabsContent>
      <TabsContent value="meta">
        <CitationEditor docId={doc._id} />
      </TabsContent>
    </Tabs>
  }
/>
```

```tsx
// app/(admin)/r/[project]/lit-review/page.tsx
<LitReviewBuilder
  projectId={projectId}
  pickPapers={(ids) => loadPapers(ids)}
  onSynthesize={async (papers) => {
    const matrix = await api.ai.litSynthesis({ papers, columns: ["tahun","metode","finding","gap"] });
    return matrix;
  }}
/>
<LitReviewMatrix matrix={current} editable />
<ExportToolbar formats={["docx","xlsx","csv"]} />
```

```tsx
// app/(admin)/r/[project]/drafts/[slug]/page.tsx
<ThreeColumnLayout
  preset="outline-draft"
  left={<OutlineTree sections={draft.sections} onSelect={setActive} />}
  center={<BlockEditor sectionId={active._id} />}
  right={
    <Tabs defaultValue="expand">
      <TabsList>
        <TabsTrigger value="expand">AI Expand</TabsTrigger>
        <TabsTrigger value="cite">Suggest Cite</TabsTrigger>
        <TabsTrigger value="eyd">EYD Check</TabsTrigger>
      </TabsList>
      <TabsContent value="expand">
        <ExpandPanel sectionId={active._id} sources={citations} />
      </TabsContent>
      <TabsContent value="cite">
        <CitationSuggest text={selectedText} library={citations} />
      </TabsContent>
      <TabsContent value="eyd">
        <EydReview text={fullText} />
      </TabsContent>
    </Tabs>
  }
/>
```

## Convex schema sketch

```ts
projects: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  field: v.optional(v.string()),               // "ekonomi", "hukum", "kedokteran"
  status: v.union(v.literal("active"), v.literal("paused"), v.literal("done")),
  isPublic: v.boolean(),
  createdAt: v.number(),
}).index("by_workspace_slug", ["workspaceId", "slug"]),

documents: defineTable({
  projectId: v.id("projects"),
  title: v.string(),
  fileUrl: v.string(),
  pageCount: v.number(),
  ocrApplied: v.boolean(),
  citationId: v.optional(v.id("citations")),
  createdAt: v.number(),
}).index("by_project", ["projectId"]),

doc_chunks: defineTable({
  documentId: v.id("documents"),
  page: v.number(),
  text: v.string(),
  embedding: v.array(v.float64()),
}).index("by_document_page", ["documentId", "page"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["documentId"] }),

doc_highlights: defineTable({
  documentId: v.id("documents"),
  authorId: v.id("users"),
  page: v.number(),
  rect: v.any(),                               // viewport coords
  quote: v.string(),
  note: v.optional(v.string()),
  color: v.string(),
  createdAt: v.number(),
}).index("by_document", ["documentId"]),

notes: defineTable({
  projectId: v.id("projects"),
  authorId: v.id("users"),
  title: v.string(),
  body: v.string(),                            // markdown w/ [[link]]
  tags: v.array(v.string()),
  embedding: v.optional(v.array(v.float64())),
  createdAt: v.number(),
}).index("by_project", ["projectId"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["projectId"] }),

note_links: defineTable({
  fromNoteId: v.id("notes"),
  toNoteId: v.id("notes"),
}).index("by_from", ["fromNoteId"]).index("by_to", ["toNoteId"]),

citations: defineTable({
  projectId: v.id("projects"),
  type: v.string(),                            // "article", "book", "chapter", "report"
  authors: v.array(v.string()),
  title: v.string(),
  year: v.number(),
  source: v.optional(v.string()),
  doi: v.optional(v.string()),
  bibtex: v.string(),
  documentId: v.optional(v.id("documents")),
}).index("by_project", ["projectId"]).index("by_doi", ["doi"]),

drafts: defineTable({
  projectId: v.id("projects"),
  slug: v.string(),
  title: v.string(),
  type: v.union(v.literal("thesis"), v.literal("paper"), v.literal("policy-brief"), v.literal("report")),
  status: v.union(v.literal("draft"), v.literal("review"), v.literal("done")),
}).index("by_project_slug", ["projectId", "slug"]),

draft_sections: defineTable({
  draftId: v.id("drafts"),
  parentId: v.optional(v.id("draft_sections")),
  order: v.number(),
  level: v.number(),                           // 1=H1, 2=H2, ...
  title: v.string(),
  body: v.string(),
  citations: v.array(v.id("citations")),
}).index("by_draft_order", ["draftId", "order"]),

lit_review_matrices: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  papers: v.array(v.id("citations")),
  columns: v.array(v.string()),
  cells: v.any(),                              // { [paperId]: { [column]: text } }
  createdAt: v.number(),
}).index("by_project", ["projectId"]),

methodology_reviews: defineTable({
  projectId: v.id("projects"),
  description: v.string(),
  aiCritique: v.optional(v.string()),
  flags: v.array(v.string()),
  reviewedAt: v.number(),
}).index("by_project", ["projectId"]),

publications: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  title: v.string(),
  authors: v.array(v.string()),
  year: v.number(),
  venue: v.string(),
  abstract: v.string(),
  pdfUrl: v.optional(v.string()),
  bibtex: v.string(),
  citationCount: v.optional(v.number()),
  isPublic: v.boolean(),
}).index("by_workspace_slug", ["workspaceId", "slug"]),

project_members: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  role: v.union(v.literal("owner"), v.literal("co-author"), v.literal("reviewer"), v.literal("student")),
}).index("by_project_user", ["projectId", "userId"]),
```

## AI integration points

| Feature | Tier | Prompt outline |
|---|---|---|
| `doc-qa` | mid | RAG over `doc_chunks` filtered by `documentId`. System: "Cite page numbers. Quote verbatim if asked." |
| `lit-synthesis` | flagship | Input: N papers (abstracts + key sections) + columns → output: matrix JSON. Cite paper IDs. |
| `citation-extract` | nano | Input: PDF first page text → output: `{ authors, title, year, venue, doi }` structured |
| `paraphrase-eyd` | nano | Input: text + bidang → output: paraphrase respecting EYD + bidang terminology dictionary |
| `methodology-review` | flagship | Input: methodology description → output: `{ strengths, gaps, alternatives, references }` |
| `outline-expand` | mid | Input: section title + outline + relevant citations → output: 200-500 word draft with `[CITE:id]` markers |
| `concept-map` | nano | Input: notes corpus → output: graph nodes/edges from `[[backlinks]]` + AI-extracted concepts |

## Source map

| Component | Source |
|---|---|
| Block editor + slash menu | `notion-page-clone/src/slices/editor/` |
| Workspace sidebar (project tree) | `notion-page-clone/src/slices/workspace-sidebar/` |
| Multi-block selection | `notion-page-clone/src/slices/block-selection/` |
| Comments threaded | `notion-page-clone/src/slices/comments/` |
| Command palette | `notion-page-clone/src/slices/command-palette/` |
| ThreeColumnLayout | `superspace/frontend/shared/ui/layout/container/three-column/` |
| PDF viewer | NEW (use `react-pdf` + custom highlight overlay) |
| OCR | NEW (Tesseract.js for client-side scanned-PDF fallback, or Convex action calling Google Vision) |

## Preview wiring

- `previewPath` (public): `/preview/templates/riset-kit/public` — desktop, researcher profile demo
- `adminPreviewPath`: `/preview/templates/riset-kit/admin` — desktop, AI Reader demo
- `defaultSurface`: `admin` (workspace IS the product)

Assembler config:

- Variant: `solo-researcher` | `lab-team` | `ngo-policy` | `student-thesis`
- Add-ons: `ocr` · `bilingual` · `methodology-checker` · `public-publication-page` · `zotero-sync`

## Differentiator vs competition

| Competitor | Their thing | Our wedge |
|---|---|---|
| Mendeley | Citation mgmt only, gratis | Plus AI reader, lit review, drafting pipeline |
| Zotero | Citation mgmt + notes, OSS | Plus AI features, ID academic mode |
| NotebookLM | Doc QA, gratis, EN-first | Plus drafting, lit review, citation mgmt, ID-EYD |
| Elicit | Lit search + summarize, $20/mo, EN | Plus doc library, drafting, ID academic |
| Word + ChatGPT | Manual workflow | Integrated, citation auto-suggest, EYD-aware |

## Open questions

- **OCR provider** — Tesseract.js client-side (free, slower) vs Google Vision (paid, better accuracy)?
- **Vector dim** — 1536 (OpenAI ada) vs 768 (smaller models)? Trade-off cost vs storage.
- **EYD dictionary source** — KBBI scraping (legal gray) vs licensed PUEBI/EYD reference vs crowd-sourced?
- **Citation export to Word** — generate `.docx` w/ field codes (CSL JSON) or render-to-text? CSL more "real" but harder.

## Status checklist

Foundation (per `_shared-foundation.md`):
- [ ] Auth, AI router, base schema, design system, i18n, shell, three-column, pdf-extract, vector

Modules:
- [ ] doc-library
- [ ] ai-reader
- [ ] lit-review
- [ ] citation
- [ ] smart-notes
- [ ] project-workspace
- [ ] collaboration
- [ ] outline-draft
- [ ] methodology-check
- [ ] id-academic-mode
- [ ] public-publication

Kitab integration:
- [ ] Preview routes (public + admin)
- [ ] Entry in `lib/content/templates.ts`
- [ ] Public/Admin tab toggle
- [ ] Assembler config
- [ ] Showcase page `/templates/riset-kit`

Distribution:
- [ ] X thread
- [ ] Carousel ID
- [ ] Loom walkthrough
- [ ] Blog post
- [ ] Newsletter blast
