# rresource:mock-interview — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/mock-interview/` (904 LOC) |
| Convex module | `~/projects/CareerPack/convex/mock-interview/` (1 table + AI actions) |
| Question bank | curated Indonesian fallback |
| Spec | `cookbook/features/mock-interview.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/mock-interview" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/mock-interview"              "$DST/convex/"
```

## Deps

- `rresource:ai-agent` (for answer eval action). Wire AI manifest binding.

## Sanitize

Namespace table `interview_*`. Drop Clerk. Add `by_workspace` index. Convert question bank to data/questions.<locale>.ts.
