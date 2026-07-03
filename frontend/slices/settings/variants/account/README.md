# settings-page

Adapter-driven account settings shell. Two-column layout (section nav + content
panel) that collapses to a `Select` on mobile. The consumer owns persistence —
the slice ships only UI plus a memory adapter for demos.

## Surface

| Export | Kind | Notes |
|---|---|---|
| `SettingsShell` | component | Two-column shell; renders the active section. |
| `ProfileSection` | component | Avatar + name/email/bio, optimistic Save. |
| `PreferencesSection` | component | Theme + language `Select`, density toggle. |
| `NotificationsSection` | component | Four `Switch` rows, persist-on-toggle. |
| `DangerZone` | component | Destructive "Delete account" + `AlertDialog`. |
| `useSettings(adapter)` | hook | load-on-mount + optimistic `save(patch)`. |
| `createMemoryAdapter(seed?)` | util | In-memory adapter for demos/tests. |

## Adapter contract

You implement `SettingsAdapter` to own where settings live (Convex, REST,
localStorage, …):

```ts
interface SettingsAdapter {
  load(): Promise<SettingsValues>;
  save(patch: Partial<SettingsValues>): Promise<void>;
}

interface SettingsValues {
  profile: { name: string; email: string; avatarUrl?: string; bio?: string };
  preferences: { theme: "light" | "dark" | "system"; language: string; density: "compact" | "comfortable" };
  notifications: { emailDigest: boolean; productUpdates: boolean; mentions: boolean; sms: boolean };
}
```

- `load()` is called once on mount.
- `save(patch)` receives a partial — only the saved section is present. Shallow-
  merge each section so partial patches don't clobber siblings (the bundled
  `createMemoryAdapter` already does this).

## Usage

```tsx
import { SettingsShell, type SettingsAdapter } from "@/features/settings-page";

const adapter: SettingsAdapter = {
  async load() {
    return await fetchSettings(); // your source of truth
  },
  async save(patch) {
    await persistSettings(patch);
  },
};

<SettingsShell
  adapter={adapter}
  onDeleteAccount={async () => {
    await deleteAccountMutation();
  }}
/>;
```

`active` + `onNavigate` are optional — omit them for internal section state, or
control the active section yourself (e.g. drive it from the URL).

### Convex wiring sketch

```ts
const me = useQuery(api.settings.get);
const update = useMutation(api.settings.update);

const adapter: SettingsAdapter = {
  load: async () => me!,
  save: async (patch) => { await update(patch); },
};
```

## Convex tables

None — the slice is persistence-agnostic. Provide your own table + mutations.

## Permissions

None enforced by the slice. Gate the page route and your `save`/delete mutations
with your own authz.

## Dependencies

- npm: `lucide-react`
- shadcn primitives: `alert-dialog`, `avatar`, `button`, `card`, `input`,
  `label`, `select`, `separator`, `skeleton`, `switch`, `textarea`
- env vars: none

## Notes

- All copy is neutral and consumer-editable; theme tokens only (`bg-accent`,
  `text-muted-foreground`, `border-destructive/40`) so it works with any preset.
- `SettingsShell` shows a skeleton until `load()` resolves.
- Notification toggles persist immediately; Profile/Preferences batch behind a
  Save button (disabled until dirty, shows a `Saving…` state).
