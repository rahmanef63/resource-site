# Compose Solver (Phase B)

The compose solver decides whether a set of desired slices can be installed into a target project without colliding with each other or with the project's existing state. It is the runtime sibling of the typed [`SliceContract`](../packages/cli/lib/contract.ts) DSL from Phase A.

Public surface lives in `packages/cli/lib/compose-solver.mjs` (runtime) + `.d.ts` (types). The CLI wrapper is `packages/cli/bin/compose.mjs`, dispatched from `cli.js` as `rr compose`.

## Inputs

```ts
interface ComposeRequest {
  state: RrJsonState;
  desired: string[];
  resolveDeps?: boolean; // default true
}
```

`RrJsonState` is a projection of `rr.json` plus some ambient data the schema doesn't yet codify:

| Field | Source | Notes |
|---|---|---|
| `auth` | `rr.json#/auth.provider`, mapped `convex-auth → convex` | Enum: `convex \| clerk \| next-auth \| none`. |
| `slicesInstalled` | `rr.json#/slices` + `/features` | Slugs already in the target. |
| `envExisting` | parsed `.env.example` (optional) | Reserved env vars on the target. |
| `rbacRolesExisting` | RBAC seed migration | Permissions already present. |
| `convexTablesExisting` | `convex/schema.ts` scan | Table names already declared. |

The CLI dispatcher fills these from the parsed `rr.json` — `envExisting` / `rbacRolesExisting` / `convexTablesExisting` are read from optional top-level arrays on `rr.json` so projects can stub them while the proper scanners are landing in Phase D.

## Algorithm

```
1.  for each desired slug:
       lookup contract → unknown?
         allowUnknownSlices (default true) → warning: uncontracted, accept with note
         strict mode                       → blocker: missing-dep, skip
       else add to candidate set.

2.  BFS over requires.deps[] (visited-set per root):
       chain revisits → throw "dependency cycle detected: a → b → c → a"
       dep installed  → skip (already in target)
       dep unknown    → blocker: missing-dep on parent slice
       dep new        → pull into candidate set, recurse

3.  for each candidate, run state-vs-slice checks:
       requires.auth ≠ state.auth   → blocker: auth-mismatch
       provides.tables ∩ state      → blocker: table-collision
       requires.env  ⊄ state.env    → warning: env-missing

4.  for each candidate-pair (A,B):
       provides.tables(A) ∩ provides.tables(B)  → arbitrate (see below)
       requires.rbac(A)  ∩ requires.rbac(B)     → warning: rbac-collision

5.  for each candidate's conflicts: ["<other>:<key>.<value>"]:
       if other in candidates AND other.provides[key].includes(value):
          → arbitrate (see below)

6.  arbitration:
       both A,B installed              → warning: both-installed-conflict; KEEP both
       exactly one installed           → installed wins; drop the new candidate
       neither installed, depA ≠ depB  → drop the one with fewer dependers
       neither installed, depA = depB  → drop the lex-later slug
       record outcome in arbitrations[].

7.  decide accepted / rejected:
       any blocker on a slug → reject UNLESS slug ∈ state.slicesInstalled.

8.  assemble result struct + proof[] trace.
```

## Conflict Arbitration

When two new candidates collide on `table-collision` or `explicit-conflict`, the solver does **not** reject both. Instead it picks a winner using a two-level rank:

1. **Most dependers wins.** For each colliding slice, count how many OTHER candidates list it in `requires.deps[]`. The slice with more dependers stays; the other is dropped.
2. **Alphabetical tiebreak.** Equal dependers → drop the slice whose slug sorts later. Deterministic, so CI runs reproducibly.

Every arbitration lands as an entry in `result.arbitrations[]`:

```ts
{ conflict, winner: "doku-payment", loser: "midtrans-payment",
  reason: "tie at 0 dependers — alphabetical tiebreak drops \"midtrans-payment\"" }
```

The proof trace echoes the same decision:

```
- midtrans-payment: arbitrated against doku-payment (tie at 0 dependers — alphabetical tiebreak drops "midtrans-payment")
```

### When both colliders are already installed

If both sides of the conflict are in `state.slicesInstalled`, **neither is dropped** — the solver records a `both-installed-conflict` **warning** so the operator knows the project already has a mess to clean up, but doesn't break the build mid-compose. Both slices stay in `accepted` with a `notes.<slug> = "both-installed-conflict"` marker.

### When one collider is installed

The installed slice wins (mid-flight uninstall is out of scope) and the new candidate is dropped. This rule is preserved from v1.

## Uncontracted Slices

Most slices in the current catalog don't have a `slice.contract.ts` yet — they pre-date Phase A. By default the solver treats this as the **common case**: a desired slug with no registered contract is accepted with an `uncontracted` warning, but its surface is not inspected for conflicts (the solver simply has nothing to inspect).

This makes `rr compose` and the `rr add` pre-flight gate usable during migration. Operators can opt back into the old strict behaviour with `--strict` (see below).

## Strict Mode

Pass `--strict` to either `rr compose` or `rr add` to flip the solver into CI-gate mode:

- `state.allowUnknownSlices = false` — uncontracted slugs become **blocker** `missing-dep`.
- Every `warning` (env-missing, rbac-collision, both-installed-conflict, etc.) is elevated to **blocker** at the CLI layer, so the affected slice moves into `rejected[]`.

Use `--strict` in CI to catch every soft issue. Use the default mode for day-to-day operator runs.

## Output

```ts
interface ComposeResult {
  accepted: string[];
  rejected: { slug; reasons: Conflict[] }[];
  conflicts: Conflict[];   // all conflicts, including warnings
  envMissing: string[];    // union across accepted slices
  rbacToCreate: string[];  // union across accepted slices, minus existing
  tablesAdded: { slug; tables: string[] }[];
  proof: string[];         // human-readable trace
}
```

The proof array is the operator-facing artifact — every accept/reject/dep-pull lands as a single line:

```
+ convex-auth: pulled in as transitive dep of doku-payment
- doku-payment: rejected (explicit-conflict, explicit-conflict)
+ mdx-blog: accepted (auth=none, user-requested)
```

## Worked example 1 — doku + mdx-blog (no collision)

```bash
$ npx rahman-resources compose doku-payment mdx-blog

✓ compose ok  rr.json: rr.json

Proof
  + convex-auth: pulled in as transitive dep of doku-payment
  + doku-payment: accepted (auth=convex, tables=doku_orders+doku_webhook_events, user-requested)
  + mdx-blog: accepted (auth=none, user-requested)
  + convex-auth: accepted (auth=convex, tables=auth_users+..., transitive dep)

Accepted (3)
  doku-payment
  mdx-blog
  convex-auth
```

Note the BFS dep resolution: `doku-payment` declared `requires.deps: ["convex-auth"]`, so the solver auto-pulled `convex-auth` into the candidate set even though it wasn't user-typed.

## Worked example 2 — doku + midtrans (documented collision)

`frontend/slices/doku-payment/slice.contract.ts` declares:

```ts
conflicts: [
  "midtrans-payment:tables.paymentOrders",
  "midtrans-payment:tables.paymentWebhookEvents",
],
```

If a `midtrans-payment` contract ships with `provides.tables: ["paymentOrders", ...]`, the solver fires `explicit-conflict` and runs the arbitration. With equal dependers the alphabetical tiebreak drops `midtrans-payment` (later than `doku-payment`):

```bash
$ npx rahman-resources compose doku-payment midtrans-payment

✖ compose blocked  rr.json: rr.json

Proof
  + convex-auth: pulled in as transitive dep of doku-payment
  - midtrans-payment: arbitrated against doku-payment (tie at 0 dependers — alphabetical tiebreak drops "midtrans-payment")
  + doku-payment: accepted (auth=convex, tables=doku_orders+..., user-requested)
  + convex-auth: accepted (auth=convex, tables=auth_users+..., transitive dep)

Accepted (2)
  doku-payment
  convex-auth

Rejected (1)
  midtrans-payment
    [explicit-conflict]  Slice "midtrans-payment" is the target of "doku-payment"'s explicit conflict on tables.paymentOrders.
```

The exit code is non-zero so CI / `rr add`'s pre-flight gate can short-circuit. Operators who want the loser back can re-run with the slugs reversed or pass `--strict` to refuse any composition with arbitration-level fallout.

## Pre-flight gate on `rr add`

`packages/cli/bin/cli.js#runAdd` calls `composePreflight(slug, repoRoot, target)` before any file copy when:

- The target directory contains an `rr.json`.
- The user did **not** pass `--force`.

A single blocker conflict aborts `add` with the proof printed and `exit 1`. The gate is a no-op for fresh dirs (no `rr.json` yet) so `rr init` flows are unaffected.

## Known boundaries

- The candidate-pair conflict check is **O(n²)**. Fine for ~20 slices, untested past 200.
- `loadAllContracts` swallows individual contract-load failures (so one broken file doesn't take down the whole solver). The dedicated `npm run validate:contracts` script is the place to surface those errors.
- The cycle detector throws as soon as the first cycle is hit; if a request would contain multiple disjoint cycles only the first one is reported.
