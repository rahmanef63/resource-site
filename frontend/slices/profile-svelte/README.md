# Profile — Svelte 5 / SvelteKit

Native Svelte renderings over the canonical framework-neutral profile data seam.

```bash
npx rr add profile --framework sveltekit
npx rr add profile resume --framework sveltekit
npx rr add profile card --framework sveltekit
```

- `resume`: printable one-column CV with contacts, summary, skills, experience, projects, and Print/PDF.
- `card`: avatar/initials, roles/location, outbound links, and single-open FAQ accordion.
- Shared canonical `frontend/slices/profile/lib/core.ts` owns the placeholder data and `configureResume` / `configureAbout` seams.

No React, Next, Lucide, or shadcn runtime is copied into the Svelte distribution.
