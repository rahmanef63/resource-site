# rresource:career-dashboard — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/career-dashboard/` (1,090 LOC) |
| Convex domain | `~/projects/CareerPack/convex/career-dashboard/` (1 table) |
| Shared hook | `~/projects/CareerPack/frontend/src/shared/hooks/useApplications.ts` |
| Shared comp | `~/projects/CareerPack/frontend/src/shared/components/DataTable.tsx` |
| Spec | `cookbook/features/career-dashboard.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/career-dashboard" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/career-dashboard"              "$DST/convex/"
cp    "$SRC/frontend/src/shared/hooks/useApplications.ts" "$DST/frontend/src/shared/hooks/"
cp    "$SRC/frontend/src/shared/components/DataTable.tsx" "$DST/frontend/src/shared/components/"
```

## Sanitize

Namespace table `career_applications`. Drop Clerk. AI skill bindings → wire to `ai-agent` manifest if present.
