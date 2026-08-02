# rresource:financial-calculator — src bundle

> **Status:** upstream-pending. No vendored copy yet. Agent must lift from CareerPack at install time.

## Upstream source

| What | Path |
|---|---|
| Frontend slice | `~/projects/CareerPack/frontend/src/slices/financial-calculator/` (1,592 LOC) |
| Convex domain | `~/projects/CareerPack/convex/financial-calculator/` (2 tables) |
| Spec | `cookbook/features/financial-calculator.md` |

## Install

```bash
SRC=~/projects/CareerPack
DST=<consumer-repo-root>
cp -r "$SRC/frontend/src/slices/financial-calculator" "$DST/frontend/src/slices/"
cp -r "$SRC/convex/financial-calculator"              "$DST/convex/"
```

## Deps

- `recharts` (charts)
- Indonesian locale data baked in — extract to `lib/locales/id.ts` for swap.

## Sanitize

Namespace tables `fincalc_*`. Drop Clerk. Replace raw HTML.
