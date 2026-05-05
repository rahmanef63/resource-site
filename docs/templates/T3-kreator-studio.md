---
slug: kreator-studio
title_en: Content Creator Hub
title_id: Kreator Studio
status: planned
priority: 5
tagline_en: Multi-channel planner + voice trainer + repurposing engine + carousel maker.
tagline_id: Notion + Buffer + Canva jadi satu, AI yang ngerti gaya tulis lo dan konteks Indonesia.

segments:
  primary: [content-creator, copywriter, ghostwriter]
  secondary: [agency-konten, dakwah-creator, edupreneur]

surfaces:
  public:
    preview_path: /preview/templates/kreator-studio/public
    default_view: desktop
  admin:
    preview_path: /preview/templates/kreator-studio/admin
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
  - resend
  - vector-search

source_map:
  - from: notion-page-clone/src/slices/databases
    to: frontend/slices/content-planner-databases
  - from: notion-page-clone/src/slices/editor
    to: frontend/slices/script-editor
  - from: notion-page-clone/src/slices/command-palette
    to: frontend/slices/command-palette
  - from: superspace/frontend/shared/ui/layout/dashboard
    to: frontend/shared/ui/layout/dashboard
  - from: rahmanef.com/frontend/shared/ui
    to: frontend/shared/ui/motion

modules:
  - { id: planner,            name: "Multi-channel Content Planner",   surface: [admin],         status: planned }
  - { id: voice-trainer,      name: "Voice & Tone Trainer",            surface: [admin],         status: planned }
  - { id: script-gen,         name: "Script Generator (YT/Pod/TikTok)", surface: [admin],        status: planned }
  - { id: carousel-maker,     name: "Carousel Maker (PNG render)",     surface: [admin],         status: planned }
  - { id: repurposing,        name: "Repurposing Engine",              surface: [admin],         status: planned }
  - { id: headline-lab,       name: "Headline Lab (20 variants)",      surface: [admin],         status: planned }
  - { id: seo-optimizer,      name: "SEO Optimizer (lite)",            surface: [admin],         status: planned }
  - { id: asset-library,      name: "Asset Library (AI-tagged)",       surface: [admin],         status: planned }
  - { id: newsletter-pub,     name: "Newsletter Publishing (Substack-like)", surface: [public, admin], status: planned }
  - { id: performance,        name: "Performance Dashboard (cross-platform)", surface: [admin], status: planned }
  - { id: comment-dm,         name: "Comment & DM Drafting",           surface: [admin],         status: planned }
  - { id: public-newsletter,  name: "Public newsletter site",          surface: [public],        status: planned }

schema_tables:
  - content_items
  - content_drafts
  - voice_profiles
  - voice_samples
  - scripts
  - carousels
  - assets
  - asset_tags
  - newsletters
  - newsletter_issues
  - newsletter_subs
  - performance_metrics
  - reply_drafts

ai_features:
  - voice-train             # mid tier (analyze 10-20 samples → style profile)
  - voice-apply             # mid tier (rewrite using profile)
  - script-yt-longform      # mid tier (hook+value+cta)
  - script-podcast          # mid tier (segment + timestamp)
  - script-shortform        # nano tier (hook 3-detik)
  - carousel-outline        # mid tier (10-slide outline)
  - repurpose-blog-to-x     # mid tier (1 → many)
  - headline-variants       # nano tier (20 + ranking)
  - seo-meta                # nano tier
  - asset-autotag           # nano tier (img caption → tags)
  - reply-suggest           # nano tier (per-platform DM/comment)

market_size_id: large
differentiator: |
  Indonesian content workflow + voice consistency + carousel native dengan
  asset library AI-tagged. Repurposing engine 1-click. Bukan generic LLM
  wrapper — beneran tahu konteks creator Indonesia (jam posting, tone,
  format yang viral di X-ID/IG-ID/TikTok-ID).
---

# T3 — Kreator Studio

> "Sarah, content creator dengan 50K subscriber YouTube + 20K IG. Tiap minggu produce 2 long-form YT, 5 IG carousel, 1 newsletter, banyak short-form. Sebelumnya: Notion buat planning, Buffer buat scheduling, Canva buat carousel, ChatGPT buat brainstorm. Sekarang: 1 blog post → AI repurpose jadi tweet thread + carousel + script TikTok + newsletter, semua respect voice profile-nya. Reply DM IG pakai AI yang udah belajar tone-nya — ga generic."

## Target segment detail

- **Content creator full-time**: ~10-20K kreator full-time di Indonesia, ratusan ribu part-time.
- **Copywriter / ghostwriter**: agency atau freelance, perlu voice consistency per-klien.
- **Niche communities**: dakwah creator, edu creator, finance creator — punya kebutuhan template-able workflow.
- **Indonesia**: pasar kreator masif, haus tools yang ngerti konteks lokal (bukan western tools translated).
- **Current alternatives**: Notion (planner only) + Buffer/Hootsuite ($15+/mo) + Canva ($12+/mo) + ChatGPT/Claude ($20/mo) + Substack — total $50-80/mo, bahasa EN-first.

## Module spec

| ID | Name | Surface | Short desc |
|---|---|---|---|
| planner | Multi-channel Content Planner | admin | Kanban: blog, YT, IG, Threads, X, TikTok, LinkedIn, Newsletter. Status draft→review→scheduled→published. |
| voice-trainer | Voice & Tone Trainer | admin | Upload 10-20 contoh tulisan → AI ekstrak style profile (tone, sentence length, vocab, signature phrases). |
| script-gen | Script Generator | admin | YT long-form (hook 30s + value + CTA), podcast (segment + timestamp), short-form (hook 3-detik + payoff). |
| carousel-maker | Carousel Maker | admin | Input topik → 10-slide outline → render PNG ready-upload. Customize template, brand color, font. |
| repurposing | Repurposing Engine | admin | 1 blog → tweet thread + carousel + newsletter + YT script (one-click). |
| headline-lab | Headline Lab | admin | Generate 20 variasi, A/B prediction by curiosity-gap heuristic. |
| seo-optimizer | SEO Optimizer | admin | Keyword research lite, readability score, internal linking suggestion (untuk blog mode). |
| asset-library | Asset Library | admin | Upload image/video/audio. AI auto-tag (caption + objects). Drag-drop ke editor. |
| newsletter-pub | Newsletter Publishing | public + admin | Substack-like pub: write → schedule → send. Paid subscription via Midtrans/Stripe. |
| performance | Performance Dashboard | admin | Pull data dari YT/IG/X/blog APIs, cross-platform comparison, top performer flagging. |
| comment-dm | Comment & DM Drafting | admin | Inbox per-platform, AI suggest reply respecting voice profile. |
| public-newsletter | Public Newsletter Site | public | Hosted page per-newsletter: archive, subscribe form, paid tier landing. |

## Public surface

Per newsletter:

| Route | File | Purpose |
|---|---|---|
| `/n/[newsletter]` | `app/(public)/n/[newsletter]/page.tsx` | Newsletter hub — about + archive + subscribe |
| `/n/[newsletter]/[issue]` | `app/(public)/n/[newsletter]/[issue]/page.tsx` | Single issue (free or paywall) |
| `/n/[newsletter]/subscribe` | `.../subscribe/page.tsx` | Subscribe + paid tier picker |
| `/n/[newsletter]/rss` | `app/api/n/[newsletter]/rss/route.ts` | RSS feed |

Plus optional creator landing:

| Route | Purpose |
|---|---|
| `/` | Creator hub — links to all platforms + featured content + newsletter CTA |

### Page placeholders

```tsx
// app/(public)/n/[newsletter]/page.tsx
<NewsletterHero newsletter={newsletter} />
<RecentIssues issues={issues} />
<SubscribeForm tiers={newsletter.tiers} />
<TestimonialsCarousel quotes={newsletter.testimonials} />
```

```tsx
// app/(public)/n/[newsletter]/[issue]/page.tsx
{issue.paywall && !subscribed ? (
  <Paywall issue={issue} tiers={newsletter.tiers} />
) : (
  <>
    <IssueHeader issue={issue} />
    <MdxContent source={issue.body} />
    <ShareBar />
  </>
)}
```

## Admin surface

Routes under `/studio`:

| Route | File | Purpose |
|---|---|---|
| `/studio` | `app/(admin)/studio/page.tsx` | Dashboard: today's schedule + pending drafts + recent perf |
| `/studio/planner` | `.../planner/page.tsx` | Kanban multi-channel content board |
| `/studio/voice` | `.../voice/page.tsx` | Voice profiles list + train new |
| `/studio/voice/[id]` | `.../voice/[id]/page.tsx` | Profile detail + sample upload + style breakdown |
| `/studio/scripts` | `.../scripts/page.tsx` | Scripts list (YT/podcast/short) |
| `/studio/scripts/new` | `.../scripts/new/page.tsx` | Script generator form + editor |
| `/studio/carousel` | `.../carousel/page.tsx` | Carousel maker — outline → preview → export PNG |
| `/studio/repurpose` | `.../repurpose/page.tsx` | Pick source → choose targets → AI generate |
| `/studio/headlines` | `.../headlines/page.tsx` | Headline Lab playground |
| `/studio/seo` | `.../seo/page.tsx` | SEO checker (paste blog URL or content) |
| `/studio/assets` | `.../assets/page.tsx` | Asset library + upload + AI-tagged search |
| `/studio/newsletter` | `.../newsletter/page.tsx` | Newsletter list + compose |
| `/studio/newsletter/[id]/issues` | `.../newsletter/[id]/issues/page.tsx` | Issue list + new issue |
| `/studio/perf` | `.../perf/page.tsx` | Cross-platform performance dashboard |
| `/studio/inbox` | `.../inbox/page.tsx` | Comment & DM drafting per-platform |
| `/studio/settings/voice` | `.../settings/voice/page.tsx` | Default voice profile + per-channel override |
| `/studio/settings/integrations` | `.../settings/integrations/page.tsx` | Connect YT/IG/X/TikTok/Substack |

### Page placeholders

```tsx
// app/(admin)/studio/repurpose/page.tsx
<ThreeColumnLayout
  preset="repurpose"
  left={<SourcePicker types={["blog","script","newsletter"]} />}
  center={
    <>
      <SourcePreview content={source} />
      <TargetMatrix
        targets={[
          "x-thread", "ig-carousel-10", "ig-reel-script",
          "tiktok-script", "linkedin-post", "newsletter-issue", "yt-shorts-script"
        ]}
        onGenerate={(targets) => api.ai.repurpose({ source, targets, voiceProfile })}
      />
    </>
  }
  right={<VoiceProfilePicker selected={voice} onChange={setVoice} />}
/>
<RepurposeResults results={generated} editable />
```

```tsx
// app/(admin)/studio/carousel/page.tsx
<div className="grid grid-cols-[300px_1fr_400px] h-full">
  <CarouselOutlineForm
    topic={topic}
    audience={audience}
    style={style}
    slideCount={slideCount}
    onGenerate={() => api.ai.carouselOutline({ topic, audience, style, slideCount })}
  />
  <SlidePreview slides={slides} activeIndex={active} onSelect={setActive} />
  <SlideEditor slide={slides[active]} brand={brand} onSave={updateSlide} />
</div>
<ExportToolbar formats={["png","pdf","mp4"]} brand={brand} />
```

```tsx
// app/(admin)/studio/voice/[id]/page.tsx
<VoiceProfileHeader profile={profile} />
<StyleBreakdown
  metrics={profile.metrics}     // avgSentenceLen, vocabRichness, signaturePhrases[]
/>
<SampleList samples={samples} onAdd={uploadSample} onRemove={removeSample} />
<VoicePlayground prompt={demoPrompt} apply={profile} />
```

## Convex schema sketch

```ts
content_items: defineTable({
  workspaceId: v.id("workspaces"),
  channel: v.union(
    v.literal("blog"), v.literal("youtube"), v.literal("instagram"),
    v.literal("threads"), v.literal("x"), v.literal("tiktok"),
    v.literal("linkedin"), v.literal("newsletter"),
  ),
  title: v.string(),
  topic: v.string(),
  status: v.union(v.literal("idea"), v.literal("draft"), v.literal("review"), v.literal("scheduled"), v.literal("published")),
  scheduledFor: v.optional(v.number()),
  voiceProfileId: v.optional(v.id("voice_profiles")),
  parentItemId: v.optional(v.id("content_items")),     // for repurposed children
  createdAt: v.number(),
}).index("by_workspace_channel_status", ["workspaceId", "channel", "status"])
  .index("by_workspace_scheduled", ["workspaceId", "scheduledFor"]),

content_drafts: defineTable({
  itemId: v.id("content_items"),
  version: v.number(),
  body: v.string(),
  meta: v.optional(v.any()),
  createdAt: v.number(),
}).index("by_item_version", ["itemId", "version"]),

voice_profiles: defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  metrics: v.any(),                                    // { avgSentenceLen, vocabRichness, signaturePhrases, tone, formality }
  systemPrompt: v.string(),                            // generated; editable
}).index("by_workspace", ["workspaceId"]),

voice_samples: defineTable({
  profileId: v.id("voice_profiles"),
  source: v.string(),
  body: v.string(),
  embedding: v.optional(v.array(v.float64())),
}).index("by_profile", ["profileId"]),

scripts: defineTable({
  itemId: v.id("content_items"),
  format: v.union(v.literal("yt-longform"), v.literal("podcast"), v.literal("shortform")),
  outline: v.any(),                                    // { hook, value, cta } or { segments } or { hook, payoff }
  body: v.string(),
  durationEstSec: v.optional(v.number()),
}).index("by_item", ["itemId"]),

carousels: defineTable({
  itemId: v.id("content_items"),
  outline: v.any(),
  slides: v.array(v.object({ headline: v.string(), body: v.string(), imageUrl: v.optional(v.string()), bg: v.optional(v.string()) })),
  brand: v.any(),                                      // colors, fonts, logo
  exportedPngUrls: v.optional(v.array(v.string())),
}).index("by_item", ["itemId"]),

assets: defineTable({
  workspaceId: v.id("workspaces"),
  type: v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
  url: v.string(),
  caption: v.optional(v.string()),
  meta: v.optional(v.any()),
  embedding: v.optional(v.array(v.float64())),
  createdAt: v.number(),
}).index("by_workspace_type", ["workspaceId", "type"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["workspaceId"] }),

asset_tags: defineTable({
  assetId: v.id("assets"),
  tag: v.string(),
  source: v.union(v.literal("ai"), v.literal("manual")),
}).index("by_asset", ["assetId"]).index("by_tag", ["tag"]),

newsletters: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  tiers: v.array(v.object({ name: v.string(), priceMonth: v.number(), benefits: v.array(v.string()) })),
  customDomain: v.optional(v.string()),
}).index("by_workspace_slug", ["workspaceId", "slug"]),

newsletter_issues: defineTable({
  newsletterId: v.id("newsletters"),
  number: v.number(),
  title: v.string(),
  body: v.string(),
  paywall: v.boolean(),
  status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent")),
  scheduledFor: v.optional(v.number()),
  sentAt: v.optional(v.number()),
}).index("by_newsletter_number", ["newsletterId", "number"]),

newsletter_subs: defineTable({
  newsletterId: v.id("newsletters"),
  email: v.string(),
  tier: v.string(),
  status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past-due")),
  subscribedAt: v.number(),
}).index("by_newsletter_email", ["newsletterId", "email"]),

performance_metrics: defineTable({
  itemId: v.id("content_items"),
  channel: v.string(),
  fetchedAt: v.number(),
  metrics: v.any(),                                    // views, likes, shares, ctr, watch-time, ...
}).index("by_item_time", ["itemId", "fetchedAt"]),

reply_drafts: defineTable({
  workspaceId: v.id("workspaces"),
  channel: v.string(),
  threadId: v.string(),
  incomingMessage: v.string(),
  suggestedReplies: v.array(v.string()),
  pickedReplyIndex: v.optional(v.number()),
  sentAt: v.optional(v.number()),
}).index("by_workspace_channel", ["workspaceId", "channel"]),
```

## AI integration points

| Feature | Tier | Prompt outline |
|---|---|---|
| `voice-train` | mid | Input: 10-20 samples → output: `{ avgSentenceLen, vocabRichness, signaturePhrases, tone, formality, systemPrompt }` |
| `voice-apply` | mid | Input: target text + voiceProfile.systemPrompt → rewrite respecting voice |
| `script-yt-longform` | mid | Input: topic + voice + duration → output: `{ hook (30s), value (sections), cta }` w/ b-roll suggestions |
| `script-podcast` | mid | Input: topic + duration + guest? → output: `{ segments: [{ ts, title, talkingPoints[] }] }` |
| `script-shortform` | nano | Input: topic + voice → output: `{ hook (3s), payoff, captionVariants }` |
| `carousel-outline` | mid | Input: topic + audience + slideCount → output: per-slide `{ headline, body }`, hook on slide 1, CTA on last |
| `repurpose-blog-to-x` | mid | Input: source + target list + voice → output: `{ [target]: content }` |
| `headline-variants` | nano | Input: post body 1st 500 words → output: 20 variants ranked by curiosity-gap |
| `seo-meta` | nano | Same as T1 |
| `asset-autotag` | nano | Input: image (multimodal) → output: `{ caption, tags[] }` |
| `reply-suggest` | nano | Input: incoming msg + thread context + voice → output: 3 reply variants |

## Source map

| Component | Source |
|---|---|
| Database views (kanban, calendar, table, gallery) | `notion-page-clone/src/slices/databases/` |
| Block editor + slash menu | `notion-page-clone/src/slices/editor/` |
| Command palette | `notion-page-clone/src/slices/command-palette/` |
| Multi-block selection | `notion-page-clone/src/slices/block-selection/` |
| ResponsiveDashboardShell | `superspace/frontend/shared/ui/layout/dashboard/` |
| Motion primitives | `rahmanef.com/frontend/shared/ui/` |
| Hero/landing for `/n/[newsletter]` | `cescadesigns/components/cummon/hero-section.tsx` |
| Carousel render to PNG | NEW (use `@vercel/og` or `satori` server-side render) |

## Preview wiring

- `previewPath` (public): `/preview/templates/kreator-studio/public` — desktop, sample newsletter site
- `adminPreviewPath`: `/preview/templates/kreator-studio/admin` — desktop, planner kanban demo
- `defaultSurface`: `admin`

Assembler config:

- Variant: `solo-creator` | `agency-multi-client` | `newsletter-only` | `agency-ghostwriter`
- Add-ons: `paid-newsletter` · `voice-trainer` · `carousel-maker` · `cross-platform-perf` · `inbox-ai`

## Differentiator vs competition

| Competitor | Their thing | Our wedge |
|---|---|---|
| Notion + Buffer + Canva + GPT | $50-80/mo stack | All-in-one, AI-native, ID-context |
| Buffer/Hootsuite | Cross-platform scheduling | Plus voice trainer, repurposing, carousel |
| Beehiiv/Substack | Newsletter only | Plus full content workflow + repurposing |
| Canva | Carousel design | AI carousel from topic, voice-aware copy |
| Jasper/Copy.ai | AI copy | Voice profile + multi-channel + ID-tone |

## Open questions

- **Image model for carousel slides** — Stable Diffusion API (cheap, license-clear) vs Midjourney (better, no API)?
- **Cross-platform API limits** — IG/TikTok APIs restrictive; auth via OAuth Business or scraping? Document Pro tier for IG Business.
- **Paid newsletter payment** — Midtrans recurring (Indonesia), Stripe (international), or both?
- **Voice profile portability** — export as JSON so creator can take to other tools? Yes (creator-friendly), but moats weaker.

## Status checklist

Foundation (per `_shared-foundation.md`):
- [ ] Auth, AI router, base schema, design system, i18n, shell, three-column, resend, vector

Modules:
- [ ] planner
- [ ] voice-trainer
- [ ] script-gen
- [ ] carousel-maker
- [ ] repurposing
- [ ] headline-lab
- [ ] seo-optimizer
- [ ] asset-library
- [ ] newsletter-pub
- [ ] performance
- [ ] comment-dm
- [ ] public-newsletter

Kitab integration:
- [ ] Preview routes (public + admin)
- [ ] Entry in `lib/content/templates.ts`
- [ ] Public/Admin tab toggle
- [ ] Assembler config
- [ ] Showcase page `/templates/kreator-studio`

Distribution:
- [ ] X thread
- [ ] Carousel ID (dogfood — built using this template)
- [ ] Loom walkthrough
- [ ] Blog post
- [ ] Newsletter blast
