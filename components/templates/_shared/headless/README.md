# headless — setup / update / backup / onboarding UI (SSOT)

Canonical source of the headless-OS surface every standalone template repo
ships (`/setup` health page, update card, backup card, post-claim onboarding
wizard). Backported from `template-personal-brand-os` v1.0.0 — the worked
reference — with the Convex coupling removed.

**Props-driven (R3).** Nothing here imports `convex/react`. The standalone
repo wires its own backend into the props with thin wrappers:

```tsx
// app/setup/page.tsx (standalone repo)
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SetupHealth } from "@/components/templates/_shared/headless";
import { CORE_VERSION } from "@/lib/headless-core/version";

export default function SetupPage() {
  return (
    <SetupHealth
      convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL}
      useStatus={() => useQuery(api.setup.status)}
      productName="Personal Brand OS"
      coreVersion={CORE_VERSION}
    />
  );
}
```

```tsx
// settings page (standalone repo)
const fetchUpstream = useAction(api.update.fetchUpstreamVersion);
const triggerDeploy = useAction(api.update.triggerDeploy);
<UpdateCard
  currentVersion={CORE_VERSION}
  upstreamRepoUrl={UPSTREAM_REPO_URL}
  fetchUpstream={fetchUpstream}
  triggerDeploy={triggerDeploy}
/>

const convex = useConvex();
const importAll = useMutation(api.backup.importAll);
<BackupCard
  exportAll={() => convex.query(api.backup.exportAll, {})}
  importAll={(snapshot) => importAll({ snapshot })}
  filePrefix="brand-backup"
/>
```

```tsx
// admin gate (standalone repo) — show once until onboarded
const upsert = useMutation(api.settings.upsert);
const seedSample = useMutation(api.seed.seedSample);
const status = useQuery(api.setup.status);
<OnboardingWizard
  onDone={refetch}
  save={(fields) => upsert(fields)}
  seedSample={() => seedSample()}
  seeded={status?.seeded}
  ImageField={ImageField}  // repo's Convex upload control
/>
```

Backend contract (`convex-templates/<slug>/`): `setup.status` public query,
`settings.upsert` (markOnboarded), `update.fetchUpstreamVersion` +
`update.triggerDeploy` actions, `backup.exportAll` / `backup.importAll`,
`seed.seedSample`. Reference implementations live in
`convex-templates/personal-brand-os/`.

Token note: uses `text-primary`/`bg-primary` (universal), not pbo's
`--brand` token.
