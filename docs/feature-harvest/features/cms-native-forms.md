# CMS Native Forms (builder + submissions)

> Harvest verdict: **net-new**. Proposed slice `cms-native-forms` =
> `frontend/slices/cms-native-forms/` + `convex/features/cms-native-forms/`.
> The harvest gold is the **secure public submission pipeline** (HMAC page
> token + single-use challenge + honeypot + min-fill-time + rate limit +
> generic field-validation engine) and the **author-builds-the-form** model.
> The *visual-canvas-on-page-tree* incarnation in Instatic is NOT portable
> (it needs the whole CMS engine); the slice re-expresses the form definition
> as a self-contained field-schema instead of page-tree nodes.

## What it does (flow)

Instatic has **no dedicated "form builder" UI**. A form is just a subtree of
ordinary visual-editor primitive nodes (`base.form` wrapping `base.label` /
`base.input` / `base.textarea` / `base.select` / `base.checkbox` /
`base.radio` / `base.submit` / `base.form-message`). The author either drops
those nodes, applies a preset (which inserts the same primitives), or pastes
semantic HTML that `@core/htmlImport` maps onto these same modules. A
contextual `FormSettingsPanel` augments the generic property panel: it picks a
target `data` table, binds each control to a field, can *create a new table
from the authored controls*, and warns about unbound controls / duplicate
names / controls outside a form.

End-to-end control flow:

1. **Author time.** `base.form` has `mode: 'cms' | 'custom'`. In `cms` mode it
   carries `formId` (machine id, normalized identifier), `targetTableId`,
   `honeypotName` (default `company`), `minSubmitSeconds` (default `2`), and
   success behavior (message vs redirect). Each control node carries a
   `fieldId` binding it to a column of the target table.

2. **Publish time.** The publisher bakes the page to clean HTML. `base.form`'s
   `render()` emits the `<form>` plus, when `mode==='cms'`, ships a vanilla
   IIFE browser runtime through the module-JS channel (served at
   `/_instatic/module-js/base.form.js`). A post-render step,
   `stampFormPageTokens` (`server/forms/formRuntime.ts`), regex-rewrites every
   CMS `<form>` tag to inject `data-instatic-page-token` (a **stateless HMAC**
   over `pageId+formId`, no expiry) and `data-instatic-page-id` — on both baked
   pages and lazy `<instatic-hole>` fragments.

3. **Request time (server, on demand).** The submission handler never trusts
   client-declared fields/tables. It reloads the latest published site
   snapshot and **re-derives the form snapshot** from the published page tree
   (`derivePageFormSnapshots` in `src/core/forms/snapshot.ts`): it walks the
   form subtree, collects control bindings, infers label→control targets,
   gathers submits and messages.

4. **Visitor time (browser runtime).** On form attach the runtime
   (`formRuntimeJs.ts`) finalizes auto `<label for>` wiring, prepares
   status/success/error message slots, and **prefetches a challenge** from
   `POST /_instatic/form/challenge` (sends `pageId+formId+pageToken`). On
   submit it `POST`s values + token + challenge to
   `/_instatic/form/submit`.

5. **Persist.** `handleSubmit` (`server/forms/handler.ts`) verifies+consumes
   the challenge, enforces min-fill-time (measured from challenge issue), strips
   + checks the honeypot, loads the target `DataTable`, requires it to be a
   non-system `data` table (`isFormSubmissionTargetTable`), validates values
   against the table's fields (`validateFormSubmission`), and writes a
   `data_rows` record via `createDataRow`.

## Where it lives

**Instatic (`/home/rahman/projects/Instatic-convex`)**
- `docs/features/cms-native-forms.md` — the feature spec (source of this harvest).
- `src/core/forms/snapshot.ts` — `derivePageFormSnapshots` / `deriveFormSnapshot` (walks the page tree → `PublishedFormSnapshot`).
- `src/core/forms/validation.ts` — `validateFormSubmission` (the portable validation engine: coercion + required + email/url/number/select/pattern/min/max/length + payload caps).
- `src/core/forms/schemas.ts` — TypeBox schemas: `FormControlBinding`, `PublishedFormSnapshot`, `PublicFormSubmitBodySchema`, `PublicFormChallengeBodySchema`, `FormValidationError`.
- `src/core/forms/targets.ts` — `isFormSubmissionTargetTable` (kind==='data' && !system).
- `src/core/forms/index.ts` — barrel.
- `server/forms/handler.ts` — `handlePublicFormRequest` → challenge + submit routes, origin/Fetch-Metadata CSRF gate, body-size caps.
- `server/forms/challenge.ts` — HMAC sign/verify of page tokens + short-lived single-use challenges (in-memory `Map`, TTL 5min, evict at 2000).
- `server/forms/rateLimit.ts` — four `RateLimiter`s (per-IP + per-IP/form, for challenge + submit).
- `server/forms/formRuntime.ts` — `stampFormPageTokens` regex stamper.
- `src/modules/base/forms/index.ts` — the 11 form-primitive `ModuleDefinition`s (props schemas + `render()` → semantic HTML w/ `data-instatic-*` attrs).
- `src/modules/base/forms/formRuntimeJs.ts` — the published browser runtime IIFE.
- `src/modules/base/forms/FormControls.tsx` — canvas editor components.
- `src/admin/pages/site/panels/PropertiesPanel/FormSettingsPanel.tsx` (+ `formSettingsAnalysis.ts`, `formSettingsNaming.ts`) — the contextual author UI.
- `convex/schema.ts` — `data_tables` + `data_rows` generic store (submissions land here).

**personal-brand-os (`/home/rahman/projects/_templates/personal-brand-os`)**
- `frontend/slices/contact/ContactPage.tsx` — a *single hardcoded* React contact form (name/email/topic/message + inline honeypot + client validation) dispatching `lead.create`.
- `convex/leads.ts` — `leads.create` (anonymous, `limitPublicWrite` rate gate, length caps) + `list`/`update`/`remove` (auth-gated).

## Data model

Instatic uses a **generic table store**, not per-form tables. Submissions are
just rows whose table happens to be the form's target:

- `data_tables` (`convex/schema.ts:159`): `{ id (nanoid v.string), name, slug, kind: 'postType'|'data'|'page'|'component'|'layout', route_base, singular_label, plural_label, primary_field_id, fields_json (v.string — the `DataField[]` blob), system: bool, …audit }`. Indexes `by_app_id`, `by_slug`. Only `kind==='data' && system===false` tables can receive form submissions.
- `data_rows` (`convex/schema.ts:185`): `{ id, table_id, cells_json (v.string — the submitted `{ fieldId: value }`), slug, status, active_version_id, author/created/updated/published_by_user_id, …timestamps }`. Indexes incl `by_table_status_updated`, `by_table_updated`.
- `DataField` (`src/core/data/schemas.ts`) is a discriminated union over `type`: `text | longText | richText | number | boolean | date | dateTime | url | email | select | multiSelect | media | relation | pageTree | fieldSchema` (select/multiSelect carry `options[{id,label}]`; media/relation carry `allowMultiple`). `pageTree`/`fieldSchema` are rejected for form submission.

**Challenge state** is *in-memory* in Instatic (Bun single process). It does
not persist in any table.

For the rr slice (Convex serverless = no cross-call process memory) the model
becomes self-contained:
- `cnf_forms` — `{ id, slug, title, fieldsJson (the field schema), honeypotName, minSubmitSeconds, successMessage, redirectUrl, enabled, createdBy, createdAt, updatedAt }`. Index `by_app_id`, `by_slug`, `by_enabled`.
- `cnf_submissions` — `{ id, formId, cellsJson, status: 'new'|'read'|'archived', ip?, createdAt }`. Index `by_form_created`, `by_form_status_created`.
- `cnf_challenges` — `{ challenge, formId, issuedAt, expiresAt }`. Index `by_challenge`. (Replaces the in-memory `Map`; consume = delete-by-index; a cron or lazy-prune evicts expired.) Page token stays a **stateless HMAC** — no row needed.

## Public API

Instatic (Bun HTTP, not Convex functions):
- `POST /_instatic/form/challenge` — body `{ pageId, formId, pageToken }` → `{ token, challenge, expiresAt }`. Verifies page token, rate-limits per IP + per IP/form, caps body at 8 KiB.
- `POST /_instatic/form/submit` — body `{ pageId, formId, token, challenge, values }` → `{ ok, rowId }`. Consumes challenge, min-fill-time, honeypot, validates, `createDataRow`. Caps body at 1 MiB. Error shape `{ error, errors?: FormValidationError[] }`.
- `GET /_instatic/module-js/base.form.js` — the browser runtime.
- Admin form authoring is implicit in the generic editor save path (no dedicated form REST surface).

Proposed rr public API (`convex/features/cms-native-forms/`):
- `forms.list` / `forms.get` — `query`, `requireAdmin` for list, public `get` by slug returns only render-safe fields (no submissions).
- `forms.upsert` / `forms.remove` — `mutation`, `requireAdmin`, args validated `v.*`.
- `forms.issueChallenge` — public `mutation`: args `{ formId, pageToken }`; verify HMAC page token, rate-limit (rr `rate_limit` slice), insert `cnf_challenges` row, return `{ token, challenge, expiresAt }`.
- `forms.submit` — public `mutation`: args `{ formId, token, challenge, values: v.record(v.string(), v.any()) }`; consume challenge, min-fill, honeypot, `validateFormSubmission`, insert `cnf_submissions`. No `requireUser` (anonymous by design) — security comes from the layered gates below.
- `submissions.list` / `submissions.setStatus` / `submissions.remove` — `requireAdmin`, indexed reads (`.withIndex(...).take/paginate`, never `.collect()`).
- A `pageToken` HMAC helper signed with `CNF_FORM_SECRET` env, rendered into the public `<Form>` server-side (rr is Next 16 — stamp in a Server Component / route handler, not a regex over baked HTML).

## UI surface

**Admin (Instatic):** `FormSettingsPanel.tsx` (contextual block in Properties
panel) — segmented `cms`/`custom` mode selector, Form ID input, live-loaded
target-table `<Select>`, per-control field picker, "create table from form
controls" dialog, "insert missing fields" one-click, and an editor-only
preview-state switch (`default|submitting|success|error`). Plus the 11 canvas
editor components in `FormControls.tsx`. No standalone forms admin route.

**Public (Instatic):** semantic baked HTML `<form>` + the ~vanilla IIFE runtime
(`formRuntimeJs.ts`) — auto `<label for>` wiring, busy state on buttons,
status/success/error message swapping, challenge prefetch, redirect-on-success.
Zero framework runtime in published output.

**personal-brand-os:** `ContactPage.tsx` — one fixed shadcn card form.

Proposed rr UI:
- Admin: `<FormBuilder>` (add/reorder/configure fields — shadcn primitives, `DateField`/`FileUpload` per rr rules), `<SubmissionsTable>` (reuse rr `data-table` slice for the list).
- Public: `<Form schema slug onSubmit?>` renderless-ish renderer that calls `forms.issueChallenge` on mount + `forms.submit` on submit; honeypot + min-fill + success/error states baked in. Props-driven (no hardcoded copy/URLs).

## Dependencies

**Instatic npm:** none provider-specific — `node:crypto` (HMAC/timingSafeEqual),
TypeBox (`@sinclair/typebox`), DOMPurify (publisher boundary). Internal:
`@core/page-tree`, `@core/module-engine`, `@core/publisher`, `@core/data`,
`server/auth/security` + `server/auth/rateLimit`, `server/repositories/{data,publish}`.

**personal-brand-os:** `convex/react`, `sonner`, shadcn input/textarea/card/button.

**Proposed rr slice deps:**
- npm: none required (HMAC via Web Crypto `crypto.subtle` in a Convex action, or `node:crypto` in the Next route). No Resend coupling (unlike `contact-form-resend`).
- rr-slice peers: `convex-auth` (admin gate only — submit is anonymous), `rate_limit` (public-write throttle — already the canonical rr limiter), optional `data-table` (submissions list UI), optional `resend-newsletter` (notify-on-submit, injectable).
- shadcn: `button`, `input`, `textarea`, `label`, `select`, `checkbox`, `card`.

## rr coverage

**net-new.** Honest check of the candidates:

- `contact-form-resend` (catalog-only, `template-base/frontend/slices/contact-form-resend`, **no slice dir on disk**) — a *single hardcoded* contact form → Resend + one Convex mutation. Not a builder, no challenge/token model, no generic validation engine, no submissions admin. TEMPLATE feature, not the engine.
- personal-brand-os `contact` + `convex/leads.ts` — same shape: one fixed form, one `leads` table, `limitPublicWrite` only. Good reference for the *anonymous-mutation + rate-limit* baseline but covers ~10% of this feature.
- rr `comments` slice — threaded comments; unrelated mechanics.
- rr `pages-cms` slice — block-composed multi-page CMS (11 fixed block kinds), pure UI, **no Convex, no form block, no submissions**. Could *host* a form block later but doesn't cover it.
- rr `data-table` slice — display grid only; not a submission store.

No existing rr slice provides: a form *definition* model the author edits, a
generic field-**validation engine**, or the **secure anonymous public-submit
pipeline** (page-token + single-use challenge + honeypot + min-fill +
per-IP/per-form rate limit + non-trusted-client re-derivation). That whole
spine is net-new and is the harvest value.

## Slice plan

**Action: build-new** (`cms-native-forms`).

**Laziest correct path (ponytail):** do NOT port the visual-canvas-on-page-tree
builder — that's married to `@core/page-tree` + `@core/module-engine` +
publisher and would drag the entire CMS in. Instead lift the two *portable*
pieces almost verbatim and re-host them:

1. **Lift `src/core/forms/validation.ts` nearly as-is** into
   `frontend/slices/cms-native-forms/lib/validation.ts` — it's a pure function
   over `{ table fields, control bindings, values }`. Swap the `DataField`
   discriminated union for the slice's own self-contained `FormField` type
   (same `type` enum minus `pageTree`/`fieldSchema`). This is the single most
   reusable artifact; keep its error-code vocabulary (`required`, `too_long`,
   `invalid_email`, `invalid_option`, `pattern_mismatch`, …).
2. **Re-express the form definition** as a flat `FormField[]` JSON schema
   (id, label, type, required, options, min/max/length/pattern) — NOT page-tree
   nodes. `<FormBuilder>` edits that array; `<Form>` renders it.
3. **Translate the security model to Convex.** Page token = stateless HMAC over
   `formId` with `CNF_FORM_SECRET` (port `signPageToken`/`constantTimeEqual`
   from `server/forms/challenge.ts`). Challenge = `cnf_challenges` row
   (issue→insert, consume→delete-by-index) instead of an in-memory `Map`.
   Keep honeypot + min-fill-time + per-IP/per-form rate limit (via rr
   `rate_limit`). Keep the "server re-derives, never trusts client field list"
   invariant by reading the `cnf_forms` row at submit time.

**Portability blockers to strip (hard-coupling in Instatic):**
- Page-tree node model — `derivePageFormSnapshots` walks `Page.nodes`; replace with reading a stored `FormField[]`.
- `@core/module-engine` registry + `render()` HTML-string emission + `/_instatic/module-js/base.form.js` channel — replace with a React `<Form>` component.
- `stampFormPageTokens` regex over baked HTML — replace with server-rendered token in a Next Server Component / route handler.
- `data_tables`/`data_rows` generic store + `getLatestPublishedSiteSnapshot` — replace with dedicated `cnf_forms`/`cnf_submissions` tables.
- Bun `Bun.serve` router + `node:crypto` in-memory `Map` + `/_instatic/*` routes + `INSTATIC_FORM_SECRET` — replace with Convex mutations/actions + `cnf_challenges` table + `CNF_FORM_SECRET`.
- TypeBox schemas → Convex `v.*` validators (rr convention).
- `server/auth/security` origin/Fetch-Metadata CSRF gate — Next route handlers get this differently (Sec-Fetch-Site header check in `proxy.ts` / route); keep the *intent*.

**Effort: L.** It's a builder UI + public renderer + a real secure backend
(token/challenge/honeypot/rate-limit) + the validation engine + submissions
admin. Each piece is small (<200 LOC) but there are several, plus the Convex
adaptation of the in-memory challenge store.

**Proposed `slice.json` shape** (mirrors the current `comments` canonical —
`contract` folded into `slice.json`, version SSOT paired with
`slice.manifest.json`):

```jsonc
{
  "$schema": "https://resource.rahmanef.com/slice-schema.json",
  "slug": "cms-native-forms",
  "version": "0.1.0",
  "category": "content",
  "title": "CMS Native Forms — builder + submissions",
  "description": "Author-defined forms (field-schema builder, no page-tree needed) with a hardened anonymous public-submit pipeline: stateless HMAC page token + single-use challenge + honeypot + min-fill-time + per-IP/per-form rate limit, generic field-validation engine (email/url/number/select/pattern/min/max), submissions stored in cnf_submissions with an admin review table.",
  "namespace": "@/features/cms-native-forms",
  "kind": "full",
  "convex": {
    "tablesExport": "cmsNativeFormsTables",
    "schemaPath": "convex/features/cms-native-forms/_schema.ts",
    "rootPaths": ["convex/features/cms-native-forms"]
  },
  "frontend": {
    "slicePath": "frontend/slices/cms-native-forms",
    "configExport": "cmsNativeFormsConfig"
  },
  "deps": {
    "npm": [],
    "shadcn": ["button", "input", "textarea", "label", "select", "checkbox", "card"],
    "env": [
      { "name": "CNF_FORM_SECRET", "scope": "convex", "required": true,
        "description": "HMAC signing secret for page tokens + challenges." }
    ],
    "peers": [
      { "slug": "convex-auth", "range": "^0.1", "reason": "Admin builder + submissions review gate; public submit is anonymous." },
      { "slug": "rate-limit", "range": "^0.1", "reason": "Per-IP / per-form throttle on challenge + submit." }
    ]
  },
  "registers": ["registry"],
  "audit": ["bp:public-fn-validator"],
  "license": "MIT",
  "tags": ["content", "forms", "form-builder", "submissions", "lead-capture", "anti-spam"],
  "contract": {
    "requires": {
      "auth": "convex",
      "rbac": ["form.manage", "submission.read"],
      "convex": { "prefix": "cnf_", "tables": ["cnf_forms", "cnf_submissions", "cnf_challenges"] },
      "deps": ["convex-auth", "rate-limit"]
    },
    "provides": {
      "tools": ["forms.list", "forms.get", "forms.upsert", "forms.remove",
                "forms.issueChallenge", "forms.submit",
                "submissions.list", "submissions.setStatus", "submissions.remove"],
      "tables": ["cnf_forms", "cnf_submissions", "cnf_challenges"],
      "components": ["FormBuilder", "Form", "SubmissionsTable"],
      "hooks": ["useFormSubmit"],
      "utils": ["validateFormSubmission", "signPageToken"]
    },
    "generalization": {
      "level": "portable",
      "forbiddenTerms": ["data_tables", "data_rows", "_instatic", "page-tree", "INSTATIC_FORM_SECRET"],
      "requiredProps": ["schema", "slug"]
    }
  }
}
```

**Backend layout** `convex/features/cms-native-forms/`: `_schema.ts`
(`cmsNativeFormsTables`), `forms.ts` (list/get/upsert/remove +
issueChallenge/submit), `submissions.ts` (list/setStatus/remove),
`challenge.ts` (HMAC sign/verify + challenge insert/consume), `validation.ts`
(lifted engine), `_shared/security.ts` (honeypot + min-fill + Sec-Fetch gate).
