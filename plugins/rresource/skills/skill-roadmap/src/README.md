# rresource:skill-roadmap — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/skill-roadmap/` (2,530 LOC — D3/canvas-heavy) |
| Convex module | `~/projects/CareerPack/convex/skill-roadmap/` (5 files, 3 tables) |
| Template seed | curated Indonesian skill paths |
| Spec | `cookbook/features/skill-roadmap.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/skill-roadmap" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/skill-roadmap"              "$DST/convex/"
```

## Deps

- `d3` or canvas lib (check slice's package imports)

## Sanitize

Namespace tables `skill_*` (3 tables). Drop Clerk. Add `by_workspace` index. Extract template seed to data file for locale swap.
