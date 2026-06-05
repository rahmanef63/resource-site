# dashboard-ide

IDE-style layout: activity bar + tabs + lazy explorer + editor + panels.
Editor-first apps (code/markdown editors, notion, workflow builders).

## Source

Live recipe: `app/preview/dashboard-ide/` (page + parts + explorer + mock-data).
Production explorer: the `file-explorer` slice (`FileExplorerAdapter`).

## Composition

```
+---+----------------------+
| A |  TabsBar        Run  |
| B |+----------+----------+
| C ||          |          |
|   ||  Editor  | Inspect  |
|   ||          |          |
|   |+----------+----------+
|   ||  Terminal/Problems  |
+---+----------------------+
|      status bar          |
+--------------------------+
```

- A = activity bar (Files, Search, Git, Debug, Settings)
- B/C column = **lazy Explorer** (see rule below)
- TabsBar = open-file tabs (open from explorer, closable, overflow-x)
- Editor = active file only; Inspector right panel optional
- Terminal/Problems bottom panel + status bar (branch / lang / Ln,Col)

## The lazy-explorer rule (RAM)

A real IDE never materialises the whole tree:

1. Mount fetches ONLY the root listing.
2. Expanding a folder fetches that folder's children (async, per-dir).
3. **Collapsing drops the listing AND unmounts the child DOM** — mounted
   rows ≈ visible rows, so a 60-package `node_modules` costs nothing
   until expanded, and nothing again after collapse.
4. The editor holds ONE file body (fetched on tab focus, replaced on
   switch); tabs keep paths only.

In the recipe this is `listDir(path)` / `readFile(path)` in
`mock-data.ts`. In production swap them for the `file-explorer` slice's
`FileExplorerAdapter.list(path)` / your raw-file route — interface is
the same shape.

## When to use

- Block editor apps (notion-style)
- Code/markdown editors
- Workflow builders (n8n-style)

## Wired with slices

- `file-explorer` → the explorer column (adapter-injected, lazy per dir).
- `image-editor` / `reel-editor` → mount in the editor area for asset tabs.
- `notion` → activity bar drives notion sidebars; editor area → BlockEditor.
