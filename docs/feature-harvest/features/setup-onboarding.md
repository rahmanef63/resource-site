# First-run setup & onboarding wizard

> Harvest slug: `setup-onboarding` · companion to existing rr slice `onboarding-wizard`.
> **Two different "first-run" engines live in the two reference projects.** Instatic
> ships an *install bootstrap* (claim the first owner + provision the site atomically,
> pre-auth). personal-brand-os ships a *post-claim config wizard* + a *self-diagnosing
> setup health page* + a *demo-seed engine*. The wizard UI half is already an rr slice;
> the backend engine + bootstrap + health page are **not**.

## What it does (flow)

Two distinct flows, both gated on "is this a fresh install?".

### A. Instatic — pre-auth install bootstrap (one-shot owner claim)
1. The unauthenticated admin shell mounts `useAdminBoot()`. It fires three boot
   probes (preferably consuming SSR-preflighted promises on `window.__instaticBootPromises`,
   else fetches): `setup/status`, `me`, `public-site`.
2. `setup.getStatus` returns `{ hasSite, hasAdmin, hasOwner, needsSetup }`.
   `needsSetup = !hasSite || !hasOwner`. If `needsSetup` → boot phase = `setup`;
   else → `login` or `editor` depending on the `/me` probe.
3. `public-site` (`setupTx.publicSiteRow`) returns the site name + favicon URL with
   no auth, so the setup/login card renders the operator's brand, not the product default.
4. The `setup` phase renders `AdminPreAuthForm` (a 3-in-1 form: `setup | login | mfa`).
   On submit, the client validates password >= 12 chars and POSTs
   `{ siteName, email, password }` to `/admin/api/cms/setup`.
5. The handler re-checks `getSetupStatus()` and **409s if setup is already complete**
   (this is what lets the endpoint stay public without being an account-creation backdoor).
   It hashes the password Bun-side, mints nanoid PKs for the owner + homepage, builds a
   starter `base.body` page tree, then calls ONE atomic Convex mutation
   `setupTx.bootstrapInstall`.
6. `bootstrapInstall` writes 4 rows in one transaction (crash mid-way → full rollback):
   upsert `site` singleton, insert the first `users` row (`role_id: 'owner'`, with a
   pre-write active-email uniqueness guard), insert a `user.create` `audit_events` row,
   and seed a draft homepage into `data_rows` (`table_id: 'pages'`).
7. On 201 the client immediately logs in with the same credentials and transitions to the editor.
   A process-level `getSetupStatusCached` memo then short-circuits the status read forever
   (needsSetup only ever goes true→false).

### B. personal-brand-os — post-claim config + health + seed
1. `convex/setup.ts:status` (public, no PII) returns
   `{ ownerClaimed, seeded, authReady, onboarded, signupOpen, signupKeyRequired }`,
   derived from first-row probes on `users`/`posts`/`landingSections`/`siteSettings`
   plus env checks (`ADMIN_SIGNUP_KEY`, `JWT_PRIVATE_KEY`).
2. Optional zero-touch owner: `setup.bootstrapAdmin` (action) auto-creates the owner via
   `@convex-dev/auth` `createAccount` from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env — no-ops once
   any owner exists. The login form calls it on first load.
3. `/setup` route → `SetupHealth` self-diagnosing checklist walks a ladder:
   env present? → backend deployed (functions answer vs throw)? → owner claimed? → seeded?
   → onboarded? Each unfinished step renders a plain-language fix + a deep link.
4. After login, the admin gate shows the **onboarding wizard** (the rr slice) while
   `status.onboarded === false`. The wizard collects identity/branding/content fields and
   on finish calls `settings.upsert({ ...fields, markOnboarded: true })`, stamping
   `siteSettings.onboardedAt`. "Lewati setup" saves only `markOnboarded: true`.
5. The wizard's content step offers a one-click `seed.seedSample` (auth-gated,
   only-when-empty — never wipes real content). Power users instead run `seed.run`
   (CLI, destructive wipe+insert) or `seed.seedDemo` (internal).

## Where it lives

### Instatic (`/home/rahman/projects/Instatic-convex`)
- `convex/setup.ts` — `getStatus` query, `createSite` upsert mutation.
- `convex/setupTx.ts` — `publicSiteRow` query (unauth identity), `bootstrapInstall`
  atomic mutation (site + owner + audit + homepage).
- `server/handlers/cms/setup.ts` — REST: `GET /admin/api/cms/setup/status`,
  `GET /admin/api/cms/public-site`, `POST /admin/api/cms/setup` (one-shot, 409-guarded).
- `server/repositories/setup.ts` — thin pass-through + `getSetupStatusCached` process memo.
- `src/admin/preauth/AdminPreAuthForm.tsx` — pre-auth `setup|login|mfa` form (3-in-1).
- `src/admin/preauth/useAdminBoot.ts` — boot probe → phase resolution (SSR-preflighted, flushSync).
- `src/admin/preauth/AdminPreAuthForm.module.css` — form styles.
- `convex/schema.ts` — `site` (`by_app_id`), `users` (`by_app_id`/`by_email_normalized`/`by_role_id`),
  `audit_events`, `data_rows`.

### personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)
- `convex/setup.ts` — `status` query + `bootstrapAdmin` action (env-driven owner claim).
- `convex/seed.ts` — `run` (CLI wipe), `seedDemo` (internal), `seedSample` (in-app, only-when-empty),
  `syncLanding`, `syncServicesCommerce`.
- `convex/seedPoster.ts` — one-shot `apply` landing patch.
- `convex/landingContent.ts` — single source for seed + render content (HERO/STATS/FEATURES/…).
- `app/setup/page.tsx` — `/setup` route (noindex), renders `SetupHealth`.
- `components/setup/setup-health.tsx` — self-diagnosing checklist (env→backend→owner→seeded→onboarded).
- `components/onboarding/onboarding-wizard.tsx` — host adapter wiring `@/features/onboarding-wizard`
  to `settings.upsert` / `seed.seedSample` / `setup.status` + theme-presets + ImageField.
- `convex/schema.ts` — `siteSettings` singleton (`onboardedAt`, all identity/brand fields).

### rr (`/home/rahman/projects/resources`)
- `frontend/slices/onboarding-wizard/` — UI-only tier-3 slice (v0.2.0). Covers the wizard half.
  Origin = pbos `components/onboarding`. **No backend feature** under `convex/features/`.

## Data model

### Instatic (server-managed auth, nanoid string PKs, `*_json` blobs)
- `site` — `{ id:'default' (singleton), name, settings_json, created_at, updated_at }`,
  index `by_app_id`. `settings_json` stores `{ site: { settings: { faviconUrl, … } } }`.
- `users` — first row inserted with `role_id:'owner'`, `status:'active'`, `password_hash`,
  `email_normalized`, mfa fields, `step_up_auth_mode`. Indexes `by_app_id`, `by_email_normalized`,
  `by_role_id`. Owner-claim guard: read `by_email_normalized`, reject if any `deleted_at === null`.
- `audit_events` — `{ id, actor_user_id:null, action:'user.create', target_type:'user',
  target_id:<ownerId>, metadata_json, ip_address, user_agent, created_at }`.
- `data_rows` — starter homepage `{ id, table_id:'pages', cells_json, slug:'index', status:'draft', author_user_id, … }`.

### personal-brand-os (`@convex-dev/auth`, `_id` PKs)
- `siteSettings` (singleton) — `siteName, tagline, ownerName, contactEmail, brandColor,
  themeDefault, themePreset, logoUrl, faviconUrl, analyticsId, socials(JSON), seoDescription,
  aboutContent(JSON), onboardedAt`. The wizard writes a subset + `onboardedAt = Date.now()`.
- Status probes `users`/`posts`/`landingSections` first-rows; env `ADMIN_SIGNUP_KEY`,
  `JWT_PRIVATE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Seed targets: `posts`, `portfolio`, `services`, `resources`, `landingSections` (template-specific content).

## Public API

### Instatic
- `query setup.getStatus()` → `{ hasSite, hasAdmin, hasOwner, needsSetup }`.
- `mutation setup.createSite({ name, settings })` → null (site upsert).
- `query setupTx.publicSiteRow()` → `null | { id, name, settings_json, created_at, updated_at }`.
- `mutation setupTx.bootstrapInstall({ siteName, siteSettings, owner{…}, audit{…}, homePage{…} })` → null.
- REST: `GET …/setup/status`, `GET …/public-site`, `POST …/setup` → `201 {ok}` or `409`.

### personal-brand-os
- `query setup.status()` → `{ ownerClaimed, seeded, authReady, onboarded, signupOpen, signupKeyRequired }`.
- `action setup.bootstrapAdmin()` → `{ ok, email } | { ok:false, reason }`.
- `mutation seed.seedSample()` → `{ seeded, …counts }` (auth + only-when-empty).
- `mutation seed.run()` / `internalMutation seed.seedDemo()` / `mutation seed.syncLanding()` / `seed.syncServicesCommerce()`.
- `mutation settings.upsert(Partial<fields> & { markOnboarded })` — wizard `save` target (in host's settings module).

## UI surface
- **Instatic admin (pre-auth):** `AdminPreAuthForm` (setup/login/mfa, brand row from `publicSite`),
  driven by `useAdminBoot`. Plain CSS-module styling, in-house primitives (`Button`, `Input`).
- **pbos public/admin:** `/setup` `SetupHealth` checklist (shadcn `Card`, lucide icons, error boundary
  for "backend not deployed"); `OnboardingWizard` host adapter (shadcn).
- **rr (existing):** `OnboardingWizard`, `StepIdentity`, `StepBranding`, `StepContent`, `StepDone`,
  `ThemePresetField`, `Field` — shadcn `button/card/input/label/progress/select`, props-driven.

## Dependencies
- **npm:** `nanoid` (Instatic PKs), `@convex-dev/auth` (pbos owner claim), `convex`, `lucide-react`,
  `react`. Instatic adds Bun-side `hashPassword`, TypeBox, `@core/page-tree`.
- **rr-slice deps:** existing `onboarding-wizard` (wizard UI). Optional bridges: `theme-presets`
  (preset picker), an injected `ImageField` (e.g. `image-picker`/host upload), `convex-auth`
  (owner claim), `rbac-roles` (`owner` role), `audit-log` (the `user.create` event).

## rr coverage

**partial.** The *wizard UI* half is fully covered by the existing slice `onboarding-wizard`
(v0.2.0) — it literally originated from pbos `components/onboarding`, and the rr catalog
agentRecipe documents the exact `setup.status().onboarded === false` gate. What is **net-new**
(no rr equivalent):

1. **The backend setup engine.** rr has zero `convex/features/setup*` / `settings*` / `seed*`.
   Every host hand-rolls `setup.status`, `settings.upsert(... markOnboarded)`, and a
   `seed.seedSample` (auth-gated + only-when-empty). HOST-SETUP.md just says "back it with a
   mutation".
2. **The self-diagnosing health page** (`SetupHealth`) — env→backend→owner→seeded→onboarded
   ladder with deep-linked fixes. Genuinely useful for any clone-to-own template; not in rr.
3. **First-owner-claim bootstrap** — neither pbos `bootstrapAdmin` (env zero-touch owner) nor
   Instatic `bootstrapInstall` (atomic site+owner+audit+homepage). The closest rr slice is
   `convex-auth`, but it has no "claim the first owner / one-shot install guard" surface.

Proposed slug for the missing half: **`setup-onboarding`** (companion to `onboarding-wizard`).

## Slice plan

**Action: build-new (backend + health) on top of reuse (`onboarding-wizard` UI).**
Honest framing: the feature is ~60% covered. Don't rebuild the wizard — reuse it. Build the
*missing backend engine + health page* as a sibling slice so hosts stop hand-rolling.

**Ponytail (laziest correct path):**
- Keep `onboarding-wizard` exactly as-is (UI, props-driven). No change.
- New slice `setup-onboarding` = thin **portable backend trio** + one **`SetupHealth` component**:
  - `convex/features/setup-onboarding/` exporting `setupOnboardingTables` (a `settings` singleton
    table with `onboardedAt` + identity fields) and: `status` query (probe-based, returns
    `{ ownerClaimed, seeded, onboarded }` via injected probe table names or a config), `upsert`
    mutation (patch provided fields + optional `markOnboarded`, `requireAdmin`), `seedSample`
    mutation (auth-gated, only-when-empty, takes an injected inserter — **no template content baked in**).
  - `frontend/slices/setup-onboarding/components/SetupHealth.tsx` — props-driven checklist
    (steps + states + fix links passed in, copy via props, no hardcoded Convex/Vercel/Indonesian text).
  - Optionally a tiny `claimOwner`/`bootstrapAdmin` shim behind the `convex-auth` slice (env names
    as props/config, not literals) — but ponytail says ship status+upsert+seedSample+health first;
    owner-claim only if a consumer asks.
- Lazier still: if the maintainer prefers one artifact, **enhance** `onboarding-wizard` by adding
  a `convex/features/onboarding-wizard/` backend export instead of a second slice. Pick build-new
  only because the health page + status engine serve installs that don't use the wizard.

**Portability blockers to strip (hardcode = lift blocker):**
- Instatic: server-managed-auth coupling (no `@convex-dev/auth`), Bun-side `hashPassword`, nanoid
  string-PK scheme, `*_json` blob convention, `role_id:'owner'` literal, REST prefix
  `/admin/api/cms`, the homepage `data_rows`/`base.body` page-tree seed (Instatic content model),
  `audit_events` shape.
- pbos: env names `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_SIGNUP_KEY`/`JWT_PRIVATE_KEY`, the demo
  seed content (`posts`/`portfolio`/`services`/`landingSections` from `landingContent.ts`),
  hardcoded Indonesian copy in `SetupHealth`, `NEXT_PUBLIC_CONVEX_URL`/Vercel-specific instructions,
  `text-brand`/`CORE_VERSION`/`convex.dev` literals, the `siteSettings` singleton field list.

**Effort: M** (one Convex feature trio + one shadcn health component, both props-/config-driven;
reuse the wizard; owner-claim deferred).

**Proposed `slice.json` shape (`frontend/slices/setup-onboarding`):**
```json
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "setup-onboarding",
  "version": "0.1.0",
  "category": "ui",
  "kind": "ui",
  "title": "Setup & Onboarding Engine — status, seed, health checklist",
  "description": "Backend + diagnostics companion to onboarding-wizard. Convex `settings` singleton (onboardedAt + identity), a props-driven first-run `status` query, an admin-gated `upsert` (markOnboarded) and only-when-empty `seedSample`, plus a self-diagnosing `SetupHealth` checklist (env→backend→owner→seeded→onboarded with deep-linked fixes). No template content, copy, or env names baked in.",
  "namespace": "@/features/setup-onboarding",
  "deps": {
    "npm": [],
    "shadcn": ["button", "card"],
    "env": [],
    "peers": ["onboarding-wizard"]
  },
  "convex": { "feature": "convex/features/setup-onboarding", "tablesExport": "setupOnboardingTables" },
  "contract": {
    "provides": {
      "components": ["SetupHealth", "StepRow"],
      "queries": ["status"],
      "mutations": ["upsert", "seedSample"],
      "types": ["SetupStatus", "SettingsFields"]
    }
  }
}
```
