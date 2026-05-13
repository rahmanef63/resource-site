# Versioning Policy — rahman/resources kitab

This document defines semver semantics for slices and shared primitives in this kitab.

## Two version tracks

| Track | Where versioned | Cadence |
|---|---|---|
| **Slice manifest** | `frontend/slices/<slug>/slice.manifest.json` `version` | Per-slice changes |
| **`@rahman/shared` package** | `packages/shared/package.json` `version` | Per shared primitive change |

Slices and the shared package version independently. A consumer can pin
`@rahman/shared@0.3.2` while pulling slices `auth@0.1.0` + `comments@0.2.0`.

## Semver semantics

Slices and the shared package both follow [semver 2.0.0](https://semver.org/),
specialized for kitab consumption patterns:

### MAJOR (X.0.0)

Bump when **any** of these change in a way that breaks downstream consumers:

- Slice public API surface (exported component prop type, hook signature)
- Convex schema field shape (rename / type change / index change)
- Required env var added (consumer must set new value to run)
- Permission name renamed in manifest `permissions` array
- Drop or rename of `convexFeatures[]` entry

### MINOR (0.X.0)

Bump when these are added without breaking existing consumers:

- New optional component prop with safe default
- New exported component / hook / util
- New optional env var (with default in code)
- New optional permission
- New `schemaTables[]` entry (additive)

### PATCH (0.0.X)

Bump for purely-internal changes invisible to consumers:

- Bug fixes that don't change public types
- Internal refactors
- Documentation, comments, JSDoc
- Test additions
- Dependency bumps where downstream surface unchanged

## Slice bump checklist

Before bumping a slice manifest `version`:

1. **Diff slice public API** — `git diff HEAD~ -- frontend/slices/<slug>/index.ts`
2. **Diff Convex schema** — `git diff HEAD~ -- convex/features/<slug>/schema.ts`
3. **Diff manifest** — `git diff HEAD~ -- frontend/slices/<slug>/slice.manifest.json`
4. **Pick bump level** per rules above.
5. **Update manifest** — single edit to `version` field.
6. **Tag commit** — `git tag slice/<slug>/v<version>` (optional but recommended).

## `@rahman/shared` bump checklist

Before bumping `packages/shared/package.json` `version`:

1. **Diff exports** — `git diff HEAD~ -- packages/shared/src/index.ts`
2. **Diff primitive surfaces** — `git diff HEAD~ -- shared/`
3. **Pick bump level**.
4. **Update `packages/shared/package.json`** + run `npm run publish:dry` to sanity-check tarball.
5. **Publish** — `npm publish` (requires `GITHUB_TOKEN` with `write:packages` scope).

## Pre-1.0 (current state)

While the kitab is `0.x.y`, breaking changes ship in MINOR bumps per semver
convention. Once we ship `1.0.0`, the rules above apply strictly.

A slice or shared module reaches `1.0.0` when:

- At least one external consumer integrates it in production
- It has been stable across at least 2 minor releases without breaking change

## Deprecation

When a slice or export is deprecated:

1. Mark with `/** @deprecated <reason + replacement> */` JSDoc on the export.
2. Keep deprecated symbol for ≥ 2 MINOR releases before removal.
3. In `manifest.notes`, document migration path.
4. Bump MAJOR when removed.

## Renovate / Dependabot

Automated dependency PRs target `@rahman/shared` consumers. See
[`.github/renovate.json`](../.github/renovate.json) for the grouping policy
(major bumps batched per-week, minor/patch auto-merged after CI green).

## Related

- [SSOT_MIGRATION_PLAN.md](./SSOT_MIGRATION_PLAN.md) — phase-by-phase rollout
- [slice.manifest.schema.json](./slice.manifest.schema.json) — v1 schema
