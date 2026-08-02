# Audit-BP Wire

Best-practice gate. Pulls latest Next/React/Convex docs via Context7 MCP before scoring.

## npm scripts (in package.json)

```bash
pnpm audit:bp                # KPI — changed scope
pnpm audit:bp:full           # whole repo
pnpm audit:features          # per-slice layout consistency
pnpm audit:features:md       # full markdown report
```

Wraps `~/.agents/skills/audit-bp/scripts/{audit-bp,audit-features}.sh`.

## CI gate

```yaml
- run: pnpm audit:bp -- --json | tee audit-bp.json
- run: |
    score=$(jq '.score' audit-bp.json)
    if [ "$score" -lt 80 ]; then echo "audit-bp <80"; exit 1; fi
```

Score ≥85 APPROVE · 70–84 APPROVE-WITH-FOLLOWUPS · <70 REJECT.

## P0 blockers

| Check | Where |
|---|---|
| Server Actions w/ authn+authz | every `"use server"` fn |
| Convex public fn `args: { v.* }` validators | every `query/mutation/action` |
| Workspace isolation `withIndex('by_workspace', ...)` | every workspace-scoped query |
| `requirePermission` before any DB write | every mutation |
| Audit log every state change | `logAuditEvent` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` pinned multi-instance | env / Dokploy |
| `POSTGRES_URL` on prod self-hosted Convex | `docker-compose.yml` |
| TLS at proxy, no raw port exposure | Dokploy / Traefik |
| `convex/_generated` committed | git |

## P1 high

- `proxy.ts` not `middleware.ts` on Next 16
- `cacheComponents: true` in `next.config.mjs`
- `instrumentation.ts` w/ `onRequestError`
- `next/image` (no raw `<img>`), `next/link` (no raw `<a>` for internal)
- DAL + DTO + `import 'server-only'`

## P2 low

- Missing `AGENTS.md`
- Missing slice `docs/` (auto-fix: `pnpm generate:slice-docs`)
- Doc drift

## Slice-level KPI (audit-features.sh)

Per slice:
- **P0 (-10 ea)**: missing `config.ts`+`defineFeature()`, `init.ts`, `page.tsx`; if `hasConvex` then schema+queries+mutations; status honesty
- **P1 (-5 ea)**: missing `agent/index.ts` (singular!), `settings/index.ts`, `features-preview/index.tsx`, `views/`, `<FeatureShell>`, no raw `<Dialog>` (→ `ResponsiveDialog`), no `<input type=date>` (→ `DateField`)
- **P2 (-2 ea)**: `<input type=file>` (→ `<FileUpload>`), raw `<a href="/...">` (→ `next/link`/`SmartLink`), raw `<img>` (→ `next/image`)

Floor 0. Grade A≥90 · B≥80 · C≥70 · D≥60 · F<60.

## Trigger

Use `/use-audit-bp` slash command before any deploy or after major slice changes. Skill enforces Phase 0 (Context7 fetch) before scoring.
