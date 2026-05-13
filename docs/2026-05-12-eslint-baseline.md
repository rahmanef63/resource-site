# ESLint Baseline — resources/ (2026-05-12)

## Setup

ESLint v9 flat config (`eslint.config.mjs`) wiring:
- `@next/eslint-plugin-next` (core-web-vitals)
- `typescript-eslint` (TS parser + recommended)
- `eslint-plugin-react-hooks`

Bypasses broken `eslint-config-next` v16 FlatCompat path.

## Lint script

`eslint . --max-warnings 9999` — passes with tech-debt warnings.

## Baseline counts

| Check | Errors | Warnings |
|-------|--------|----------|
| Lint  | 0      | 43       |
| Typecheck | 0  | 0        |
| Build | ✓ pass | —       |

## Kitab-specific rules

- **Clerk forbidden** (paths `@clerk/*` → error in non-slice files)
- Slice barrel imports only (`@/slices/*/*` deep imports → warn)
- `src/` folder forbidden
- `convex/` server-only: no React, no Next imports

## Ignored paths

`template-base/`, `convex-templates/`, `cookbook/`, `recipes/`, `packages/*/dist/`, `plugins/` — these are distribution targets, not lint targets.

## Follow-up

- Tighten Clerk forbidden rule to `error` after kitab matures (currently `warn`)
- Add slice-isolation enforcement for `frontend/slices/<name>/`
- Wire into `slices:check` script as `&& npm run lint`
