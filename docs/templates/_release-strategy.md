# Release Strategy

## Order

| Phase | Template | Rationale |
|---|---|---|
| **R1** | T4 Wirausaha OS | Biggest TAM. Founder credibility (Zian Inn live). Media-friendly. |
| **R2** | T1 Personal Brand OS | Mass appeal. Shortest path to "first user wins". Marketing channel for rest. |
| **R3** | T5 Konsultan OS | High ARPU segment. Bilingual + PajakAware = real moat. |
| **R4** | T2 Riset Kit | Deep but narrow. Academic adoption is slow + viral. |
| **R5** | T3 Kreator Studio | Most crowded. Ship last w/ all foundation hardened. |

Foundation (auth, ai-router, convex base, design system, billing-ID) built **once before R1**. Everything reuses.

## Naming policy

ID-first names that translate emotionally; EN subtitle for international SEO.

| Slug | Display ID | Display EN |
|---|---|---|
| `wirausaha-os` | Wirausaha OS | UKM Operations Hub |
| `personal-brand-os` | Personal Brand OS | (bilingual default) |
| `konsultan-os` | Konsultan OS | Consulting Workspace |
| `riset-kit` | Riset Kit | Research Workspace |
| `kreator-studio` | Kreator Studio | Content Creator Hub |

`-os` suffix family branding (Wirausaha OS, Konsultan OS, Personal Brand OS) signals "operating system for X".

## Per-release distribution playbook

Each template launches with the same content kit:

1. **X thread** — 12-tweet long-form story + screenshots
2. **Carousel ID** — 10-slide IG/LinkedIn (built using T3 itself once R5 lands; until then static template)
3. **Video walkthrough** — 5-min Loom + 60-sec TikTok cut
4. **Technical blog** — published on T1 (rahmanef.com) `/blog`
5. **Newsletter blast** — Resend, segmented by interest
6. **Showcase page** — `kitab.rahmanef.com/templates/<slug>` w/ live demo + clone button

## Showcase page template

Each `templates/<slug>` page shows:

- Hero: tagline + "Try live" (drops to demo workspace) + "Clone repo" (gh template)
- Public surface preview (iframe, default tab)
- Admin surface preview (iframe, toggle)
- Module list with status badges
- Convex schema visualization (auto-rendered from `schema_tables` frontmatter)
- "Used by" — case study links (Zian Inn for T4, rahmanef.com for T1, etc.)
- Pricing tier (free OSS · self-host paid · hosted SaaS — see Monetization)

## Monetization tiers (per template)

| Tier | Price | What you get |
|---|---|---|
| **OSS** | Free, MIT | Full source, self-host, no support |
| **Pro self-host** | Rp 750k one-time | Premium modules (e.g. T4 inventory, T5 PajakAware) + 6mo updates |
| **Hosted SaaS** | Rp 99k–499k/mo | We host on Dokploy + Convex Cloud, 1-click setup |

Hosted = future. OSS + Pro self-host first.

## Foundation pre-work (must land before R1)

All in `frontend/shared/` + `convex/shared/`:

- [ ] Auth = `@convex-dev/auth` with email-magic-link (no Clerk)
- [ ] AI router = OpenRouter wrapper w/ model picker, retry, cost log
- [ ] Convex base schema: `users`, `workspaces`, `memberships`, `audit_log`
- [ ] Design system: shadcn primitives + theme presets from rahmanef.com
- [ ] i18n: `next-intl` with `id` (default) + `en`
- [ ] Billing ID: Midtrans payment-link util (T4, T5 only)
- [ ] Shell: ResponsiveDashboardShell (desktop sidebar / mobile dock) from kitab-core
- [ ] Three-column layout copied + verified
- [ ] CI: `npm run audit:bp` green per slice

## Storytelling beats marketing

- **R1 launch post**: "Saya bangun sistem ini buat 4 unit usaha keluarga di Bali. Sekarang lo bisa pakai juga."
- **R2 launch post**: "Website + chatbot + CMS jadi satu, AI built-in, deploy ke server lo sendiri 10 menit."
- **R3 launch post**: "Konsultan Indonesia mahal banget pakai jasa SaaS Western. Ini rebuilt buat workflow lokal — proposal, kontrak PPN-aware, deck ID."
- **R4 launch post**: "Riset thesis lo gak harus 7 tools terpisah. NotebookLM tapi ngerti EYD."
- **R5 launch post**: "Voice training + repurposing engine + carousel maker. Built by an Indonesian creator for Indonesian creators."

## Open knobs

- Decide hosted SaaS pricing post-R2 (need cost data from Convex Cloud + OpenRouter usage on real workloads).
- Decide whether to bundle all 5 in single repo (monorepo) or 5 separate `gh template` repos (cleaner clone story).
- Decide license for Pro modules: source-available BSL or proprietary binary?
