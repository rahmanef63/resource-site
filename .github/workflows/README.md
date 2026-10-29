# CI workflows

Blocking gates and how to reproduce them without spending Actions minutes.

| workflow | trigger | blocks merge? | run locally |
|---|---|---|---|
| `ci.yml` → `gate` | `pull_request` (main, `paths-ignore: docs/**, **.md`), `push` (main, unfiltered), `workflow_dispatch` | **Yes** — typecheck + lint + test + slices:check + build | `npm run ci:local` (or the five steps individually: `npm run typecheck`, `npm run lint`, `npm test`, `npm run slices:check`, `npm run build`) |
| `ci.yml` → `template-base-typecheck` | same as `gate` | **Yes** — `template-base` must typecheck | `cd template-base && npm ci --legacy-peer-deps && npx tsc --noEmit` |
| `ci.yml` → `cli-prepublish` | same as `gate` | **Yes** — CLI skills/manifest/slices must be in sync | `cd packages/cli && node scripts/sync-skills.mjs --check && node scripts/validate.mjs` then `node packages/cli/scripts/validate-slice.mjs --check` |
| `ci.yml` → `audit` | same as `gate` | **Yes** — no high-severity prod vulns | `npm audit --audit-level=high --omit=dev` |
| `validate-manifests.yml` | `pull_request` + `push` (main) on `frontend/slices/**`, `template-base/**`, `packages/cli/**`, `lib/content/**`, `scripts/validation/**`, the workflow itself; `workflow_dispatch` | **Yes** — slice manifests must match schema v1 | `npm run validate:manifests` |
| `audit-bp.yml` → `kpi-scan (advisory)` | `pull_request` + `push` (main), `workflow_dispatch` | **No** — `continue-on-error: true`. Grep-level approximation; the real audit-bp skill is private and not reproducible in CI | run the private `audit-bp` skill locally |

## Notes

- `push` to `main` in `ci.yml` is deliberately **unfiltered**. PR runs skip docs-only
  changes for speed; `main` always gets a full gate so the deploy branch is never verified
  by a filtered run.
- `paths-ignore` on `pull_request` means a docs-only PR never reports a `gate` status.
  If `gate` is configured as a *required* check in branch protection, that PR stays
  "pending" forever — either remove `paths-ignore` or exclude `gate` from required checks.
- The `audit-bp` workflow does not gate anything and enforces no score threshold. Do not
  cite it as "score ≥ 80 to ship".
- `npm run ci:local` (`scripts/ci-local.mjs`) runs `typecheck → lint → test → slices:check → build`
  in order and stops at the first failure.
