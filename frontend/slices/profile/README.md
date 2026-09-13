# Profile

One owner identity in two renderings over one configured-data seam.

```bash
# React/Next default
npx rr add profile
npx rr add profile resume
npx rr add profile card

# Native Svelte 5 / SvelteKit
npx rr add profile --framework sveltekit
npx rr add profile resume --framework sveltekit
npx rr add profile card --framework sveltekit
```

## Shared data core

`frontend/slices/profile/lib/core.ts` owns the portable `ResumeProfile` / `AboutProfile` models, bundled placeholder data, `configureResume`, `configureAbout`, read seams, and initials helper. Both frameworks read the same module singleton; configure it once at app boot from Convex, a CMS, JSON, or any other host source.

## Resume

React:
```tsx
import { Resume, configureResume } from "@/features/profile";
configureResume({ name: "Ada Lovelace", roles: ["Engineer"], /* … */ });
<Resume />
```

Svelte exports the same `configureResume` seam plus native `<Resume />`. Both preserve contacts, summary, skills, experience, projects, and Print/PDF.

## Card

React:
```tsx
import { AboutProfile, configureAbout } from "@/features/profile";
configureAbout({ name: "Ada Lovelace", roles: ["Engineer"], description: "…", links: [], faq: [] });
<AboutProfile />
```

Svelte exports native `<AboutProfile />` + `<FaqList />` over the same configured data. Both preserve avatar/initials, roles/location, outbound links, and a single-open FAQ.

React/Next additionally keeps `resumeApp` / `aboutProfileApp` appshell descriptors. The Svelte distribution intentionally does not invent an appshell descriptor contract.
