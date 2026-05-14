# Bidirectional Sync — Slice Composition Compiler Phase D

The kitab is **bidirectional**: when a slice improves upstream, consumers can
pull the update — but consumers usually have their own local edits on top.
A raw text merge would treat every consumer customization as a conflict the
moment a single line in the same file drifted. The Phase D engine moves the
conflict boundary up one layer: it three-way-diffs at the **slice-element**
level (a file, an env-var, a table, a route, a hook, …) instead of the
character level.

The shipped artifacts:

- `packages/cli/lib/merge3.mjs` + `merge3.d.ts` — the pure merge function
  and `applyMerge` writer.
- `packages/cli/lib/snapshot.mjs` — builds a `SliceSnapshot` from any slice
  directory (kitab or consumer).
- `packages/cli/bin/update.mjs` — `rr update <slug>` CLI subcommand that
  orchestrates the snapshot trio, runs the merge, prints a report, and
  optionally applies it.
- `packages/cli/lib/merge3.test.mjs` — vitest cases for every outcome kind.

## Snapshot shape

```ts
interface SliceSnapshot {
  slug: string;
  version: string;
  files: Record<string, string>;   // relative path → file content
  contract?: SliceContract;        // parsed slice.contract.ts if present
}
```

A snapshot is a snapshot — pure data, no side effects. The same shape is
used for `base` (the last kitab version the consumer adopted, fetched via
`git show`), `kitab` (current main), and `consumer` (the local files in
the consumer's project).

## The 3-way table

Per element (file path or contract-surface member):

| base | kitab | consumer | outcome             | merged value |
| ---- | ----- | -------- | ------------------- | ------------ |
| =    | =     | =        | identical           | base         |
| =    | ≠     | =        | auto-merged         | kitab        |
| =    | =     | ≠        | consumer-wins-clean | consumer     |
| =    | ≠     | ≠ kitab  | conflict            | _none_       |

Additional cases handle adds and deletes:

- Added in kitab only → auto-merged (consumer never saw the element).
- Added in consumer only → consumer-wins-clean (their local extension).
- Removed in kitab, modified in consumer → conflict ("keep or drop?").
- Removed in consumer, modified in kitab → conflict ("re-add or drop?").
- Removed in consumer, unchanged in kitab → consumer-wins-clean (a clean
  consumer-side deletion).
- Removed in kitab, untouched in consumer → auto-merged removal.

## Contract elements

`requires.env`, `requires.rbac`, `requires.deps`, `provides.tables`,
`provides.routes`, `provides.hooks`, `provides.components`, and
`provides.events` are all merged as **sets**. The unit of conflict is a
single member — `BAR` in `requires.env`, `auth_users` in
`provides.tables`, etc. This avoids the false-conflict trap where a kitab
adding `BAR` to env would clash with a consumer adding `LOCAL_OVERRIDE`,
even though the two additions are orthogonal.

## Drift score

```
driftAfterMerge = round(100 * (conflicts + consumerWinsClean) / totalElements)
```

`0` means "consumer is fully synced with kitab after this merge — every
divergence either matched or was auto-applied". Numbers above zero count
both unresolved conflicts and consumer-only customizations: they describe
how far the consumer has drifted from the kitab, regardless of who is
"right".

The score is written back into `.kitab/lineage/<slug>.dna.json` under
`consumers.<name>.drift_score` so the existing `rr graph` view stays
honest.

## How `rr update` differs from raw text merge

| | raw text merge (`git merge-file`) | `rr update` |
|---|---|---|
| Unit | line | slice element |
| Sees adds in different files as | unrelated | unrelated |
| Sees adds to different env vars as | unrelated | unrelated |
| Sees adds to different lines of the same file as | conflict (if context overlaps) | conflict (whole file diverged) |
| Hint on conflict | `<<<<<<<` markers | structured `conflictHint` string + before/after values |
| Writes lineage | no | yes (`.kitab/lineage/<slug>.dna.json`) |
| Computes drift score | no | yes |

`rr update` is intentionally coarser than text merge at the file level —
once two parties edited the same file, the engine refuses to guess and
asks for human review. The win is at the contract surface: kitab adding
an env var, an RBAC permission, or a route is now a clean auto-merge,
because the merge unit is the **named member**, not the surrounding JSON.

## Usage

```bash
# Dry-run preview (default)
npx rahman-resources update convex-auth

# Machine-readable
npx rahman-resources update convex-auth --json

# Apply the clean merges to the consumer dir
npx rahman-resources update convex-auth --apply

# Apply even with conflicts (kitab wins on each contested element)
npx rahman-resources update convex-auth --apply --force

# Point at an rr.json outside cwd
npx rahman-resources update convex-auth --rr-path /path/to/rr.json
```

The first invocation against a slice (no DNA entry yet) treats the kitab
tip as both `base` and `kitab` — so all consumer edits are recorded as
`consumer-wins-clean` and nothing is overwritten.

On every run we append a `LineageEntry` with
`transforms: ["3-way-merge", "consumer-sync"]` and upsert the consumer's
adoption row with the new `drift_score`. `rr graph <slug>` then surfaces
the drift in the adoption matrix.
