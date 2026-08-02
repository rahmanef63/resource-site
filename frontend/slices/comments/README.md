# comments

**Comments — Threaded**

Polymorphic-target threaded comments. Consumer picks `TargetRef = { kind, id, subId? }` (e.g. page+block, blog+slug, task+id). Renderless <CommentsThread> + <CommentsAnchor> wrappers; useComments(bindings, opts) hook returns items + openCount + CRUD + forbiddenWords guard. Adapter pattern — see contract-negotiations-2026-05-15 §1.

## Install

```bash
npx rr add comments
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/comments/`](../../../convex/features/comments/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
