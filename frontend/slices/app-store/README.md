# app-store — install, create + toggle apps

The dynamic half of an app registry, in two surfaces:

- **`<AppStore />`** — storefront: featured hero, category sidebar,
  install/uninstall cards, and Apps/Features toggles for built-ins (the
  DISABLED set is persisted, so anything new ships enabled).
- **`<CreateApp />`** — build a custom app: name, glyph, accent, runtime
  (html / node / python / shell), entry — with live `manifest.json` preview.

Both write one localStorage registry. Turn it into launchable apps:

```tsx
import { useInstalledApps, useDisabledIds } from "@/features/app-store";

const dynamicApps = useInstalledApps();   // AppDescriptor[] — html → sandboxed
                                          // iframe, command → console
const disabled = useDisabledIds();        // filter your built-in manifest
```

## Console exec (`lib/host.ts`)

Command/script apps run in a terminal-style console. Demo echo by default;
wire a real one-shot shell:

```ts
import { configureAppStoreExec } from "@/features/app-store";

configureAppStoreExec({
  mode: "live",
  exec: { run: (cmd) => post("/api/exec", { cmd }) },  // → { stdout, stderr, code }
});
```

Treat that endpoint like SSH — auth it accordingly.
