# start-here — guided OS onboarding tour

A "Start Here" tour that lays the OS out as a path of stages. Each stage opens
real apps from the LIVE registry, so the tour is drift-proof: it reads the
injected app catalog instead of a hardcoded list. Add an app and it shows up
automatically — in a stage if you listed it, otherwise a final "Everything else"
bucket. Every tile opens the real app.

## Mount

```tsx
import { StartHere } from "@/features/start-here";

// Zero wiring → in-memory mock catalog (a few generic apps + 3 stages)
<StartHere />
```

Or hand `startHereApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureStartHere } from "@/features/start-here";

configureStartHere({
  mode: "live",
  apps: registry.list(), // [{ id, title, icon, description? }] from your live catalog
  open: (id) => shell.openWindow(id), // launch the real app
  stages: [
    { title: "Get oriented", blurb: "…", appIds: ["home", "library"] },
    { title: "Try it live", blurb: "…", appIds: ["assistant"] },
  ],
});
```

Every other file in the slice imports ONLY this seam. Omit `stages` and every
app falls into a single "Everything else" stage.
