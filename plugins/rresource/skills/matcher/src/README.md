# rresource:matcher — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/matcher/` (2,976 LOC) |
| Convex domain | `~/projects/CareerPack/convex/matcher/` (2 tables) |
| Shared deps | `~/projects/CareerPack/frontend/src/shared/lib/utils.ts` |
| Spec | `cookbook/features/matcher.md` (in this plugin) |

## Install (run by the skill, not manually)

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/matcher" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/matcher"              "$DST/convex/"
```

Then sanitize per `SHARED.md` §11 (R1..R17): drop Clerk, swap raw HTML primitives, namespace tables `matcher_*`, gate with `requirePermission`, add `by_workspace` index. Add `useMatcher` localStorage fallback if backend not wired yet.

## i18n note

Indonesian copy throughout. Budget 1–2h for EN/locale conversion if target audience is non-ID.

## AI surface

Exposes ATS scoring, cover-letter draft, CV-tailoring as Convex actions. Wire to `ai-agent` slice manifest if present (see `cookbook/features/ai-agent.md`).
