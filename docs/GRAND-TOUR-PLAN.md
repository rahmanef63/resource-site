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
- [x] `app/(docs)/tour/(act)/marketing/page.tsx` mounts marketing slices via lazy
      code-split (next/dynamic ssr:false + IntersectionObserver, reusing
      `VariantPreview`/`PREVIEW_REGISTRY`; iframe-only slugs via `previewPath`).
- [x] Each section shows its `npx rahman-resources add <slug>` recipe (`CopyButton`/`CodeBlock`).
- [x] Shared `app/(docs)/tour/(act)/layout.tsx` + `components/site/tour/{act-header,lazy-slice-mount,slice-showcase}.tsx` (reused by P2/P3).
- **Slices:** `landing-sections` (umbrella — hero/feature/pricing/faq/blog/testimonials/
  portfolio/changelog were merged into it as `kind` variants in v0.2.0), testimonials,
  services, marketing-chrome, motion-kit, motion-primitives, theme-presets,
  onboarding-wizard, contact-form-resend, seo.
- **Gates:** `typecheck`, `gen:previews:check`. **Done:** all section kinds render
  live + add-recipes; **confirms layouts.ts removal in P5 loses nothing user-facing.**

### P2 — Act 2: App Shell / OS anchor (the "assembled product" wow)
- [x] `app/(docs)/tour/(act)/os-appshell/page.tsx` (folder = act.id) iterates
      `getAct("os-appshell").sliceSlugs` (19). `appshell` FEATURED full-bleed via
      iframe of `/preview/slices/appshell` (the LIVE window-manager route — the
      registry entry is only a 360px static mockup; iframe also isolates the
      window-store provider). 18 others in 3 sections (App shells / UI primitives
      & states / Desktop apps), heavy apps (monaco/xterm/browser/monitor) last + lazy.
- [x] Code-split confirmed: `LazySliceMount` (next/dynamic ssr:false + IO) for
      registry slugs, `IframeThumbnail` (lazy IO) for iframe-only; no eager heavy imports.
- **Risk:** mount appshell's existing `preview.tsx`, do NOT re-instantiate its
  provider (double-mount/window-store bugs).
- **Gates:** `typecheck`, `gen:previews:check`. **Done:** live OS window surface;
  chunk-per-slice verified in build output.

### P3 — Acts 3–6: Media, AI, Content, Platform/Auth/Commerce
- [x] `media/page.tsx` (image-editor, reel-editor, media-studio, media-viewer,
      code-editor, system-monitor, os-terminal, browser, image-picker, icon-picker, markdown).
- [x] `ai/page.tsx` (ai-chat, ai-studio, ai-agents, assistant, ai-admin LIVE;
      create-your-mcp, seo, vector-search as capability cards).
- [x] `content/page.tsx` (notion, notion-shell, notion-database, notion-sidebar,
      comments, library, services, testimonials).
- [x] `platform/page.tsx` (admin-panel, platform-admin, convex-auth, rbac-roles,
      user-management, event-tracking, audit-log, activity, storefront-checkout LIVE;
      doku/midtrans/resend/cal-com/contact-form as capability cards w/ "needs: KEY/Convex").
- [x] All lazy/`ssr:false` code-split; capability cards = env-free iframe + "needs <KEY>" badge + add-recipe (`components/site/tour/capability-card.tsx`); `rate-limit` (backend-only) gets a static info-card fallback.
- **Risk:** heavy media slices (Konva/ONNX, reactflow, blocknote) — strict per-Act
  `next/dynamic`, lazy-on-scroll for media. Key-gated slices must NOT render dead buttons.
- **Gates:** `typecheck`, `gen:previews:check`, `audit:templates`.
- **Done:** all 6 Acts render; live slices interact on localStorage; key-gated show
  capability cards. **THIS is the new live demo — verify BEFORE any decommission.**

### P4 — init-seed Vercel deploy polish
- [x] `packages/cli/lib/starter/vercel.json` `buildCommand = npm run build:auto` — already shipped + verified.
- [x] `build:auto` (in `_package.json`): `CONVEX_DEPLOY_KEY` set → `setup-auth.mjs` + `convex deploy --cmd 'next build'`;
      unset → plain `next build`. Verified correct by inspection.
- [x] `convex/_generated`: not needed for the no-key Vercel path (starter app doesn't import it; `next build` doesn't typecheck `convex/`); deploy-key path codegens via `convex deploy`. Self-hosted/Docker commit-`_generated` flagged in README as a known follow-up.
- [x] `_README.md`: added **Deploy — Vercel + Convex Cloud** section (dual-surface: showcase `/tour` Convex-free, your app Vercel+Cloud via `build:auto`); updated `add` examples off the soon-deleted `personal-brand-os` to surviving slices + the `/tour` link.
- **Risk:** starter ships via CLI — validate locally with a throwaway `init` before any publish.
- **Gates:** root `typecheck`; optional `sc-vercel` dry-run. **Done:** fresh
  `npx rr init <app>` builds green with no env AND with `CONVEX_DEPLOY_KEY` set.

### P4b — Generalize Pages-CRUD → reusable `pages-cms` slice
- [x] Extract the generic Pages-CRUD (list/create/edit/publish pages composed of
      sections) from `components/templates/saas-marketing` admin into a general
      `frontend/slices/pages-cms/` slice (slice.json + slice.contract.ts +
      convex/features/pages-cms copy-source) — framework-agnostic of the saas template.
- [x] Registered in `slices.ts` catalog + addable via `npx rr add pages-cms`; appears
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

- P0 PASS 96 — `tour.ts` derives 6 Acts from `slices.ts` by `category` (68/68 covered, partition total+non-overlapping, 9 key-gated→capability-card); `/tour` renders hero + Act rail via inherited DocsShell; typecheck green; zero edits to layouts.ts/app/preview/manifest. Note for P1–P3: Act composition is **curated** (`ACT_SLUGS` explicit placement + `CATEGORY_FALLBACK` for future slugs + `tests/tour-coverage.test.ts` guarding total+disjoint) — see P1 below. `category` alone is a distribution taxonomy, not a showcase one.
- P1 PASS 93 — recomposed Acts from naive category-partition to a **curated** 6-Act showcase map (`ACT_SLUGS` + `CATEGORY_FALLBACK` + `tests/tour-coverage.test.ts`, wired as `audit:tour` in `slices:check`); 68/68 placed exactly once. Act I Marketing built (`landing-sections` umbrella + presentation slices), lazy code-split mount + rr-add recipes; verify confirmed coversOldDemos. typecheck + gen:previews + audit:tour green. **Decision:** the old `/layouts` marketing/cms/dashboard cookbook demos are now REDUNDANT (kinds shown by tour slices) → P5 retires them outright, no separate cookbook-iframe coverage needed.
- P2 PASS — Act II OS & App Shell built (`/tour/os-appshell`, 19 slugs). `appshell` featured as a live full-bleed OS via iframe of its window-manager route (provider-isolated, no double-mount); shells/primitives/desktop-apps in 3 lazy sections, heavy apps (monaco/xterm/browser/monitor) deferred. Reuses P1 infra verbatim. Caught+fixed: route folder was `os/` (→`/tour/os`) but act.id is `os-appshell` → rail/nav 404; renamed folder to match. typecheck + gen:previews + audit:tour green; build gate confirms route.
- P3 PASS — Acts III–VI built (Media 6 · AI 8 · Content 10 · Platform 15 = 39 slugs) via 4 parallel builders reusing P1/P2 infra. New shared `components/site/tour/capability-card.tsx` (env-free iframe + "needs &lt;KEY&gt;" badge) routes the 7 key-gated slugs (ai-router/vector-search/create-your-mcp, resend/cal-com/doku/midtrans) as honest cards, not dead buttons; `rate-limit` backend-only → static info-card. notion + image-editor featured. **Fixed (verify 88→pass):** all 6 Act pages used `slice.install ?? rr-add`, so slices with an npm `install` line showed `npm i …` instead of the rr-add recipe — stripped the fallback (also retroactively fixed P1 marketing + P2 os-appshell). typecheck + gen:previews + audit:tour green. **5/8 complete — `/tour` is the full live capability showcase; P3 done-criteria met → P5/P6 decommission now unblocked.**
- P4 PASS 91 — init-seed Vercel deploy: `vercel.json` + `build:auto` + `setup-auth.mjs` already shipped (prior session), verified correct by inspection (deploy-key → Convex Cloud deploy + codegen + `NEXT_PUBLIC_CONVEX_URL`; no key → plain `next build`, safe — starter app doesn't import `_generated`). Genuine deliverable = `_README.md` **Deploy** section (dual-surface: `/tour` Convex-free, your app Vercel+Cloud) + `add` examples moved off the soon-deleted `personal-brand-os` to surviving slices + `/tour` link. Live `vercel deploy` is user-triggered (sc-vercel). Follow-up flagged: commit `convex/_generated` for self-hosted/Docker clones.
- P4b PASS 96 — promoted the `_shared/pages` CRUD engine into a first-class addable `frontend/slices/pages-cms` slice (32 files). Severed all landing/crud "BI-wave" couplings (`PageSectionsEditor` + `nav-builder` admin-shell + `sections` field dropped) so `blocks[]` (11 kinds) is the sole primitive — zero `templates/_shared`/saas imports, survives P6. Ships a generic Home/About/Pricing `defaultPages()` seed + localStorage demo (Hard Rule 6); `convex/features/pages-cms` is copy-source (NOT in schema). Version SSOT 0.1.0 across slice.json/contract/manifest/catalog; registered in catalog (addable `npx rahman-resources add pages-cms`) + `ACT_SLUGS.content` (Act V). All 8 gates green (typecheck/audit:slices/validate:contracts/validate:manifests/gen:slices/gen:previews/audit:tour/audit:file-size); adversarial verify 96/100. **CMS reference preserved as a general feature — saas-marketing now safe to delete in P6. 6/9 phases; decommission (P5/P6) next.**
