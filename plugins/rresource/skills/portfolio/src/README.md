# rresource:portfolio — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/portfolio/` (2,239 LOC) |
| Convex domain | `~/projects/CareerPack/convex/portfolio/` (1 table, multi-media + multi-link) |
| FileUpload stack | requires `rresource:file-upload` skill installed first |
| Spec | `cookbook/features/portfolio.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/portfolio" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/portfolio"              "$DST/convex/"
```

## Deps

- `rresource:file-upload` (for media upload)

## Sanitize

Namespace table `portfolio_*`. Drop Clerk. Add `by_workspace` index.
