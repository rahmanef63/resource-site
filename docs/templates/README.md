# Templates — Master Index

Five SaaS-grade template blueprints for the kitab. Each = **public surface + admin surface** (middle-panel tab toggle). Built copy-first from existing source repos (see `_shared-foundation.md` → Source Map).

## Status legend

- 🟦 **planned** — manifest only, no code
- 🟨 **scaffolded** — placeholder routes + UI skeleton
- 🟩 **functional** — public + admin both wired to Convex
- 🟪 **shipped** — entry live in `lib/content/templates.ts`, kitab preview tab works

## The Five

| # | Slug | Title (ID / EN) | Priority | Status | Primary segment |
|---|---|---|---|---|---|
| T1 | `personal-brand-os` | Personal Brand OS | 2 | 🟦 | Akademisi · Konsultan · Kreator |
| T2 | `riset-kit` | Riset Kit / Research Workspace | 4 | 🟦 | Peneliti · Mahasiswa S2/S3 · NGO |
| T3 | `kreator-studio` | Kreator Studio / Content Hub | 5 | 🟦 | Content Creator · Copywriter |
| T4 | `wirausaha-os` | Wirausaha OS / UKM Ops Hub | **1** | 🟦 | Pengusaha UKM multi-unit |
| T5 | `konsultan-os` | Konsultan OS / Consulting Workspace | 3 | 🟦 | Konsultan · Profesional jasa |

Release order driven by exposure strategy — see `_release-strategy.md`.

## Shared docs

- [`_manifest-schema.md`](./_manifest-schema.md) — frontmatter contract, scaffolder reads this
- [`_market-coverage.md`](./_market-coverage.md) — segments × templates matrix, gap analysis
- [`_release-strategy.md`](./_release-strategy.md) — order, naming, exposure plays
- [`_shared-foundation.md`](./_shared-foundation.md) — common deps + Source Map per template

## Per-template docs

- [`T1-personal-brand-os.md`](./T1-personal-brand-os.md)
- [`T2-riset-kit.md`](./T2-riset-kit.md)
- [`T3-kreator-studio.md`](./T3-kreator-studio.md)
- [`T4-wirausaha-os.md`](./T4-wirausaha-os.md)
- [`T5-konsultan-os.md`](./T5-konsultan-os.md)

## Kitab integration (placeholder only at this stage)

Each template will surface in the kitab as a `LayoutEntry` (or new `TemplateEntry`) with:

- `previewPath: /preview/templates/<slug>/public` (default tab)
- `adminPreviewPath: /preview/templates/<slug>/admin` (toggle)
- Middle-panel tabs: **Public** · **Admin** · Code · Prompt
- Right panel inspector: per-module config schema (assembler pattern from `ULTRAPLAN-ASSEMBLER.md`)

Wiring happens in scaffolding phase. This doc folder is **manifest-only** — single source of truth before any code lands.
