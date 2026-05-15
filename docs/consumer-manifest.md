# Consumer Manifest — `.kitab.json`

> Wave N+3 — Bidirectional Sync Detection Layer (BSDL).

Every slice copy living in a consumer repo (CareerPack, notion-page-clone,
rahmanef.com, content-rahmanef-com, superspace, cescadesigns) ships a
`.kitab.json` next to its slice files. The kitab uses these to detect what
needs UP-sync (`rr-send`) vs DOWN-sync (`rr update`), and to enforce the
generalisation gate before accepting a push.

This is the file Notion / Yeoman / shadcn never had: a versioned, validated
contract between a consumer copy and its upstream source — without it, the
kitab is blind to consumer divergence.

## Where it lives

```
<consumer-repo>/frontend/slices/<slug>/.kitab.json
```

One file per adopted slice. Slug must match a kitab `slice.contract.ts` id.

## Schema

```json
{
  "$schema": "https://resource.rahmanef.com/schemas/kitab-consumer.json",
  "kitabSlug": "comments",
  "kitabVersion": "0.1.0",
  "consumerVersion": "0.1.3",
  "syncDirection": "bidirectional",
  "generalization": {
    "status": "portable",
    "auditedAt": "2026-05-15",
    "blockers": []
  },
  "lastPullAt": "2026-05-13T10:15:00.000Z",
  "lastPushAt": null
}
```

| Field | Type | Notes |
|---|---|---|
| `kitabSlug` | kebab-case | Must match `slice.contract.ts` id in the kitab. |
| `kitabVersion` | semver | Last kitab version pulled DOWN via `rr update`. |
| `consumerVersion` | semver | Local divergence version. Bump after each local edit. |
| `syncDirection` | `bidirectional` \| `down-only` \| `up-only` \| `frozen` | Operator policy. |
| `generalization.status` | `portable` \| `needs-adapter` \| `consumer-locked` | UP-sync gate. |
| `generalization.auditedAt` | ISO date | Last time a human (or `rr-prep`) audited the slice. |
| `generalization.blockers[]` | strings | Required if status ≠ `portable`. |
| `lastPullAt` | ISO timestamp \| `null` | Set by `rr update --apply`. |
| `lastPushAt` | ISO timestamp \| `null` | Set by `/rr-send`. |

## Sync verdict matrix

`rr scan-consumers` computes the verdict per slice as:

| Condition | Verdict | Allowed actions (also gated by `syncDirection` + generalisation) |
|---|---|---|
| `consumerVersion > kitabVersion` AND kitab contract == `kitabVersion` | `up-needed` | `rr-send` (if `portable` + bidirectional/up-only) |
| `consumerVersion == kitabVersion` AND kitab contract > `kitabVersion` | `down-needed` | `rr-update` |
| both ahead | `diverged` | both — operator picks |
| both equal | `in-sync` | — |
| manifest exists, no kitab match | `consumer-only` | `rr-send` (if `portable`) |
| kitab contract exists, no manifest | `kitab-only` | `rr-update` |

`syncDirection: "frozen"` always blocks both. `generalization.status:
"consumer-locked"` always blocks `rr-send` regardless of direction.

## Generalisation: the UP-sync gate

The kitab refuses ingestion of consumer copies that bake in business-specific
terms — otherwise CareerPack's `<Apply>` button leaks "application" into
notion's task tracker. `generalization.status` must be `portable` for
`rr-send` to accept the push.

Definition of `portable`:

- No hardcoded route paths — accept `basePath` prop or read from a route
  registry the consumer wires.
- No hardcoded copy/labels — accept `labels` prop or pull from a translation
  map the consumer wires.
- No consumer-specific Convex tables — schema ships generic `<slug>_records`
  shape; consumer maps to its domain in an adapter.
- No consumer-specific RBAC permission strings — accept `permission` prop.
- No imports from consumer-specific paths.

When auditing flips `portable` → `needs-adapter`, list the concrete blockers:

```json
"generalization": {
  "status": "needs-adapter",
  "auditedAt": "2026-05-15",
  "blockers": [
    "hardcoded /dashboard/applications route in JobListView",
    "Convex table `applications` instead of generic `comments_records`",
    "requirePermission(\"apply.create\") not parameterised"
  ]
}
```

## CLI surface

```bash
# scan one consumer
npx rahman-resources scan-consumers --path /home/rahman/projects/CareerPack

# scan all registered consumers
npx rahman-resources scan-consumers --all

# json output for CI
npx rahman-resources scan-consumers --all --json

# narrow to one consumer by registry name
npx rahman-resources scan-consumers --consumer careerpack
```

The default consumer registry lives in
`packages/cli/bin/scan-consumers.mjs#DEFAULT_CONSUMERS` — point it at the
canonical path on the operator workstation.

## MCP surface

```
rr://sync/scan                      — verdicts across all registered consumers
rr://sync/scan/<consumer-name>      — single consumer's slice diffs
```

Returned shape mirrors `SyncDiff[]` from `consumer-manifest.d.ts`.

## Lifecycle

1. **Adoption** — operator runs `/rr-adopt <slug>` in the consumer repo. The
   skill copies the slice, then writes a starter `.kitab.json` with
   `kitabVersion === consumerVersion` and `lastPullAt` = now.
2. **Local edit** — developer edits the slice in the consumer repo. The
   commit hook (TODO — Wave N+4) bumps `consumerVersion`.
3. **Scan** — `rr scan-consumers` from the kitab side surfaces the consumer
   as `up-needed`.
4. **Audit + push** — operator runs `/rr-prep <slug> --fix` then
   `/rr-send <slug>`. `rr-send` writes the new `lastPushAt` and resets
   `kitabVersion = consumerVersion` after the kitab merge lands.
5. **Pull update** — when kitab ships a new version, consumer runs
   `npx rahman-resources update <slug> --apply`. Updates `kitabVersion` and
   `lastPullAt`.

## Generalisation patterns (cheat sheet)

| ❌ Consumer-locked | ✅ Portable |
|---|---|
| `<Link href="/dashboard/applications">` | `<Link href={\`${basePath}/${labels.list}\`}>` |
| Convex table `applications` | Convex table `<slug>_records` |
| `requirePermission("apply.create")` hardcoded | `requirePermission(props.permission)` |
| Hero text `"Lamar Pekerjaan"` literal | `<Hero text={t.applyCta} />` from props |
| `import { applicationSchema } from "@/schemas/career"` | Schema lives inside the slice, parameterised |

## See also

- [`docs/bidir-sync.md`](./bidir-sync.md) — 3-way semantic merge engine
- [`docs/compose-solver.md`](./compose-solver.md) — constraint solver behind `rr add`
- `packages/cli/lib/consumer-manifest.{mjs,d.ts}` — schema + diff impl
- `packages/cli/bin/scan-consumers.mjs` — CLI front-end
