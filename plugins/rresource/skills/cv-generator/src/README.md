# rresource:cv-generator — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/cv-generator/` (3,760 LOC — biggest) |
| Convex module | `~/projects/CareerPack/convex/cv-generator/` (1 table + file storage) |
| Shared deps | utils, appMeta, file-upload helpers |
| Spec | `cookbook/features/cv-generator.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/cv-generator" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/cv-generator"              "$DST/convex/"
```

## Deps

- `react-pdf` / `@react-pdf/renderer` (PDF export)
- `rresource:file-upload` (for asset storage)
- `rresource:ai-agent` (AI hints — optional)

## Sanitize

Namespace tables `cv_*`. Drop Clerk. Move PDF generation to Convex action (server-side). Indonesian section labels → i18n keys.
