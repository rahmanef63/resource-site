# Grand Tour — Ultimate Showcase Plan

> **Status:** PLANNED (2026-06-19) · **SSOT for the execution loop.**
> One in-site `/tour` route replaces every `/layouts/` demo. rr becomes a pure
> slice/feature picker ("printilan"); the tour is the navigable storefront.

## Decision

**Architecture: The Grand Tour** (scored 86/100 vs showcase-slice 71, template-base-mono 54).

A single in-site `app/(docs)/tour` route group on the rr site that **live-mounts
the EXISTING `frontend/slices` previews** (via the already-generated, code-split,
smoke-tested `lib/preview/registry.gen.ts` — 54 chunks, 63 mounted previews) into
an ordered capability journey (**Acts**). One Act embeds the **`appshell`** slice
as a live windowed OS to keep the "assembled, finished product" wow.

**Why this wins (verified against the codebase):**
- The preview engine is **real and tested** — `registry.gen.ts` (gated by
  `gen:previews:check`), `app/preview/slices/<slug>` (63 mounts), `/slices`
  domain-grouped catalog, mature redirect discipline in `next.config.mjs`. The
  tour is a *layout layer over tested machinery*, not a new engine.
- **Hard-Rule-6-pure by construction** — never imports `convex/features/*`;
  localStorage/in-memory adapters, `env: []`. Visibly proves the copy-source contract.
- **Biggest net deletion** toward the "printilan" vision; lowest new abstraction;
  best Vercel-deploy simplicity (same origin, no Convex, no DNS).
- Auto-stays-in-sync: new slice in `slices.ts` → auto-appears in the tour rail.

**Grafts:**
- *(from showcase-slice)* `appshell` as the live OS centerpiece Act (Act 2).
- *(from showcase-slice)* every Act card renders the literal `npx rr add <slug>`
  recipe (reuse the install string `/slices/<slug>` already shows) → tour sells slices.
- *(from showcase-slice)* honest **capability cards** for key-gated slices
  (vector-search, seo, ai-router, doku/midtrans, resend/cal/contact) — static
  preview + "needs: KEY/Convex" label, never dead live buttons.
- *(from template-base-mono)* `vercel.json` `build:auto` coupling applied to the
  **lean `packages/cli/lib/starter`** (NOT template-base) so `npx rr init` output
  deploys clean on Vercel + Convex Cloud.

## Locked decisions (2026-06-19)

1. **Scope:** retire ALL ~38 `/layouts` entries (8 website-template OS + ~30
   section demos). Everything is represented live in `/tour`; addable via `/slices`.
2. **Removal mode:** hard-delete rows + internal dirs + permanent 308 redirects.
3. **External demos:** Vercel projects, OS source repos, and `demo-*.rahmanef.com`
   subdomains **STAY ALIVE**. Only `resource.rahmanef.com` internal content changes
   (to kill duplication). **DO NOT touch** `proxy.ts` subdomain rewrites or
   `lib/content/template-subdomains.ts`. Redirect internal `/layouts|/preview/<slug>`
   → `/tour`; `demoUrl` external targets are left untouched.
4. **CMS reference:** generalize the saas-marketing Pages-CRUD into a **reusable
   general feature slice** (working name `pages-cms`) usable beyond one template —
   not a project-specific `cms-starter` copy.

## Scope

**Replace:** the entire `/layouts` catalog (`lib/content/layouts.ts`) + the docs
`/templates` route group + all internal `app/preview/<slug>` demo dirs.

**Keep:** `lib/preview/registry.gen.ts` engine, `app/preview/slices/*` (slice
previews — the tour's source), `/slices` catalog, `components/templates/_shared`,
`proxy.ts` + `template-subdomains.ts` + external demos, `npx rr init` lean starter,
`npx rr add` flow.

**Decommission order (gate-safe):** SSOT edit + redirects FIRST (P5) → dir deletion
+ manifest regen SECOND (P6). Never delete a dir while `layouts.ts` still references it.

## Confirmed defaults

- `appshell` IS the OS-anchor Act (brand-free, manifest-driven, `env: []`, already
  smoke-tested in PREVIEW_REGISTRY — mount its existing `preview.tsx`, do not
  re-instantiate its provider).
- `npx rr init` stays the LEAN `packages/cli/lib/starter` (~13 deps). It is NOT
  repointed to `template-base` (avoids the monolith-schema Rule-6 violation + ~90-dep lift).
- Showcase (`/tour`, Convex-free) and init-seed (Vercel/Cloud-ready) are **separate
  artifacts** — keep them separate.

---

## Phases (execution checklist)

> Order is load-bearing. P5/P6 (decommission) MUST come after P3 done-criteria
> (the new `/tour` is proven the complete live demo).

### P0 — Decisions + tour IA scaffold (no deletions)
- [x] Decisions recorded above (DONE — see Locked decisions).
- [x] `lib/content/tour.ts` — domain→slug Act map **derived programmatically from
      `lib/content/slices.ts`** (so new slices auto-appear). Acts: Marketing,
      OS/AppShell, Media, AI, Content, Platform/Auth/Commerce. Flag each slug
      live-mount vs capability-card (key-gated).
- [x] `app/(docs)/tour/layout.tsx` (pass-through; inherits DocsShell) + `app/(docs)/tour/page.tsx` (Act 0 hero/index) —
      chrome inherited from (docs) shell + global theme-presets/command-menu, no Acts wired.
- [x] `/tour` link added in `components/site/site-sidebar.tsx`.
- **Gates:** `typecheck`. **Done:** `/tour` renders hero + Act rail; zero changes to
  `layouts.ts`/`app/preview`/manifest.

### P1 — Act 1: Marketing & Conversion (covers the 30 section demos, live)
- [ ] `app/(docs)/tour/(act)/marketing/page.tsx` mounts hero/feature-grid/pricing/
      faq/testimonials/portfolio/blog/changelog/onboarding previews via PREVIEW_REGISTRY.
- [ ] Each section shows its `npx rr add <slug>` recipe.
- **Slices:** landing-sections, feature-grid, pricing-page, faq-section,
  testimonials-grid, portfolio-section, blog-section, changelog-feed, onboarding-wizard.
- **Gates:** `typecheck`, `gen:previews:check`. **Done:** all section kinds render
  live + add-recipes; **confirms layouts.ts removal in P5 loses nothing user-facing.**

### P2 — Act 2: App Shell / OS anchor (the "assembled product" wow)
- [ ] `app/(docs)/tour/(act)/os/page.tsx` mounts `appshell` preview + file-explorer,
      app-store, quicklinks, shell-settings, dashboard-shell, three-column,
      workspace-shell, command-menu, notifications-center, data-table, settings-page, selection.
- [ ] `next/dynamic ssr:false` wrappers for heavy slices (keep code-split).
- **Risk:** mount appshell's existing `preview.tsx`, do NOT re-instantiate its
  provider (double-mount/window-store bugs).
- **Gates:** `typecheck`, `gen:previews:check`. **Done:** live OS window surface;
  chunk-per-slice verified in build output.

### P3 — Acts 3–6: Media, AI, Content, Platform/Auth/Commerce
- [ ] `media/page.tsx` (image-editor, reel-editor, media-studio, media-viewer,
      code-editor, system-monitor, os-terminal, browser, image-picker, icon-picker, markdown).
- [ ] `ai/page.tsx` (ai-chat, ai-studio, ai-agents, assistant, ai-admin LIVE;
      create-your-mcp, seo, vector-search as capability cards).
- [ ] `content/page.tsx` (notion, notion-shell, notion-database, notion-sidebar,
      comments, library, services, testimonials).
- [ ] `platform/page.tsx` (admin-panel, platform-admin, convex-auth, rbac-roles,
      user-management, event-tracking, audit-log, activity, storefront-checkout LIVE;
      doku/midtrans/resend/cal-com/contact-form as capability cards w/ "needs: KEY/Convex").
- [ ] All `ssr:false` dynamic-imported; capability cards = static preview + add-recipe.
- **Risk:** heavy media slices (Konva/ONNX, reactflow, blocknote) — strict per-Act
  `next/dynamic`, lazy-on-scroll for media. Key-gated slices must NOT render dead buttons.
- **Gates:** `typecheck`, `gen:previews:check`, `audit:templates`.
- **Done:** all 6 Acts render; live slices interact on localStorage; key-gated show
  capability cards. **THIS is the new live demo — verify BEFORE any decommission.**

### P4 — init-seed Vercel deploy polish
- [ ] Confirm/extend `packages/cli/lib/starter/vercel.json` `buildCommand = build:auto`.
- [ ] `build:auto`: `CONVEX_DEPLOY_KEY` set → setup-auth + `convex deploy --cmd 'next build'`;
      unset → plain `next build` (zero-config Vercel).
- [ ] Ensure `convex/_generated` committed OR prebuild codegen runs (Vercel build won't codegen).
- [ ] `_README.md` note: showcase = `/tour` (Convex-free); your app = Vercel + Convex Cloud.
- **Risk:** starter ships via CLI — validate locally with a throwaway `init` before any publish.
- **Gates:** root `typecheck`; optional `sc-vercel` dry-run. **Done:** fresh
  `npx rr init <app>` builds green with no env AND with `CONVEX_DEPLOY_KEY` set.

### P4b — Generalize Pages-CRUD → reusable `pages-cms` slice
- [ ] Extract the generic Pages-CRUD (list/create/edit/publish pages composed of
      sections) from `components/templates/saas-marketing` admin into a general
      `frontend/slices/pages-cms/` slice (slice.json + slice.contract.ts +
      convex/features/pages-cms copy-source) — framework-agnostic of the saas template.
- [ ] Registered in `slices.ts` catalog + addable via `npx rr add pages-cms`; appears
      in the tour Content/Platform Act.
- **Gates:** `audit:slices`, `typecheck`. **Done:** `pages-cms` is a standalone
  addable slice; the saas-specific copy can be deleted in P6 without losing the reference.

### P5 — SSOT decommission: edit layouts.ts + redirects (no deletions yet)
- [ ] `lib/content/layouts.ts`: remove all ~38 entries (8 OS + ~30 section).
      (audit-templates Rule 3 becomes vacuous — 0 website-templates.)
- [ ] `next.config.mjs`: permanent 308 redirects for every removed `/layouts/<slug>`,
      `/templates/<slug>`, internal `/preview/<slug>/:path*` → `/tour#<act>` or `/slices/<slug>`.
- [ ] Repoint install examples: `start-options.tsx`, `installation/page.tsx`,
      `architecture/page.tsx` demo flow, `scaffold-template.mjs --from` defaults.
- [ ] **DO NOT** touch `template-subdomains.ts` or `proxy.ts` (external demos stay live).
- **Risk:** `generateStaticParams` in `[slug]` stops emitting removed slugs →
      `getLayout→notFound`; redirects MUST land THIS phase. Cross-check `app/sitemap.ts`.
- **Gates:** `typecheck`, `audit:templates`. **Done:** layouts.ts empty of these rows;
      every removed slug resolves via redirect (spot-check); NO dirs deleted yet.

### P6 — Delete orphaned dirs + regenerate manifest (3-surface sync)
- [ ] Delete internal `app/preview/<removed-slug>/` dirs (8 OS + section demos).
- [ ] Delete orphan `components/templates/<base>/` (KEEP `_shared`; saas-marketing
      already generalized in P4b) + `convex-templates/<removed-slug>/`.
- [ ] Delete `app/(docs)/templates/` route group + website-template grouping in
      `site-sidebar.tsx` / `docs-sidebar/build-sections.ts`.
- [ ] `npm run manifest:sync` → regenerate `packages/cli/lib/manifest.json` (drops
      template entries). MCP `rr://templates/*` + build-picker auto-follow.
- [ ] Clean `storefront-checkout/slice.json` `compat.templates` orphan keys;
      prune `lib/preview/shots.gen.json` rows + `public/shots/layouts/<slug>.webp` +
      `public/template-posters/<slug>.png`.
- **Risk:** verify no `*.preview.tsx` in PREVIEW_REGISTRY imports a deleted `<base>`
      (admin-panel/dashboard-shell previews use `_shared`, which is KEPT). Run
      `manifest:sync` AFTER deletions (prepublish `gen-manifest --strict` errors on missing dirs).
- **Gates:** `typecheck`, `audit:templates`, `validate:manifests`. **Done:** orphans
      deleted; manifest regenerated; MCP/build-picker reflect shrunk catalog; no dangling imports.

### P7 — Full gate sweep + e2e smoke + docs + post-deploy shots
- [ ] Full chain green: `typecheck` → `audit:templates` → `audit-catalog-completeness.mjs`
      (manual) → `slices:check` → `validate:all`.
- [ ] Add `/tour` assertion to `tests/e2e/site.spec.ts`.
- [ ] Update prose: `README.md`, `docs/PROGRESS.md`, `docs/STRUCTURE.md`,
      `docs/templates/*` (replace with one `/tour` doc), `docs/architecture/*`;
      append `CHANGELOG.md` wave entry (`validate:changelog` format).
- [ ] Post-deploy: `npm run shots:capture` for `/tour` (reads LIVE site — follow-up,
      NOT a pre-push blocker).
- **Gates:** `typecheck`, `audit:templates`, `audit-catalog-completeness.mjs`,
      `slices:check`, `validate:all`, `e2e` (or `e2e:staging`).
- **Done:** `validate:all` green, e2e green incl `/tour`, docs + changelog updated.
      Ship to main (auto-ship). CLI/MCP publish suggested to user only if
      `packages/cli`/`packages/mcp` changed + version bumped (user runs OTP).

---

## Gates reference

`typecheck` · `audit:slices` · `audit:templates` · `gen:previews:check` ·
`validate:manifests` · `slices:check` · `validate:all` · `validate:changelog` ·
`e2e` / `e2e:staging`

## Risk ledger

- `audit-catalog-completeness.mjs` is ad-hoc (not in CI) — run it manually in P7.
- `gen-manifest --strict` (prepublishOnly) errors on missing dirs → `manifest:sync` AFTER deletes.
- Heavy media slices inflate bundle → strict per-Act `next/dynamic ssr:false`.
- `shots:capture` is post-deploy — never gate the push on it.

## Progress log

_(loop appends one line per passed phase: `Pn PASS <score> — <recap>`)_

- P0 PASS 96 — `tour.ts` derives 6 Acts from `slices.ts` by `category` (68/68 covered, partition total+non-overlapping, 9 key-gated→capability-card); `/tour` renders hero + Act rail via inherited DocsShell; typecheck green; zero edits to layouts.ts/app/preview/manifest. Note for P1–P3: Act composition is `category`-driven (auto-derives) — if a slice feels misplaced (e.g. image-editor under Media vs OS), fix its `category` in slices.ts, not tour.ts.
