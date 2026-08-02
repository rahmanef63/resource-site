# changelog-feed

Reusable, prop-driven changelog / what's-new section. Server component, no
client JS. Composable from any template `/changelog` or `/whats-new` page.

## Surface

| Component | Props | Notes |
|---|---|---|
| `ChangelogFeedSection` | `eyebrow?, title?, subtitle?, entries, sortDescending?, limit?, layout?, className?` | Header + entries. Sorts newest-first by default, optional `limit` for excerpts. |
| `ChangelogEntryCard` | `entry, variant?, className?` | Single entry; usable standalone. |

### `ChangelogEntry` shape

```ts
type ChangelogKind = "feature" | "fix" | "improvement" | "chore" | "breaking";

type ChangelogEntry = {
  id: string;
  version: string;          // "v0.4.2"
  date: number;             // ms timestamp
  kind: ChangelogKind;      // visual badge color
  title: string;
  body: string;             // plain/markdown — split on \n\n into paragraphs
  bullets?: string[];       // optional flat bullet list
  groups?: { heading: string; bullets: string[] }[]; // optional sub-sections
};
```

### Layout variants

- `timeline` (default) — vertical timeline with date marker on the left rail,
  entries on the right with a dot + connecting line
- `cards` — stacked large shadcn `Card`s (1 column, wide)
- `list` — minimal divided list, version/date/badge as a single header line

### Kind → badge color

| Kind | Tone |
|---|---|
| `feature` | emerald |
| `improvement` | sky |
| `fix` | amber |
| `chore` | muted |
| `breaking` | destructive |

All applied via Tailwind utilities through `cn()` over the shadcn `Badge`
primitive — no new variants registered.

## Usage

```tsx
import { ChangelogFeedSection } from "@/features/changelog-feed";

const entries = [
  {
    id: "1",
    version: "v0.4.2",
    date: Date.parse("2026-05-15"),
    kind: "feature" as const,
    title: "Multi-tenant workspaces",
    body: "Spin up an isolated workspace per customer.\n\nIncludes RBAC presets and per-workspace API keys.",
    bullets: ["Per-workspace API keys", "RBAC presets", "Audit log scoping"],
  },
  {
    id: "2",
    version: "v0.4.1",
    date: Date.parse("2026-05-08"),
    kind: "fix" as const,
    title: "Race condition in subscription webhook",
    body: "Stripe webhooks arriving within 200ms could double-charge.",
  },
];

<ChangelogFeedSection
  eyebrow="Updates"
  title="What's new"
  subtitle="The latest from the platform."
  entries={entries}
  layout="timeline"
  limit={10}
/>
```

## Convex tables

None — pure component slice. Wire to any data source (MDX, Convex, JSON, CMS)
in your template.

## Permissions

None.

## Dependencies

- npm: none (pure shadcn + Tailwind)
- shadcn primitives: `badge`, `card`, `separator`
- env vars: none

## Notes

- All copy is consumer-supplied. The slice ships no English content strings —
  only structural labels (`Feature`, `Fix`, …) on the kind badges, which are
  baked from the `kind` enum.
- Uses neutral shadcn tokens (`bg-muted`, `text-muted-foreground`, `border`,
  `text-foreground`) plus tone-prefixed Tailwind utilities for the kind
  badges — works with any theme preset including dark mode.
- Server component — safe to drop into any RSC tree, no `"use client"`
  required, no hydration cost.
