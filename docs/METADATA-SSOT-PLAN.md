# Metadata SSOT Refactor — Plan (SSOT for the loop)

> Goal: `slice.json` = **single hand-authored per-slice SSOT**. Everything
> downstream (catalog scalars, manifest, agent.md) **generated** → drift class
> dies structurally. Fold `slice.contract.ts` data into `slice.json` (it's data
> in a `.ts` costume). Net: 9→7 files/slice, ~145 files + 5 validators removed.
>
> Source: slice-metadata-audit workflow (wf_5235084a-a99), adversarial verify
> confidence 0.82. Scope chosen: **Phase 1 + 2** (defer config.ts strip +
> catalog-prose-into-slice.json — verify flagged both as redesign-needed).

## Hard constraints (verify caught these — DO NOT violate)

1. **`npx rr add` copies the WHOLE slice tree (tiged).** `slice.json` ALREADY
   ships to consumers. → Generate ONLY scalars into `slices.ts`; keep catalog
   **prose** (tagline/exampleCode/agentRecipe/wiring) OUT of `slice.json`. Prose
   stays hand-authored in `lib/content/slices.ts`; only scalars regenerate.
2. **Deleting `validate-slice-parity.mjs`** requires editing, in the SAME commit:
   `packages/cli/package.json` (`prepublishOnly`, `validate:all`, `validate:parity`)
   + root `package.json` (`validate:parity`). Grep the script name across ALL
   package.json before deleting.
3. **`migrationFrom`** (6 slices: comments, doku-payment, midtrans-payment,
   audit-log, admin, seo) MUST be folded into slice.json + migrate read-path
   repointed, else `rr migrate` silently stops detecting renames.
4. **Cross-field invariants** can't live in the hand-rolled no-ajv schema
   validator → keep as explicit custom JS in `validate-slice.mjs`:
   (a) `requires.convex.tables[i]` + `provides.tables[i]` startsWith
   `requires.convex.prefix`; (b) conflict-ref slug references an existing slug.
5. **`check-forbidden-terms.mjs`**: after moving `generalization.forbiddenTerms`
   into slice.json, add slice.json to its SKIP list (else the denylist text trips
   the scanner).
6. **`conflicts[]` is empty in all 70 slices** (dead data) — fold trivially.
7. Test `rr migrate --from <historic>` explicitly after deletion: git-show finds
   OLD `slice.contract.ts` in history (fine), but current-version read must
   switch to `slice.json`. Verify BOTH legs.

## Phases

### Phase 1 — agent.md off-git + catalog scalar-gen + kill 2 validators
- [x] 1a. `git rm` 70 `agent.md` + the generator (`gen-slice-agent-md.mjs` +
  `agent-md-tools.mjs`); removed `gen:agent-md`/`:check` from package.json +
  pre-commit + `slices:check`; surgically dropped `agent.md` from the 16
  manifests that listed it (JSON round-trip, byte-clean); added `agent.md` skip
  to `sync-slice-manifests`. Nothing reads agent.md at build/runtime (MCP reads
  manifest.json). Broader manifest files[] drift left untouched (out of scope —
  sync-manifest also has a preview.tsx-listing gap; separate task). ✅
- [x] 1b. `scripts/features/gen-slice-catalog.mjs`: resolve each catalog entry's
  slice.json via its **slicePath** (mirrors parity — NOT slug; event-tracking
  points at template-base) → regenerate single-line scalars in place (version,
  category, title, kind). Prose untouched. Zero-diff on synced state; --check
  catches drift. tags/deps deferred (not parity-gated). ✅
- [x] 1c. Deleted `validate-slice-parity.mjs` + `report-slices-drift.mjs`; rewired
  CLI `validate:parity`/`validate:all`/`prepublishOnly` → `../../scripts/features/gen-slice-catalog.mjs --check`,
  removed report-slices-drift from `validate-all.mjs`, wired `gen:catalog:check`
  into pre-commit + `slices:check`. ✅
- [ ] 1d. Gate: typecheck + audit:slices + validate:manifests + e2e smoke. Ship.

### Phase 2 — fold contract → slice.json (HYBRID, decided 2026-06-21)

Analysis (`scripts/migrate/analyze-contract-overlap.mjs`) found the contracts
are internally inconsistent: `requires.deps` is typed `string[]` but holds
**objects + npm names** (not just slice slugs) in ~40 slices, and `provides`
carries undeclared `utils`/`convex` sub-fields. A clean mechanical reconcile of
`requires.deps` is unsafe → **HYBRID**: fold VERBATIM except `id`/`version`
(the only 100% dup with slice.json scalars; dropping them collapses trio→pair).
`requires.deps`/`env` stay verbatim with a normalization TODO.

- [x] 2a. `slice-schema.json` gains a **loose** `contract` object (shape is
  messy; strict invariants move to validate-slice at 2d when the .ts is retired). ✅
- [x] 2b. `scripts/migrate/fold-contracts.mjs` (tsx import; stub fallback for the
  validator-violating contracts like platform-admin) — surgical text-append of a
  `contract` block to each slice.json (no reformat). Applied 70/70, **lossless
  verified 70 match / 0 mismatch**. contract.ts RETAINED (additive, reversible). ✅
- [ ] 2c. Repoint read-paths contract→slice.json.contract: `snapshot.mjs`
  (loadContract → read slice.json.contract + reattach id/version),
  `migrate*.mjs`, `migration-plan.mjs`, `compose-solver*`, `validate-contract.mjs`,
  `check-contract-drift.mjs`, `check-forbidden-terms.mjs` (+skip slice.json),
  `audit-slice.mjs` (contractToolNames + version-trio→pair).
- [ ] 2d. `validate-slice.mjs` (or validate-contract): validate the folded block
  + custom JS for the 2 cross-field invariants (constraint #4); tolerate the
  known platform-admin 2-dot rbac (regex-fallback today).
- [ ] 2e. Delete 70 `slice.contract.ts` + `validate-contract.mjs` +
  `validate-contract-shape.mjs` + `check-contract-drift.mjs`. audit-slice:
  drop contract presence; version-pair (json==manifest).
- [ ] 2f. `sync-slice-manifests.mjs`: also exclude slice.contract.ts is moot once
  deleted; regenerate manifest from slice.json where applicable.
- [ ] 2g. Gate: typecheck + audit:slices + validate:manifests + `rr migrate`
  historic-version test (constraint #7) + e2e. Ship. Re-publish CLI (user OTP).

## Progress log
- 2026-06-21: plan created from audit workflow + verify. Scope = Phase 1+2. Execution starting.
