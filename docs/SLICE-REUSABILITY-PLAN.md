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

### Lever 4 — copy externalization
Hardcoded strings → prop-driven `copy` object with English defaults (the pattern
`activity` already ships: `copy: ActivityCopy`). Removes i18n lock-in.
Targets: `full-width-toggle` `TITLE` (Indonesian) · `doku-payment/checkout-page` ·
`ai-router/chat-fab` · `document-checklist`. (`document-checklist/data/indonesianData.ts`
is intentional sample data — leave.)

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
| **P1** | copy externalization — 4 files → `copy` prop + EN default | low | minor ver bump |
| **P2** | `cva` variant API on ~6 leaf badge/button comps; define shared `sliceVariants` recipe | med | per-slice ver bump + manifest |
| **P3** | `forwardRef` + `...props` on ~5 leaf interactive comps | med | per-slice ver bump + manifest |
| **P4** | add `slice.contract.ts` to `event-tracking`, `files`, `rbac-roles` | low | none |
| **P5** | codify in `scaffold-slice` template + `audit:slices` gate: lint raw-interp className (require cn), flag hardcoded non-brand color | low | tooling |

**P2/P3 caveat:** they touch published-slice public surface → bump each slice's
`version` in `slice.json` + TS catalog, regen `manifest.json`, republish (OTP).
P1/P4/P5 ship to main with no npm publish.

---

## 5. What is explicitly NOT a problem (don't waste cycles)

- Raw `<button>` ×2 — documented exceptions (`role="checkbox"`, doc comment).
- Non-token colors — Google brand SVG, Notion palette, GitHub code theme. Correct.
- `document-checklist/data/indonesianData.ts` — intentional demo data.
- Deep subsystem internals — consumer-owned, forwardRef there = noise.

---

## 6. Next concrete step

P1 (copy externalization) — lowest risk, fixes a real i18n leak, no publish.
Then P2 cva on leaf components for the headline "dynamic like shadcn" win.
