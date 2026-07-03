# Profile

One owner's identity in two renderings. Install one surface or both:

```bash
npx rr add profile resume   # formal one-column printable CV
npx rr add profile card      # compact avatar + links + FAQ card
npx rr add profile           # both — mount the one you want
```

## resume

```tsx
import { Resume, configureResume } from "@/features/profile";

configureResume({ name: "Ada Lovelace", roles: ["Engineer"], /* … */ });
<Resume />   // unwired → populated placeholder CV; Print/PDF built in
```

## card

```tsx
import { AboutProfile, configureAbout } from "@/features/profile";

configureAbout({ name: "Ada Lovelace", roles: ["Engineer"], links: [], faq: [] });
<AboutProfile />   // unwired → mock identity card + FAQ accordion
```

Both are pure UI — no backend. `configureResume` / `configureAbout` inject data
into a module singleton the components read via `useResumeProfile()` /
`useAboutProfile()`. Each also ships an appshell `AppDescriptor` (`resumeApp`,
`aboutProfileApp`) for dock/launcher hosts.
