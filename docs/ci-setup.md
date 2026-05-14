# CI Setup — kitab quality gates

Track J of Wave N+1. This document describes the GitHub Actions workflows
wired into the kitab and how to enforce them as required status checks.

## Workflows

| File | Trigger | Purpose | Required? |
|---|---|---|---|
| `.github/workflows/ci.yml` | push to `main`, PR → `main` | Authoritative gate: typecheck + lint + test + slices:check + build (+ template-base typecheck, CLI prepublish, vuln audit) | Yes |
| `.github/workflows/audit-bp.yml` | every PR | Mechanical KPI scan, fails on `total > 0`. Posts a PR comment with breakdown. | Yes |
| `.github/workflows/contracts-drift.yml` | push to `main` (post-merge) | Detects manifest/contract id drift; surfaces a backfill inventory for slices that have `slice.manifest.json` but no `slice.contract.ts`. | Yes (post-merge) |
| `.github/workflows/validate-manifests.yml` | push/PR → `main` | Schema validation for `slice.manifest.json`. (Pre-existing.) | Yes |

### `ci.yml` — gate job step-by-step

1. `actions/checkout@v4` with `fetch-depth: 0` (audit-bp needs HEAD~15)
2. `actions/setup-node@v4` with `node-version: '22'`, npm cache
3. `actions/cache@v4` for `.next/cache`, keyed by `package-lock.json` + source hashes
4. `npm ci --legacy-peer-deps --no-audit --no-fund`
5. `npm run typecheck`
6. `npm run lint`
7. `npm run test` (vitest — 49 tests baseline)
8. `npm run slices:check` (chain: validate:slices → audit:slices → gen:slices:check → validate:manifests → validate:contracts)
9. `npm run build`

### `audit-bp.yml` — KPI scan

The script lives at `~/.agents/skills/audit-bp/scripts/audit-bp.sh` on
developer machines. **The skill is not published as a public GitHub repo**,
so the workflow:

1. Attempts `git clone https://github.com/rahmanef/skill-audit-bp.git` (placeholder URL — kept for forward compat).
2. On failure, falls back to an INLINE simplified KPI scan that replicates the
   five P0 metrics:
   - `raw_anchor_count`
   - `raw_img_count`
   - `unbounded_collect_count`
   - `convex_public_no_validator_count`
   - `server_action_no_auth_count`

The fallback is conservative — it may under-count vs the full script but
will never produce a false positive that blocks a valid PR.

Either path emits `audit-bp.json`; the workflow:
- Posts a PR comment with the metric table via `actions/github-script@v7`.
- Fails the workflow when `total > 0`.

### `contracts-drift.yml` — post-merge guard

After every merge to `main`:

1. Runs `node scripts/validation/check-contract-drift.mjs --json`.
2. Writes the inventory + drift list to the workflow Summary tab.
3. Fails on `id-mismatch`, `orphan-contract`, or `contract-id-unparsable`.
4. Does NOT fail on `missing-contract` (manifest present, no contract) —
   that's information-only so we can track backfill progress.

The same script is exposed as `npm run contracts:drift` for local use; pass
`--json` for machine-readable output.

## Marking workflows as required status checks

GitHub branch protection has to be configured manually via the UI:

1. Go to **Settings → Branches → Add branch protection rule** (or edit the
   existing rule for `main`).
2. Under **Branch name pattern**, enter `main`.
3. Tick **Require status checks to pass before merging**.
4. Tick **Require branches to be up to date before merging**.
5. In the **Search for status checks…** input, add each of:
   - `gate (typecheck + lint + test + slices + build)`
   - `typecheck (template-base copy-source)`
   - `CLI prepublish gate`
   - `high-severity vuln gate`
   - `audit-bp KPI scan`
   - `schema validate` (from `validate-manifests.yml`)
6. (Optional) Tick **Require linear history** and **Include administrators**.
7. Save.

`contracts-drift` runs on `push` (post-merge), so it cannot be a required
PR check — it is a tripwire that creates noise in the Actions tab if drift
lands. Treat any red run as an immediate-fix issue.

## Expected runtimes

Local timings (cached `node_modules`, warm tsc incremental):

| Step | Local | CI cold | CI warm |
|---|---|---|---|
| `npm ci` | n/a | ~90s | ~30s (cache hit) |
| `npm run typecheck` | ~7s | ~25s | ~10s |
| `npm run lint` | ~15s | ~35s | ~20s |
| `npm run test` | ~1s | ~12s | ~8s |
| `npm run slices:check` | ~6s | ~20s | ~15s |
| `npm run build` | ~40s | ~90s | ~50s (with `.next/cache`) |
| **gate total** | ~70s | **~4 min** | **~2 min** |
| `audit-bp` | ~3s | ~90s | ~40s |
| `contracts-drift` | <1s | ~60s | ~30s |

CI budgets per workflow are set conservatively (`timeout-minutes`):
- `ci.yml::gate` — 20 min
- `audit-bp.yml` — 8 min
- `contracts-drift.yml` — 5 min

## Troubleshooting

### audit-bp workflow fails with "skill not reachable"

Expected when the audit-bp skill repo doesn't exist — the workflow falls
back to the inline scan automatically. If the inline scan still flags
findings, look at the workflow logs for the per-metric breakdown and fix
the source files. To reproduce locally:

```bash
bash ~/.agents/skills/audit-bp/scripts/audit-bp.sh --changed
```

### contracts-drift fails with `id-mismatch`

The slice's `slice.manifest.json` `name` field disagrees with the slice's
`slice.contract.ts` `id` field. Reproduce locally:

```bash
npm run contracts:drift
```

Fix the slice that drifted — both files should use the same kebab-case slug
as the directory name.

### contracts-drift reports a long `missing-contract` inventory

Informational only — those slices have a manifest but no Phase A contract
yet. Backfill is tracked separately. The workflow does NOT fail on these.

### `gate` job fails at `slices:check`

Run the chain locally to localize the failure:

```bash
npm run validate:slices
npm run audit:slices
npm run gen:slices:check
npm run validate:manifests
npm run validate:contracts
```

Whichever sub-command fails is the one to fix.

## Local-first hook

A pre-commit hook in `.githooks/pre-commit` runs the two cheapest gates
(`typecheck` + `validate:contracts:check`) before allowing a commit. It's
activated by the `prepare` script in `package.json`:

```jsonc
"prepare": "git config core.hooksPath .githooks 2>/dev/null || true"
```

`npm install` runs `prepare` automatically. Bypass with `git commit --no-verify`.
