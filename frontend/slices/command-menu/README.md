# `command-menu` slice — renderless ⌘K palette + search modal

Generic, renderless command palette. The slice owns:

- `CommandDialog` chrome + `cmdk` wiring
- `Cmd+K` / `Ctrl+K` global hotkey toggle
- MRU "Recent commands" history (`localStorage`-backed)

Consumers own:

- Which groups + items appear (pages, databases, custom actions, …)
- What each item does on `onSelect`
- The translated label bag (`CommandPaletteLabels`, `SearchModalLabels`)

Pulled UP from `notion-page-clone`'s `command-palette` slice (Wave N+3.7).
The Nosion-specific adapter layer (`adapters/nosion.tsx`,
`adapters/NosionCommandPalette.tsx`) was intentionally **dropped** at the
kitab boundary — wire your own adapter (see below).

## Install

```bash
npx rahman-resources add command-menu
```

Brings in `cmdk` and the shadcn `command` + `dialog` primitives if missing.

## `CommandPalette` — adapter shape

```tsx
import {
  CommandPalette,
  type CommandGroup,
  type HistoryEntry,
} from "@/features/command-menu";

function MyCommandPalette() {
  const router = useRouter();

  const groups: CommandGroup[] = [
    {
      id: "actions",
      heading: "Actions",
      items: [
        {
          id: "new-doc",
          value: "action:new-doc",
          label: "New document",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onSelect: () => router.push("/docs/new"),
          track: { id: "action:new-doc", label: "New document" },
        },
      ],
    },
    {
      id: "favorites",
      heading: "Favorites",
      hideOnQuery: true, // collapse when user starts typing
      items: favorites.map((f) => ({
        id: f.id,
        value: `fav:${f.title}:${f.id}`,
        label: f.title,
        onSelect: () => router.push(`/p/${f.id}`),
      })),
    },
  ];

  const onHistorySelect = (entry: HistoryEntry) => {
    // Map MRU history ids back to effects, e.g. re-run "action:new-doc".
    if (entry.id === "action:new-doc") router.push("/docs/new");
  };

  return (
    <CommandPalette
      groups={groups}
      onHistorySelect={onHistorySelect}
      labels={{
        placeholder: "Cari halaman atau jalankan perintah…",
        empty: "Tidak ada hasil.",
        recentCommandsHeading: "Perintah terakhir",
      }}
    />
  );
}
```

### Group flags

| Flag             | Meaning                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `hideOnQuery`    | Hide the group when the input is non-empty (e.g. Favorites, Recent). |
| `showOnQueryOnly`| Show the group ONLY when the input is non-empty (search results).    |

### `track` field

Set `item.track = { id, label }` to record selections in the MRU "Recent
commands" group. The palette persists `{ id, label }` in `localStorage`
under `kitab.cmdk.history` (override by passing your own `Storage` shim
to `loadHistory` / `saveHistory`).

## `SearchModal` — adapter shape

The modal renders dialog chrome + sections; the consumer supplies hits
and selection callbacks via `bindings`:

```tsx
import {
  SearchModal,
  type SearchHit,
  type SearchModalBindings,
} from "@/features/command-menu";

function MySearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const { isLoading, pages, databases } = useMyConvexSearch(q);
  const recents = useMyRecents();

  const bindings: SearchModalBindings = {
    isLoading,
    pages: pages.map((p): SearchHit => ({ id: p._id, title: p.title, icon: <PageIcon icon={p.icon} /> })),
    databases: databases.map((d): SearchHit => ({ id: d._id, title: d.name, icon: <DbIcon icon={d.icon} /> })),
    recents: recents.map((r): SearchHit => ({ id: r._id, title: r.title })),
    onQueryChange: setQ,
    onSelectPage: (hit) => router.push(`/p/${hit.id}`),
    onSelectDatabase: (hit) => router.push(`/db/${hit.id}`),
  };

  return <SearchModal open={open} onOpenChange={onOpenChange} bindings={bindings} />;
}
```

`SearchHit` is a normalised shape — the modal does not know how the
consumer fetched the data.

## Wiring the global hotkey

`CommandPalette` listens for `Cmd+K` / `Ctrl+K` by default. Disable when
you want to pair it with `SearchModal` or another shortcut owner:

```tsx
<CommandPalette groups={groups} disableHotkey open={open} onOpenChange={setOpen} />
```

## Forbidden terms

The contract declares `forbiddenTerms: ["nosion", "Nosion"]`. The
`forbidden:terms` validator scans the slice tree for these literals and
fails CI on any leak. Adapter modules belong in the consumer repo, not
here.

## Required consumer-injected props

Per the contract `requiredProps: ["groups", "onNavigate", "labels"]` —
`onNavigate` is satisfied by `item.onSelect` callbacks (palette) and
`onSelectPage` / `onSelectDatabase` (search modal). The consumer MUST
provide these for the slice to remain portable.

## Deps

- `cmdk` (npm)
- shadcn `command`, `dialog`
