# Manifest Schema

Each `T{n}-<slug>.md` opens with YAML frontmatter the scaffolder reads. Body = human-readable detail.

## Frontmatter contract

```yaml
---
slug: ukm-ops-hub                  # kebab-case, kitab url-segment
title_en: UKM Operations Hub
title_id: Wirausaha OS
status: planned                    # planned | scaffolded | functional | shipped
priority: 1                        # 1 = ship first, 5 = last
tagline_en: Multi-business ops, native Indonesian, AI-augmented.
tagline_id: Operasional banyak unit usaha jadi satu, AI bantu narasi.

segments:                          # see _market-coverage.md
  primary: [ukm-multi-unit]
  secondary: [hospitality, freelancer-jasa]

surfaces:                          # what kitab middle-panel will show
  public:
    preview_path: /preview/templates/ukm-ops-hub/public
    default_view: desktop          # PreviewView from lib/preview-presets
  admin:
    preview_path: /preview/templates/ukm-ops-hub/admin
    default_view: desktop
  default_surface: admin           # which tab opens first

shared_deps:                       # see _shared-foundation.md
  - auth                           # @convex-dev/auth
  - ai-router                      # OpenRouter
  - convex-base                    # users, workspaces, audit
  - design-system                  # shadcn + theme presets
  - billing-id                     # Midtrans/Xendit (T4, T5)

source_map:                        # copy-first per CLAUDE.md
  - from: superspace/frontend/slices/_templates
    to: frontend/slices/_template-base
  - from: superspace/frontend/shared/ui/layout/dashboard
    to: frontend/shared/ui/layout/dashboard

modules:                           # functional buckets
  - id: multi-business
    name: Multi-business Registry
    surface: [admin]
    status: planned
  - id: lodging
    name: Property / Lodging
    surface: [admin, public]
    status: planned

schema_tables:                     # Convex tables (sketched in body)
  - businesses
  - units
  - bookings
  - guests

ai_features:                       # OpenRouter-powered
  - sop-search
  - report-narration
  - cs-reply-templates

market_size_id: large              # large | medium | niche
differentiator: |
  Self-hosted, multi-business native, harga terjangkau, AI bahasa Indonesia.
---
```

## Body sections (in order)

1. **Hero pitch** — 2-3 sentences positioning + named persona ("Pak Bayu, pemilik 3 kos di Jogja").
2. **Target segment detail** — who, where, how big, current alternatives.
3. **Module spec table** — id · name · surface · status · short desc.
4. **Public surface** — routes table + page-level placeholder copy.
5. **Admin surface** — routes table + page-level placeholder copy.
6. **Convex schema sketch** — per-table fields + indexes.
7. **AI integration points** — feature → prompt outline → model tier.
8. **Source map** — what to `cp -r` from existing repos (CLAUDE.md Source Map).
9. **Preview wiring** — how kitab will render; toggle behavior.
10. **Differentiator vs competition** — named competitors + wedge.
11. **Open questions** — decisions deferred to scaffolding.
12. **Status checklist** — granular per-module/per-route progress.

## Conventions

- **Routes** = relative to template root, e.g. `/dashboard/businesses` (admin) or `/` (public).
- **Placeholder copy** = bilingual ID/EN where consumer-facing, EN-only for admin labels.
- **Schema fields**: `name: type // note`. Mark indexed with `@idx(...)`.
- **Module surface** matches body sections — module appearing in `surface: [public]` only listed under § Public surface.
- **Status per module** independent of template-level `status` (a template can be `scaffolded` overall while individual modules are `planned`).

## Scaffolder contract (future)

A node script will:

1. Read `T*.md` frontmatter.
2. Generate `app/preview/templates/<slug>/public/page.tsx` + `.../admin/page.tsx` with placeholder grids per module.
3. Append `LayoutEntry` (or new `TemplateEntry`) to `lib/content/templates.ts`.
4. Stub `convex/schema/<slug>/*.ts` per `schema_tables`.
5. Drop AI feature placeholders in `convex/features/<slug>/ai/`.

Until scaffolder exists, all manifest-only. Don't hand-roll routes.
