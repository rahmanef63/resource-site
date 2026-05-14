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
       lookup contract  → unknown? blocker: missing-dep, skip.
       else add to candidate set.

2.  BFS over requires.deps[] (depth ≤ 16):
       depth > 16     → throw "cycle detected"
       chain revisits → throw "cycle detected"
       dep installed  → skip (already in target)
       dep unknown    → blocker: missing-dep on parent slice
       dep new        → pull into candidate set, recurse

3.  for each candidate, run state-vs-slice checks:
       requires.auth ≠ state.auth   → blocker: auth-mismatch
       provides.tables ∩ state      → blocker: table-collision
       requires.env  ⊄ state.env    → warning: env-missing

4.  for each candidate-pair (A,B):
       provides.tables(A) ∩ provides.tables(B)  → blocker: table-collision on BOTH
       requires.rbac(A)  ∩ requires.rbac(B)     → warning: rbac-collision

5.  for each candidate's conflicts: ["<other>:<key>.<value>"]:
       if other is in candidates AND other.provides[key].includes(value):
          → blocker: explicit-conflict on BOTH

6.  decide accepted / rejected:
       any blocker on a slug → reject UNLESS slug ∈ state.slicesInstalled
       (installed wins: peers keep their blockers, installed stays accepted)

7.  assemble result struct + proof[] trace.
```

### Why greedy reject-both?

When two new candidates collide, the solver v1 rejects both rather than pick a winner. The smarter ranked variant ("drop the candidate with fewer dependers") is on the roadmap but adds non-trivial CSP plumbing for marginal gain on the current ~20-slice catalog. Operators can re-run `rr compose` with a smaller `desired` set after seeing the proof.

The one exception is when **one of the colliders is already installed**. The installed slice wins (mid-flight uninstall is out of scope), and only the new colliding candidate is rejected.

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

If a `midtrans-payment` contract ships with `provides.tables: ["paymentOrders", ...]`, the solver fires `explicit-conflict` on **both** sides and rejects them both:

```bash
$ npx rahman-resources compose doku-payment midtrans-payment

✖ compose blocked  rr.json: rr.json

Proof
  + convex-auth: pulled in as transitive dep of doku-payment
  - doku-payment: rejected (explicit-conflict, explicit-conflict)
  - midtrans-payment: rejected (explicit-conflict, explicit-conflict)
  + convex-auth: accepted (auth=convex, tables=auth_users+..., transitive dep)

Accepted (1)
  convex-auth

Rejected (2)
  doku-payment
    [explicit-conflict]  Slice "doku-payment" declares explicit conflict with "midtrans-payment" on tables.paymentOrders.
    [explicit-conflict]  Slice "doku-payment" declares explicit conflict with "midtrans-payment" on tables.paymentWebhookEvents.
  midtrans-payment
    [explicit-conflict]  Slice "midtrans-payment" is the target of "doku-payment"'s explicit conflict on tables.paymentOrders.
    [explicit-conflict]  Slice "midtrans-payment" is the target of "doku-payment"'s explicit conflict on tables.paymentWebhookEvents.
```

Note that `convex-auth` (the transitive dep) is still accepted — only the colliders are rejected. The exit code is non-zero so CI / `rr add`'s pre-flight gate can short-circuit.

## Pre-flight gate on `rr add`

`packages/cli/bin/cli.js#runAdd` calls `composePreflight(slug, repoRoot, target)` before any file copy when:

- The target directory contains an `rr.json`.
- The user did **not** pass `--force`.

A single blocker conflict aborts `add` with the proof printed and `exit 1`. The gate is a no-op for fresh dirs (no `rr.json` yet) so `rr init` flows are unaffected.

## Limitations (v1)

- The candidate-pair conflict check is **O(n²)**. Fine for ~20 slices, untested past 200.
- The "installed wins" rule does not currently strip mirrored blocker attribution from the candidate side — the proof line for the new candidate still lists the conflict, but the installed slice stays accepted. Operator-friendly enough; auto-tooling that ingests the JSON output should always filter by `accepted[]` not by `conflicts[].slug`.
- `loadAllContracts` swallows individual contract-load failures (so one broken file doesn't take down the whole solver). The dedicated `npm run validate:contracts` script is the place to surface those errors.
