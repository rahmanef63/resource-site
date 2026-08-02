---
description: Client-side image/PDF-to-text via Tesseract.js. Indonesian + English language packs. Worker-based, doesn't block UI. Trigger when user runs /rresource:ocr or asks to add the "ocr" primitive to the current project.
---

# rresource:ocr

**Kind:** primitive
**Bundled spec:** `cookbook/primitives/ocr.md`
**Shared protocol:** `SHARED.md` (read once per project).

## Run protocol

1. **Verify baseline.** Read `SHARED.md` §1. STOP if any row missing.
2. **Read bundled spec.** Open `cookbook/primitives/ocr.md`.
3. **Resolve aliases.** Adjust DST paths if consumer uses `src/` instead of `frontend/src/`.
4. **Run cp.** From the lift path noted in spec. If lift source is on a private repo not mounted on user's box, ask user to mount it OR scaffold from spec example.
5. **Apply schema additions** (if any) — additive only, `v.optional`, `by_user` index. Run `pnpm backend:dev-sync`.
6. **Install npm deps** listed in spec — pnpm default, npm fallback.
7. **Wire env vars** if listed.
8. **Run verification** per `SHARED.md` §12.
9. **Stop and confirm** before commit. Never auto-push.

## Bundled `src/` (preferred source)

Each skill folder ships a `src/` subdirectory. **If `src/` exists,
prefer it as the cp source over any upstream lift path** — it's the
canonical, vendored, self-contained version.

Layout convention:
```
src/
├── README.md          per-skill install + usage
├── lib/               pure helpers (no React)
├── hooks/use<X>.ts    localStorage state (DEFAULT — works without Convex)
├── components/<X>.tsx React UI
├── convex/<X>.ts      OPTIONAL — Convex schema fragment + queries/mutations
└── styles/            optional CSS
```

**State management policy:**
- Default = localStorage hooks. Slice works standalone, no backend required.
- Real persistence = copy `convex/` files into target's `convex/`,
  apply schema fragment (commented at top of each file), swap the
  `use<X>Local` hook call for `useQuery` + `useMutation` from Convex.

**Modular by design:** each skill folder is downloadable in isolation —
no cross-skill imports. Slight code duplication (e.g. localStorage
helper appears in multiple slices) is intentional.

## Hard rules

Inherit `SHARED.md` §11 (R1..R17). Most-violated for primitives:
- NO bare `.collect()` on Convex queries.
- NO public Convex fn without `args` validator.
- NO Server Action without `requireUser` + ownership check.
- NO `NEXT_PUBLIC_*` for sensitive values (Resend key, OAuth secrets).
