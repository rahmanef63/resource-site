# resume — one-column CV renderer

A clean one-column résumé / CV: name, roles, location, contact row, summary,
skills, experience (role · org · period + bullets) and projects. The profile is
injected via a single seam, so the same component renders any person. A
"Print / PDF" button calls `window.print()` against a print-friendly layout.

## Mount

```tsx
import { Resume } from "@/features/resume";

// Zero wiring → a generic placeholder profile (fully populated)
<Resume />
```

Or hand `resumeApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureResume, type ResumeProfile } from "@/features/resume";

const me: ResumeProfile = {
  name: "Your Name",
  roles: ["Role A", "Role B"],
  location: "City · Timezone",
  summary: "One paragraph about you.",
  contacts: [
    { label: "you@example.com", href: "mailto:you@example.com" },
    { label: "example.com", href: "https://example.com" },
  ],
  skills: ["TypeScript", "React"],
  experience: [
    { role: "Engineer", org: "Acme", period: "2022 — Present", points: ["Shipped X."] },
  ],
  projects: [{ name: "Thing", desc: "What it does.", url: "https://example.com/thing" }],
};

configureResume(me); // call once at boot
```

Every other file in the slice imports ONLY this seam.
