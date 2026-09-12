# seo

**SEO — AI Metadata Generator**

Service slice for SEO metadata generation — Anthropic-backed action with per-user 24h cost guard + portable persona prop. No public route. Backend exposes generate + generateAndApply mutations gated by requireAdmin; consumers inject brand voice via the personaContext arg (or buildSeoSystemPrompt factory).

## Install

```bash
# React/Next default
npx rr add seo

# Svelte/SvelteKit explicit contract
npx rr add seo --framework sveltekit
```

## Framework distribution

The SEO slice is a service contract, not a UI surface. Its exported persona factory and typed tool bindings are pure TypeScript, while generation/persistence live in Convex. Because there is no React component to translate, the explicit Svelte/SvelteKit distribution intentionally reuses the same canonical source path instead of duplicating files or inventing a Svelte screen.

- React/Next remains the deterministic default.
- `--framework sveltekit` (or `svelte`) selects the same framework-neutral service source.
- No `svelte`, React, Lucide, or shadcn runtime dependency is added by the Svelte descriptor.
- Existing Convex env and `convex-auth` peer requirements still apply.

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
