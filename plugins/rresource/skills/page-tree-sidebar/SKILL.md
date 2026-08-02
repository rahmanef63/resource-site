---
description: Workspace sidebar w/ dnd page tree + nested pages + collapse state. Trigger when user runs /rresource:page-tree-sidebar or asks to scaffold "page-tree-sidebar" template into the current project.
---

# rresource:page-tree-sidebar

**Kind:** recipe
**Bundled spec:** `cookbook/recipes/page-tree-sidebar.md`
**Shared protocol:** `SHARED.md` at plugin root (read first, once per project).

## Run protocol

1. **Verify baseline.** Read `SHARED.md` §1. If target stack missing
   any row → STOP and tell user which dependency to install/port first.

2. **Read bundled spec.** Open `cookbook/recipes/page-tree-sidebar.md` (relative to plugin
   root). It contains: tier, file list, cp commands, schema additions,
   npm deps, env vars, nav registration, common breakage,
   testing steps.

3. **Resolve aliases.** If consumer repo uses `src/` instead of
   `frontend/src/`, rewrite the cp DST paths BEFORE running them. Do
   NOT edit each file's imports — fix `tsconfig.json` paths once.

4. **Run cp commands** from the spec verbatim. Set
   `SRC=<plugin-root>/cookbook` and
   `DST=<consumer-repo-root>`. (For features whose source is NOT yet
   vendored in the cookbook, ask the user whether to vendor from
   `~/projects/CareerPack` or scaffold from the spec.)

5. **Apply schema additions** to consumer's `convex/schema.ts` —
   additive only, every new field `v.optional(...)`, indexes follow
   `by_user` convention. Run `pnpm backend:dev-sync`.

6. **Install npm deps** listed in spec via consumer's package manager
   (default pnpm; fall back to npm if no `pnpm-lock.yaml`).

7. **Register nav** (if dashboard slice) — edit
   `shared/lib/dashboardRoutes.tsx` + `shared/components/layout/navConfig.ts`.

8. **Run verification** — `SHARED.md` §12 checklist. Report PASS/FAIL
   per item.

9. **Stop and confirm** before committing. Do NOT auto-push unless
   user explicitly says to.

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

Inherit `SHARED.md` §11 (R1..R17). Most-violated:
- NO Clerk / NextAuth — auth = `@convex-dev/auth` only.
- NO raw `<button>` / `<input type=date|file>` / `<dialog>`.
- NO `<a href="/internal">` (use `next/link`).
- NO `<img src="...">` (use `next/image`).
- NO bare `.collect()` (use `.withIndex(...).take(N)`).
- NO public Convex fn without `args` validator.
- NO Server Action without `requireUser` + ownership check.
