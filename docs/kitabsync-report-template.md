# KitabSync Report Template

> **Canonical schema for `docs/kitabsync.md` in every consumer repo.**
> Wave N+3 — added 2026-05-15. Spec lives in [`docs/consumer-manifest.md`](./consumer-manifest.md).

## Convention

Every consumer of the rahman-resources kitab (CareerPack, notion-page-clone,
rahmanef.com, content-rahmanef-com, superspace, cescadesigns) writes a
report at:

```
<consumer-repo>/docs/kitabsync.md
```

The file is **append-only at the run-history table** and **overwrite at the
snapshot sections**. The kitab scraper relies on the exact section headers
below — do not rename them or add untracked sections.

## Why one shared schema

The kitab can `git clone --depth 1` each consumer (or read sibling repos on
the operator workstation), grep `docs/kitabsync.md`, and aggregate without
running anything. No CLI ping, no MCP call, no auth — just markdown. Same
trick works for any Claude session that wants to compare consumer state
across the mesh.

## Template (copy-paste, fill placeholders)

```markdown
# KitabSync Report — <project-name>

> Generated: <ISO timestamp>
> Run: <"initial bootstrap" | "audit refresh" | "post-edit bump" | "DOWN-sync apply" | "UP-sync prep">
> Kitab snapshot ref: <kitab git SHA at the time of the run, or "N/A" if offline>

## Snapshot

| Metric | Value |
|---|---|
| Slices adopted (have `.kitab.json`) | N |
| Bootstrapped this run | N |
| Already had `.kitab.json` | N |
| Skipped (no kitab match) | N |

### Verdict breakdown

| Verdict | Count | Slices |
|---|---|---|
| in-sync | N | slug, slug |
| up-needed | N | slug |
| down-needed | N | slug |
| diverged | N | slug |
| consumer-only | N | slug |
| kitab-only | N | slug |

### Generalization breakdown

| Status | Count | Slices |
|---|---|---|
| portable | N | slug, slug |
| needs-adapter | N | slug |
| consumer-locked | N | slug |

## Slices detail

### `<slug>` — `<verdict>` · `<generalization-status>`

- kitabVersion: `0.1.0`
- consumerVersion: `0.1.3`
- syncDirection: `bidirectional`
- lastPullAt: `2026-05-13T10:15:00Z` | `null`
- lastPushAt: `null`
- Local path: `frontend/slices/<slug>/`
- Blockers (only if needs-adapter / consumer-locked):
  - `frontend/slices/<slug>/views/X.tsx:42` — hardcoded `/dashboard/applications` route, parameterise as `basePath` prop
  - `convex/features/<slug>/schema.ts:8` — table `applications` should be generic `<slug>_records` with consumer adapter
- Suggested action: `/rr-prep <slug> --fix` → `/rr-send <slug>`

### `<next-slug>` — …

## Aggregate suggested actions (priority order)

1. `<slug>` — diverged + needs-adapter (P0): refactor blockers, then pull DOWN, then re-push UP
2. `<slug>` — up-needed + portable (P1): `/rr-send` is unblocked
3. `<slug>` — down-needed (P2): `npx rahman-resources update <slug> --apply`
4. `<slug>` — kitab-only (P3): `npx rahman-resources add <slug>` if you actually want it
5. `<slug>` — consumer-only + portable (P4): write a contract upstream + `/rr-send` to seed kitab

## Run history (append-only)

| Date (UTC)              | Action            | Slices touched | Commit  | Author       |
|-------------------------|-------------------|---------------:|---------|--------------|
| 2026-05-15T04:30:00Z    | initial bootstrap |              8 | abc1234 | claude-code  |
```

## Required headers (kitab scraper anchors)

The aggregator parses by exact heading text. If you rename, scraping
silently drops the section. Keep these strings verbatim:

- `# KitabSync Report — `
- `## Snapshot`
- `### Verdict breakdown`
- `### Generalization breakdown`
- `## Slices detail`
- `### \`<slug>\` — `   *(slug + em-dash + verdict; case-sensitive)*
- `## Aggregate suggested actions (priority order)`
- `## Run history (append-only)`

## Update protocol

| Trigger | What to update |
|---|---|
| First-time bootstrap | Write the whole file. Append the first run-history row. |
| New slice adopted | Add detail block. Update Snapshot + Verdict + Generalization tables. Append run-history row. |
| `consumerVersion` bump after local edit | Update the slice's detail block. Re-audit generalization (status + blockers). Append run-history row. |
| `rr update <slug> --apply` (DOWN-sync) | Update kitabVersion + lastPullAt in the slice block. Recompute verdict. Append run-history row. |
| `/rr-send <slug>` (UP-sync) | Update lastPushAt. Reset consumerVersion = kitabVersion if kitab merged the push. Append run-history row. |

## Kitab-side aggregator (operator)

From inside `~/projects/resources`:

```bash
# minimum viable aggregator — pure shell
for c in CareerPack notion-page-clone rahmanef.com content-rahmanef-com superspace cescadesigns; do
  echo "=== $c ==="
  cat /home/rahman/projects/$c/docs/kitabsync.md 2>/dev/null | head -40 || echo "  (no report)"
done
```

Or paste the **kitab aggregator prompt** (see `docs/consumer-manifest.md`)
into a Claude session in the kitab to get a parsed roll-up.

## See also

- [`docs/consumer-manifest.md`](./consumer-manifest.md) — `.kitab.json` spec, lifecycle, generalisation cheat sheet
- `packages/cli/lib/consumer-manifest.{mjs,d.ts}` — schema + diff impl
- `packages/cli/bin/scan-consumers.mjs` — `rr scan-consumers` CLI
- `packages/mcp/src/resources/sync.mjs` — MCP `rr://sync/scan/*`
