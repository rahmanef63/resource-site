# seo

**SEO — AI Metadata Generator**

Service slice for SEO metadata generation — Anthropic-backed action with per-user 24h cost guard + portable persona prop. No public route. Backend exposes generate + generateAndApply mutations gated by requireAdmin; consumers inject brand voice via the personaContext arg (or buildSeoSystemPrompt factory).

## Install

```bash
npx rr add seo
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/seo/`](../../../convex/features/seo/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
