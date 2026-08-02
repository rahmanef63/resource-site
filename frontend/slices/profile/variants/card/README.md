# about-profile — identity / profile card

A macOS "About This Mac"-style identity card as an OS app: avatar (or monogram
fallback), name, roles, location, a short description, outbound links and an
accordion FAQ. The whole card is driven by ONE injected profile.

## Mount

```tsx
import { AboutProfile } from "@/features/about-profile";

// Zero wiring → generic mock person (fully populated)
<AboutProfile />
```

Or hand `aboutProfileApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureAbout } from "@/features/about-profile";

configureAbout({
  name: "Jordan Lee",
  roles: ["Founder", "Engineer"],
  location: "Lisbon",
  description: "Short bio, one or two sentences.",
  links: [
    { label: "Site", href: "https://jordan.example" },
    { label: "Email", href: "mailto:hi@jordan.example" },
  ],
  faq: [{ q: "Open to work?", a: "Yes — reach out via email." }],
  avatarUrl: "https://jordan.example/me.png", // optional; monogram if omitted
});
```

Every other file in the slice imports ONLY this seam. `avatarUrl` is optional —
when omitted the card shows initials. `location`, `links` and `faq` collapse
gracefully when empty.
