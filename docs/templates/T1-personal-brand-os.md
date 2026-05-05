---
slug: personal-brand-os
title_en: Personal Brand OS
title_id: Personal Brand OS
status: planned
priority: 2
tagline_en: One site. Blog, portfolio, chatbot, lead capture, AI-driven CMS.
tagline_id: Satu situs untuk profil, tulisan, karya, chatbot, dan capture lead.

segments:
  primary: [akademisi, konsultan-solo, kreator-personal]
  secondary: [coach, dokter-praktek, advokat-solo, founder-startup]

surfaces:
  public:
    preview_path: /preview/templates/personal-brand-os/public
    default_view: desktop
  admin:
    preview_path: /preview/templates/personal-brand-os/admin
    default_view: desktop
  default_surface: public

shared_deps:
  - auth
  - ai-router
  - convex-base
  - design-system
  - i18n
  - shell
  - resend
  - vector-search

source_map:
  - from: rahmanef.com/frontend/shared/ui
    to: frontend/shared/ui/motion
  - from: rahmanef.com/frontend/shared/lib
    to: frontend/shared/lib/theme
  - from: rahmanef.com/frontend/slices/portfolio
    to: frontend/slices/portfolio
  - from: cescadesigns/components/cummon/hero-section.tsx
    to: frontend/slices/landing/components/HeroCarousel.tsx
  - from: cescadesigns/app/contact
    to: frontend/slices/contact
  - from: notion-page-clone/src/slices/editor
    to: frontend/slices/cms/editor
  - from: superspace/frontend/shared/ui/layout/dashboard
    to: frontend/shared/ui/layout/dashboard

modules:
  - { id: blog,           name: "Blog (MDX + ToC + related)",        surface: [public, admin], status: planned }
  - { id: portfolio,      name: "Portfolio (case studies)",          surface: [public, admin], status: planned }
  - { id: about-story,    name: "About / Story (timeline)",          surface: [public, admin], status: planned }
  - { id: services,       name: "Services / Offerings + booking",    surface: [public, admin], status: planned }
  - { id: resource-lib,   name: "Resource Library (gated PDFs)",     surface: [public, admin], status: planned }
  - { id: testimonials,   name: "Testimonials & Social Proof",       surface: [public, admin], status: planned }
  - { id: contact,        name: "Contact Form (spam-protected)",     surface: [public, admin], status: planned }
  - { id: chatbot,        name: "AI Chatbot (per-skill agents)",     surface: [public, admin], status: planned }
  - { id: newsletter,     name: "Newsletter & Lead Magnet",          surface: [public, admin], status: planned }
  - { id: comments,       name: "Comments + AI moderation",          surface: [public, admin], status: planned }
  - { id: bilingual,      name: "ID↔EN Toggle (LLM cached)",         surface: [public, admin], status: planned }
  - { id: cms,            name: "CMS + AI writing assistant",        surface: [admin],         status: planned }
  - { id: analytics,      name: "Self-hosted Analytics",             surface: [admin],         status: planned }
  - { id: ai-config,      name: "AI Config (model picker, prompts)", surface: [admin],         status: planned }
  - { id: seo,            name: "RSS + Sitemap + Schema.org",        surface: [public],        status: planned }

schema_tables:
  - posts
  - post_versions
  - portfolio_items
  - services_offerings
  - resources
  - testimonials
  - contact_submissions
  - newsletter_subscribers
  - chat_conversations
  - chat_messages
  - chatbot_skills
  - comments
  - translations_cache
  - analytics_events
  - ai_config

ai_features:
  - chatbot                 # mid tier (general chat) + nano fallback
  - cms-outline             # mid tier
  - cms-headline-variants   # nano tier
  - cms-seo-meta            # nano tier
  - comment-moderation      # nano tier
  - bilingual-translate     # nano tier (cached)
  - related-posts-vector    # vector + nano rerank

market_size_id: large
differentiator: |
  Personal "OS" — bukan website statis. AI-augmented CMS, chatbot pakai
  konteks tulisan-mu sendiri (vector search), bilingual auto, lead capture
  built-in. Self-hosted, no SaaS lock-in.
---

# T1 — Personal Brand OS

> "Bu Anita, dosen + konsultan di bidang HR. Sebelumnya pakai WordPress + Mailchimp + Calendly + ChatGPT. Sekarang satu situs: blog yang chatbot-nya bisa jawab pakai konteks tulisannya, booking konsultasi langsung dari halaman services, lead magnet PDF yang auto-trigger newsletter sequence."

## Target segment detail

- **Akademisi** yang butuh personal academic site dengan publication list + course list.
- **Konsultan/profesional** yang butuh online presence + lead capture + booking.
- **Content creator** yang nulis blog + butuh subscriber/newsletter.
- **Indonesia**: ~5-10M profesional & kreator dengan kebutuhan personal site. Currently bayar WordPress + Mailchimp + Calendly = Rp 200-500k/mo total.

## Module spec

| ID | Name | Surface | Short desc |
|---|---|---|---|
| blog | Blog | public + admin | MDX, kategori, tag, reading time, ToC auto, related-posts via vector. |
| portfolio | Portfolio | public + admin | Case studies struktur problem→approach→result, filter, embed video/figma/github. |
| about-story | About / Story | public + admin | Long-form bio, timeline interaktif, achievement, media mention. |
| services | Services / Offerings | public + admin | Productized services dengan pricing + Cal.com booking embed. |
| resource-lib | Resource Library | public + admin | Koleksi PDF/template/cheatsheet — gated (email-required) atau free. |
| testimonials | Testimonials | public + admin | Carousel testimoni, "as featured in" logo strip, metric counter. |
| contact | Contact Form | public + admin | Honeypot + rate-limit, auto-reply, lead routing email/WA. |
| chatbot | AI Chatbot | public + admin | OpenRouter, custom prompt per-skill, agents w/ tool-calling, history per-visitor. Vector-augmented dari blog content. |
| newsletter | Newsletter | public + admin | Resend, double opt-in, gated content trigger, segmented blast. |
| comments | Comments | public + admin | Threaded comments di blog dengan AI moderation (spam/toxic flag). |
| bilingual | ID↔EN Toggle | public + admin | LLM auto-translate, hasil di-cache di Convex, manual override per-post. |
| cms | CMS | admin | Block editor (notion-clone slice) + AI writing assistant (outline, headline, SEO meta). |
| analytics | Analytics | admin | Page view, top posts, lead source, chatbot insight. Tanpa GA, full self-hosted. |
| ai-config | AI Config | admin | Per-feature model picker, temperature, system prompt edit, cost dashboard. |
| seo | SEO | public | Auto-generate RSS, sitemap.xml, JSON-LD Schema.org per page type. |

## Public surface

Routes (root domain or owner's custom domain):

| Route | File | Purpose |
|---|---|---|
| `/` | `app/(public)/page.tsx` | Hero + featured posts + portfolio teaser + CTA |
| `/about` | `app/(public)/about/page.tsx` | Long-form bio + timeline + media mentions |
| `/blog` | `app/(public)/blog/page.tsx` | Post grid + tag filter |
| `/blog/[slug]` | `app/(public)/blog/[slug]/page.tsx` | Single post + ToC + related + comments |
| `/portfolio` | `app/(public)/portfolio/page.tsx` | Case study grid + category filter |
| `/portfolio/[slug]` | `app/(public)/portfolio/[slug]/page.tsx` | Single case study |
| `/services` | `app/(public)/services/page.tsx` | Offerings list + Cal.com booking embed |
| `/resources` | `app/(public)/resources/page.tsx` | Gated/free resource library |
| `/contact` | `app/(public)/contact/page.tsx` | Form (honeypot, rate-limit, auto-reply) |
| `/api/rss` | `app/api/rss/route.ts` | RSS feed |
| `/sitemap.xml` | `app/sitemap.ts` | Sitemap |

### Page placeholders

```tsx
// app/(public)/page.tsx
<HeroCarousel slides={hero.slides} />
<FeaturedPosts posts={posts.featured} />
<PortfolioTeaser items={portfolio.featured} />
<NewsletterCTA leadMagnet={defaultLeadMagnet} />
<ChatbotFAB skill="general" />
```

```tsx
// app/(public)/blog/[slug]/page.tsx
<ReadingProgress />
<PostHeader post={post} />
<TableOfContents headings={post.headings} />
<MDXContent source={post.body} />
<RelatedPosts items={related} />     // vector-search
<CommentsThread postId={post._id} />
<NewsletterCTA leadMagnet={post.leadMagnet ?? defaultLeadMagnet} />
```

```tsx
// app/(public)/services/page.tsx
<ServicesGrid offerings={offerings} />
<CalComEmbed eventType={selected?.calLink} />
<TestimonialsCarousel quotes={testimonials} />
```

## Admin surface

Routes under `/admin`:

| Route | File | Purpose |
|---|---|---|
| `/admin` | `app/(admin)/admin/page.tsx` | KPI overview (visits, leads, top posts, chat sessions) |
| `/admin/posts` | `.../posts/page.tsx` | Blog posts list + status |
| `/admin/posts/[id]/edit` | `.../posts/[id]/edit/page.tsx` | Block editor + AI writing panel |
| `/admin/portfolio` | `.../portfolio/page.tsx` | Portfolio items CRUD |
| `/admin/services` | `.../services/page.tsx` | Offerings CRUD + Cal.com link mgmt |
| `/admin/resources` | `.../resources/page.tsx` | Resource library upload + gating |
| `/admin/testimonials` | `.../testimonials/page.tsx` | Testimonials CRUD + media-mention logos |
| `/admin/leads` | `.../leads/page.tsx` | Contact submissions + newsletter subs unified |
| `/admin/newsletter` | `.../newsletter/page.tsx` | Campaign list + compose + send |
| `/admin/comments` | `.../comments/page.tsx` | Comment moderation queue (AI-flagged at top) |
| `/admin/chatbot` | `.../chatbot/page.tsx` | Skill mgmt + conversation review |
| `/admin/translations` | `.../translations/page.tsx` | EN translations (auto + manual override) |
| `/admin/analytics` | `.../analytics/page.tsx` | Self-hosted analytics dashboards |
| `/admin/settings/ai` | `.../settings/ai/page.tsx` | Model picker per feature, temperature, sys prompt |
| `/admin/settings/site` | `.../settings/site/page.tsx` | Domain, theme preset, SEO defaults |

### Page placeholders

```tsx
// app/(admin)/admin/posts/[id]/edit/page.tsx
<ThreeColumnLayout
  preset="cms-editor"
  left={<PostNavigator />}
  center={<BlockEditor postId={id} />}
  right={
    <Tabs defaultValue="ai">
      <TabsList>
        <TabsTrigger value="ai">AI Assist</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="meta">Meta</TabsTrigger>
      </TabsList>
      <TabsContent value="ai">
        <OutlineGenerator />
        <HeadlineLab />
        <ToneAdjuster />
      </TabsContent>
      <TabsContent value="seo">
        <SeoMetaSuggest />
        <ReadabilityScore />
      </TabsContent>
      <TabsContent value="meta">
        <PostMetaForm />
      </TabsContent>
    </Tabs>
  }
/>
```

## Convex schema sketch

```ts
posts: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  bodyMdx: v.string(),
  cover: v.optional(v.string()),
  tags: v.array(v.string()),
  status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published")),
  scheduledFor: v.optional(v.number()),
  publishedAt: v.optional(v.number()),
  embedding: v.optional(v.array(v.float64())),
  leadMagnetId: v.optional(v.id("resources")),
  locale: v.union(v.literal("id"), v.literal("en")),
  translationOf: v.optional(v.id("posts")),
}).index("by_workspace_slug", ["workspaceId", "slug"])
  .index("by_workspace_status_time", ["workspaceId", "status", "publishedAt"])
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536, filterFields: ["workspaceId", "status"] }),

portfolio_items: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  title: v.string(),
  category: v.string(),
  cover: v.string(),
  problem: v.string(),
  approach: v.string(),
  result: v.string(),
  embeds: v.array(v.object({ type: v.string(), url: v.string() })),
}).index("by_workspace_slug", ["workspaceId", "slug"]),

services_offerings: defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.string(),
  priceFrom: v.optional(v.number()),
  calLink: v.optional(v.string()),
}).index("by_workspace", ["workspaceId"]),

resources: defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  fileUrl: v.string(),
  gated: v.boolean(),
  downloadCount: v.number(),
}).index("by_workspace", ["workspaceId"]),

contact_submissions: defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  email: v.string(),
  message: v.string(),
  source: v.string(),
  ipHash: v.string(),
  createdAt: v.number(),
}).index("by_workspace_time", ["workspaceId", "createdAt"]),

newsletter_subscribers: defineTable({
  workspaceId: v.id("workspaces"),
  email: v.string(),
  status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("unsubscribed")),
  source: v.string(),                  // "footer", "lead-magnet:xxx", "post:xxx"
  segments: v.array(v.string()),
  createdAt: v.number(),
}).index("by_workspace_email", ["workspaceId", "email"]),

chat_conversations: defineTable({
  workspaceId: v.id("workspaces"),
  visitorId: v.string(),
  skill: v.string(),                   // "general", "academic-qa", "consultation"
  startedAt: v.number(),
}).index("by_workspace_visitor", ["workspaceId", "visitorId"]),

chat_messages: defineTable({
  conversationId: v.id("chat_conversations"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  createdAt: v.number(),
}).index("by_conversation_time", ["conversationId", "createdAt"]),

chatbot_skills: defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  name: v.string(),
  systemPrompt: v.string(),
  modelTier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
  tools: v.array(v.string()),          // "search-posts", "book-call", "send-resource"
}).index("by_workspace_slug", ["workspaceId", "slug"]),

comments: defineTable({
  postId: v.id("posts"),
  parentId: v.optional(v.id("comments")),
  authorName: v.string(),
  authorEmail: v.string(),
  body: v.string(),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("flagged"), v.literal("spam")),
  aiFlags: v.optional(v.array(v.string())),
  createdAt: v.number(),
}).index("by_post_time", ["postId", "createdAt"])
  .index("by_status_time", ["status", "createdAt"]),

translations_cache: defineTable({
  workspaceId: v.id("workspaces"),
  sourceHash: v.string(),
  sourceLocale: v.string(),
  targetLocale: v.string(),
  content: v.string(),
}).index("by_hash", ["sourceHash", "targetLocale"]),

analytics_events: defineTable({
  workspaceId: v.id("workspaces"),
  type: v.string(),                    // "page-view", "chat-start", "lead", "newsletter-sub"
  path: v.optional(v.string()),
  referrer: v.optional(v.string()),
  visitorId: v.string(),
  meta: v.optional(v.any()),
  createdAt: v.number(),
}).index("by_workspace_time", ["workspaceId", "createdAt"])
  .index("by_workspace_type_time", ["workspaceId", "type", "createdAt"]),

ai_config: defineTable({
  workspaceId: v.id("workspaces"),
  feature: v.string(),                 // "chatbot", "cms-outline", "comment-moderation", ...
  modelId: v.string(),
  temperature: v.number(),
  systemPrompt: v.optional(v.string()),
}).index("by_workspace_feature", ["workspaceId", "feature"]),
```

## AI integration points

| Feature | Tier | Prompt outline |
|---|---|---|
| `chatbot` | mid | System: persona dari `chatbot_skills`. Tool-call: vector search posts → cite. Tool-call: book-call → return Cal.com link. |
| `cms-outline` | mid | Input: working title + 3 keywords → output: H2/H3 outline + suggested data points |
| `cms-headline-variants` | nano | Input: post body 1st 500 words → output: 10 headline variants ranked by curiosity-gap heuristic |
| `cms-seo-meta` | nano | Input: post body → output: `{ metaTitle (≤60), metaDesc (≤160), focusKeyword, ogImagePrompt }` |
| `comment-moderation` | nano | Input: comment body → output: `{ allow: bool, flags: [spam|toxic|off-topic|promo] }` |
| `bilingual-translate` | nano | Input: source text + target locale → output: translated text. Cache via `translations_cache.sourceHash`. |
| `related-posts-vector` | vector + nano | Vector top-10 by embedding sim → nano rerank by current post's audience signals |

## Source map

| Component | Source |
|---|---|
| Hero carousel | `cescadesigns/components/cummon/hero-section.tsx` |
| Contact form + Resend wiring | `cescadesigns/app/contact/` |
| Block editor + slash menu | `notion-page-clone/src/slices/editor/` |
| Comments threaded | `notion-page-clone/src/slices/comments/` |
| Motion primitives (KineticHeading, Magnetic, Marquee, ReadingProgress) | `rahmanef.com/frontend/shared/ui/` |
| Asymmetric portfolio grid | `rahmanef.com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |
| OKLch theme presets | `rahmanef.com/frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` |
| Dashboard shell + sidebar | `superspace/frontend/shared/ui/layout/dashboard/` |
| ThreeColumnLayout | `superspace/frontend/shared/ui/layout/container/three-column/` |

## Preview wiring

- `previewPath` (public): `/preview/templates/personal-brand-os/public` — desktop default, mobile-friendly responsive
- `adminPreviewPath`: `/preview/templates/personal-brand-os/admin` — desktop default
- `defaultSurface`: `public` (this template's selling point IS the public site)

Assembler config:

- Variant: `minimal` (blog + about + contact) | `creator` (+ portfolio + newsletter) | `consultant` (+ services + booking + chatbot) | `academic` (+ publication list + bilingual)
- Add-ons: `chatbot` · `bilingual` · `comments` · `resource-library` · `analytics`

## Differentiator vs competition

| Competitor | Their thing | Our wedge |
|---|---|---|
| WordPress + Mailchimp + Calendly + ChatGPT | DIY stack ~Rp 300k/mo | All-in-one, AI-native, self-host gratis |
| Squarespace/Wix | Hosted but no chatbot/AI/lead-magnet wiring | Open source, chatbot pakai konteks tulisanmu |
| Substack | Newsletter + gated posts | Plus full site + portfolio + services + booking |
| Bento.me/Linktree | Link-in-bio | Full site, bukan just link aggregator |

## Open questions

- **Chatbot guardrails** — visitor abuse → cost spike. Rate-limit per `visitorId` + daily budget cap per workspace?
- **MDX vs block-editor as canonical** — block editor lebih friendly tapi MDX lebih portable. Store as both, derive on save?
- **Cal.com self-host vs cloud embed** — self-host adds ops burden, cloud embed adds external dep. Default cloud, document self-host as add-on.
- **Comments — invite-only mode** — for high-profile users yang ga mau comment mod overhead. Toggle.

## Status checklist

Foundation (per `_shared-foundation.md`):
- [ ] Auth, AI router, base schema, design system, i18n, shell, resend, vector

Modules:
- [ ] blog
- [ ] portfolio
- [ ] about-story
- [ ] services
- [ ] resource-lib
- [ ] testimonials
- [ ] contact
- [ ] chatbot
- [ ] newsletter
- [ ] comments
- [ ] bilingual
- [ ] cms
- [ ] analytics
- [ ] ai-config
- [ ] seo

Kitab integration:
- [ ] Preview routes (public + admin)
- [ ] Entry in `lib/content/templates.ts`
- [ ] Public/Admin tab toggle
- [ ] Assembler config
- [ ] Showcase page `/templates/personal-brand-os`

Distribution:
- [ ] X thread
- [ ] Carousel ID
- [ ] Loom walkthrough
- [ ] Blog post
- [ ] Newsletter blast
