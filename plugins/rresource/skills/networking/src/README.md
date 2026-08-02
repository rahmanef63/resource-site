# rresource:networking — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/networking/` (1,003 LOC) |
| Convex domain | `~/projects/CareerPack/convex/networking/` |
| Shared deps | `~/projects/CareerPack/frontend/src/shared/lib/utils.ts` |
| Spec | `cookbook/features/networking.md` (in this plugin) |

## Install (run by the skill, not manually)

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/networking" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/networking"              "$DST/convex/"
```

Then sanitize per `SHARED.md` §11: drop Clerk, swap raw HTML, namespace tables `networking_*`, gate with `requirePermission`, add `by_workspace` index.

## AI surface

Capability binder + manifest wiring. Re-targets AI bus for outreach drafts.
