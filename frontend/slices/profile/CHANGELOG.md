# Changelog — profile

## 1.1.0 — 2026-09-13

- Extracted `ResumeProfile` / `AboutProfile`, placeholder data, configure/read seams, and initials into one framework-neutral `lib/core.ts`; React host files are now appshell adapters over that core.
- Added native Svelte 5/SvelteKit `resume` and `card` variants. Variant-only installs preserve `resume|card` flattening and always copy the canonical profile core.
- Resume keeps contacts, summary, skills, experience, projects, and Print/PDF; Card keeps avatar/initials, roles/location, outbound links, and single-open FAQ behavior.
- Public preview now hosts canonical `preview.tsx`; default React catalog dependency is pinned to `lucide-react@^0.400.0`.

Historical variant notes remain in `variants/resume/CHANGELOG.md` and `variants/card/CHANGELOG.md`.
