# Migration Planner (Phase E)

The migration planner converts a slice contract delta into a concrete, risk-scored migration plan with ready-to-paste artifacts. It complements the compose solver (Phase B) and the 3-way merge engine (Phase D): the solver decides _what_ to install, the merge engine decides _which file bytes_ to keep, and the planner decides _how_ to evolve schema + env + RBAC across slice versions.

Runtime + types live in:

- `packages/cli/lib/migration-plan.mjs`
- `packages/cli/lib/migration-plan.d.ts`
- `packages/cli/bin/migrate.mjs` — CLI dispatcher (`rr migrate`)

## CLI

```bash
npx rahman-resources migrate <slug> --from <v1> [--to <v2>]              # ASCII plan
npx rahman-resources migrate <slug> --from <v1> --json                   # JSON plan
npx rahman-resources migrate <slug> --from <v1> --write-files            # write convex/migrations/
npx rahman-resources migrate <slug> --from <v1> --write-files --force-overwrite
```

`--to` defaults to the on-disk contract's `version`; passing an explicit `--to` that disagrees with the file is a hard error (bump the contract first).

`--from` is resolved against git in this order:

1. tag `v<version>`
2. tag `<version>`
3. tag `<slug>-v<version>`
4. best-effort: walk `git log -- frontend/slices/<slug>/slice.contract.ts` and pick the most recent commit whose `contract.version === <from>`.

If none resolve, the CLI exits with a helpful error.

On `--write-files` the CLI also appends a `migration-applied` lineage entry to `.kitab/lineage/<slug>.dna.json`, listing all written step ids in `transforms`.

## Algorithm

### `diffContracts(from, to): ContractDiff`

Pure. Compares `from` and `to` over four buckets:

- `provides.tables`
- `provides.routes`
- `requires.env`
- `requires.rbac`

Each bucket produces `added` (in `to`, not in `from`) and `removed` (in `from`, not in `to`).

**Rename detection** runs only when `to.migrationFrom?.[from.version]` is set. The planner cannot trust the marker string itself — it's an opaque tag for human auditing. Instead it pairs single-sided table additions/removals **by position** in their original `provides.tables` array. This matches the common case where the author renames every table in one go (the typical kitab pattern: `paymentOrders → doku_orders`, `paymentWebhookEvents → doku_webhook_events`). When `removed.length !== added.length` the excess stays in `added` / `removed` rather than being force-paired.

Without the marker, even an unambiguous rename stays a destructive drop + add — explicit opt-in keeps the planner conservative.

### `planMigration(diff): MigrationPlan`

Pure. Emits steps in a stable order:

1. **Renames** — `convex-schema-rename-table` (medium risk, reversible). Convex has no in-place table rename, so each rename ships a full `internalMutation` body that copies rows from old → new. Dropping the old table is deliberately left to a follow-up so the step stays reversible.
2. **Adds** — tables, env vars, RBAC permissions, routes (info-only). All low risk + reversible.
3. **Removes** — tables (high risk, irreversible — emits a warning), env (low), RBAC (medium — strands roles), routes (info-only).

Step ids look like `M001-add-table-doku_orders`. Zero-padded counter keeps them sortable + file-name-safe.

Risk + reversibility heuristics:

| Op | Risk | Reversible |
|---|---|---|
| add (any kind) | low | yes |
| rename table | medium | yes |
| remove rbac | medium | yes |
| drop table | high | no |
| remove env / route | low | yes |

Each step carries pre-rendered artifacts inline so the operator can paste them verbatim:

- `convexSchema` — snippet for `convex/features/<slug>/schema.ts`
- `convexMigration` — full file body for `convex/migrations/<step-id>.ts`
- `envExample` — line for `.env.example`
- `rbacPatch` — patch instructions for `convex/workspace/permissions.ts`
- `note` — free-form operator note

## DOKU rename proof

The `doku-payment` slice originally provided `paymentOrders` + `paymentWebhookEvents` (shared with `midtrans-payment`). The 2026-05-12 namespace decision moved DOKU to `doku_orders` + `doku_webhook_events`. With no rename signal the planner would emit a high-risk drop + low-risk add for each table — destructive and irreversible.

Adding `migrationFrom: { "0.9.0": "namespace-rename-2026-05" }` to the new contract flips this to two reversible rename steps. The synthetic smoke test (`scripts/smoke-migrate-doku.mjs`) constructs the v0.9.0 contract inline and asserts on the result. Verbatim CLI output:

```
→ doku-payment: v0.9.0 → v0.1.0

+------------------------------+------------------------------+--------+------+----------------------------------------------------+
| id                           | kind                         | risk   | rev  | description                                        |
+------------------------------+------------------------------+--------+------+----------------------------------------------------+
| M001-rename-table-paymentOrd | convex-schema-rename-table   | medium | yes  | Rename Convex table "paymentOrders" → "doku_orders |
| M002-rename-table-paymentWeb | convex-schema-rename-table   | medium | yes  | Rename Convex table "paymentWebhookEvents" → "doku |
+------------------------------+------------------------------+--------+------+----------------------------------------------------+

summary: 2 step(s) — 0 high-risk, 0 irreversible

OK Smoke — rename detection paired both tables.
```

Both renames are reversible. Zero high-risk steps. Zero data loss.

Run the smoke test yourself:

```bash
node scripts/smoke-migrate-doku.mjs
```

## Tests

`packages/cli/lib/migration-plan.test.mjs` covers 14 scenarios:

- identical contracts → empty plan
- single-side additions (table, env, rbac)
- single-side drop → high-risk + irreversible + warning
- rename pairing with + without the migration marker
- summary counts (`highRisk`, `irreversible`)
- mixed adds + drops, step ordering, id uniqueness
- doku rename smoke (paymentOrders → doku_orders, paymentWebhookEvents → doku_webhook_events)

## Out of scope

- Auth provider transitions (those are blockers in the compose solver, not migrations).
- Multi-slice rollups — the planner is per-slice. A consumer absorbing N contract bumps runs `rr migrate` N times.
- Down-migrations — the planner doesn't auto-invert reversible steps. The operator runs `rr migrate <slug> --from <new> --to <old>` against a manually flipped contract.
