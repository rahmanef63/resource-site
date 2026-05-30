# Slice Reusability — shadcn-Parity Plan

> Goal: make `frontend/slices/*` feature components as dynamic + reusable as
> shadcn `components/ui/*` primitives — **at the right altitude** (a slice is a
> copy-first feature, not a library primitive).

Audit date: **2026-05-30**. Scope: 55 slice dirs, 51 typed contracts.
(`forms/` + `library/` excluded — concurrent-agent WIP, untracked.)

---

## 1. Current state (measured, not guessed)

| Trait shadcn primitives have | Slices today | Verdict |
|---|---|---|
| `cn(defaults, className)` merge | **69 files** import `@/lib/utils`; 0 left on `rahman-shared/lib/utils`; 11 raw-interp spots wrapped | ✅ **DONE (P0)** |
| Single cn source | normalized to `@/lib/utils` (shadcn convention) | ✅ DONE |
| `cva` variant API | **0 slices** — variants hand-rolled `cond ? "a" : "b"` | ❌ gap |
| `forwardRef` ref passthrough | **0 slices** | ❌ gap |
| `...props` spread to root el | **1 slice** | ❌ gap |
| `data-slot` styling hooks | 0 | ⚠ minor |
| copy externalized (i18n-ready) | partial — `activity` does `copy:` prop; 4 files still hardcode Indonesian | ⚠ leak |
| theme tokens not raw colors | mostly ✅ — the 4 "violations" are legit: Google-logo brand SVG, Notion named-color palette, GitHub code-theme `#0d1117` | ✅ ok |
| no raw `<button>/<input>/<a>/<img>` | ✅ — only 2 documented `<button>` exceptions (`role="checkbox"`, comment) | ✅ clean |
| typed slice boundary | 51/55 have `slice.contract.ts` | ⚠ 3 missing |

**Read:** the forbidden-primitive hard rules are already respected. The real
distance to shadcn parity is **3 levers: cva, forwardRef, props-spread** — plus
a copy-externalization leak.

---

## 2. The 4 levers (ranked by reuse-impact)

### Lever 1 — className merge — **DONE**
`cn()` everywhere a component takes an external `className` or branches classes.
Why it matters: without `twMerge`, a consumer override (`h-9` over `h-7`) leaves
BOTH classes; CSS source-order decides → silent breakage. Fixed in P0.

### Lever 2 — variant API via `cva` *(biggest remaining gap)*
Hand-rolled `isOutline ? "…" : "…"` → `cva` gives a typed `variant`/`size` prop,
consumer-extendable, conflict-safe. This is *the* shadcn move.
Targets (components already branching on a mode):
`hero` HeroCta · `full-width-toggle` segment · `create-your-mcp` status badge ·
`activity` category badge · `notion-database` `option-shared` color chips.

### Lever 3 — `forwardRef` + `...props` passthrough
shadcn forwards ref + spreads props on **every** primitive so consumers attach
`ref` / `aria-*` / `data-*` / extra handlers without forking. Slices do this
nowhere.
Targets (leaf interactive): `InsertBlockButton`, `PageActionsMenu`,
`FileUploadButton`, `FullWidthToggle`, `UpvotePanel`.

### Lever 4 — copy externalization — **DONE (generic chrome)**
Hardcoded strings → prop-driven `copy` object with English defaults (the pattern
`activity` already ships: `copy: ActivityCopy`). Removes i18n lock-in.
Done: `full-width-toggle` (label+title `copy`) · `doku-payment/checkout-page`
(`copy` heading/sub/titles) · `ai-router/chat-fab` (greeting/title/placeholder
props + EN stub + raw `<input>`→shadcn Input).

**Scoping rule discovered:** externalize only *generic chrome* (tooltips,
placeholders, headings). Do NOT externalize **localized-content verticals** whose
domain copy IS the product — `document-checklist` is fully Indonesia-job-prep
themed (tabs, SKCK paragraphs, `indonesianData.ts`); a consumer installs it FOR
that content and forks to re-localize (copy-first). Treat like a content template,
not a reusable component.

---

## 3. Altitude decision (the important call)

shadcn primitive = **library**, push reuse to the max.
A slice = **copy-first feature, consumer OWNS the file** and edits internals.
→ Pushing forwardRef + cva into deep subsystem internals is wasted effort:
the consumer forks those internals anyway.

**Tier the slices:**

- **Leaf UI slices** (`hero`, `full-width-toggle`, `icon-picker`, `code-block`,
  badge/button-like) → **full shadcn parity**: cva + forwardRef + `...props` + cn.
  These are used as-is, like primitives.
- **Feature-subsystem slices** (`notion-database`, `notion-shell`,
  `doku-payment`) → **boundary reuse only**: typed `slice.contract.ts` + `copy`
  props + cn. No internal forwardRef — consumer rewires internals.

---

## 4. Phased rollout (each phase independently shippable)

| Phase | Work | Risk | Surface |
|---|---|---|---|
| **P0** ✅ | cn normalize + merge (11 spots, 26 imports) | none | shipped |
| **P1** ✅ | copy externalization — 3 generic-chrome comps → `copy`/EN default (+ chat-fab raw `<input>`→shadcn Input) | low | shipped |
| **P2** 🟡 | `cva` variant API — **code shipped** on the 3 real variant-axis leaves: `hero` `heroCtaVariants` (solid/outline), `create-your-mcp` `tokenStatusVariants` (active/inactive), `full-width-toggle` `segmentItemVariants` (active bool); all exported. **Skipped (documented):** `activity` badge (static, no axis), `notion-database` `option-shared` chip (10-color array IS the SSOT variant map — cva would duplicate it). | med | code via degit; ver bump + manifest **deferred** |
| **P3** 🟡 | `...props` passthrough (React 19 = ref-as-prop, no `forwardRef` needed) — **code shipped** on leaf comps `files/FileUploadButton` + `full-width-toggle/FullWidthToggle` (button branches). **Skipped (altitude §3):** `notion-shell` `InsertBlockButton`/`PageActionsMenu` are subsystem internals (consumer rewires) — passthrough there = the wasted effort §3 warns against. `library/UpvotePanel` = concurrent WIP, untouchable. | med | code via degit; ver bump + manifest **deferred** |
| **P4** ✅ | add `slice.contract.ts` to `event-tracking`, `files`, `rbac-roles` (files=adapter UI contract; 2 nav-only stubs get coverage contracts) | low | shipped |
| **P5** ✅ | scaffold template now ships the full trio (`slice.json` + `slice.contract.ts` + `slice.manifest.json`) + cn/`...props` parity in `example-button`; `audit:slices` gains 2 advisory lint rules (raw-interp className → require cn; hardcoded hex in className → token, escape via `audit-allow-hex`) | low | shipped |

**P2/P3 caveat — code ships free, version-bump is deferred:** slice component
files reach consumers via `tiged`/degit from GitHub main (the CLI npm tarball is
`bin`+`lib`+`README` only — no slice sources), so the cva/`...props` edits are
live the moment they land on main. The **version bump is a separate publish-time
step**, deferred because: (a) `validate-slice-parity` requires `version` to be
EQUAL in `slice.json` AND the TS catalog `lib/content/slices.ts`, and (b) that
catalog is currently concurrent-agent WIP (+`library` block, uncommitted). Doing
half the bump now would either fail parity or entangle their WIP. **Publish
checklist (after `library`+`seo` are committed):** bump `version` in each
touched `slice.json` + the matching catalog entry → `npm version patch` in
`packages/cli` (1.9.0 is already on npm) → regen `manifest.json` (runs in
`prepublishOnly`) → `cd packages/cli && npm publish` (web-auth/2FA — you run it;
MCP republishes from `packages/mcp`). P1/P4/P5 ship to main with no npm publish.

**P4 reality (correction):** `files` / `event-tracking` / `rbac-roles` have no
`slice.json`, so `discoverSlices` skips them — `audit:slices` never sees their
contracts. The contracts I added are documentation-grade (boundary intent +
CLI metadata), not audit-enforced. Audit coverage on *discovered* slices was
already 100% (the trio check would have errored otherwise). The durable fix is
P5: the template now ships the trio, so every *scaffolded* slice is born
audit-clean instead of erroring on first run.

---

## 5. What is explicitly NOT a problem (don't waste cycles)

- Raw `<button>` ×2 — documented exceptions (`role="checkbox"`, doc comment).
- Non-token colors — Google brand SVG, Notion palette, GitHub code theme. Correct.
- `document-checklist` — intentionally-localized content vertical (Indonesia job-prep); domain copy is the product, not a leak. Consumer forks to re-localize.
- Deep subsystem internals — consumer-owned, forwardRef there = noise.

---

## 6. Next concrete step

P1 (copy externalization) — lowest risk, fixes a real i18n leak, no publish.
Then P2 cva on leaf components for the headline "dynamic like shadcn" win.
