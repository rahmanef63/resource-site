# rresource:document-checklist — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/document-checklist/` (845 LOC) |
| Convex module | `~/projects/CareerPack/convex/document-checklist/` (1 table) |
| Template seed | hardcoded Indonesian — `slices/document-checklist/data/templates.id.ts` |
| Spec | `cookbook/features/document-checklist.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/document-checklist" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/document-checklist"              "$DST/convex/"
```

## i18n burden — heaviest of all slices

~200 doc templates + category labels in Indonesian. Budget 2-3h for EN conversion or extract to `data/templates.<locale>.ts` and select via locale.

## Sanitize

Namespace table `docchk_*`. Drop Clerk. Replace raw HTML.
