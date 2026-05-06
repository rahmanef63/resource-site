# dashboard-ide

IDE-style layout: activity bar + tabs + panels. Editor-first apps (notion, code, doc tools).

## Source

`template-base/frontend/shared/ui/layout/container/ide/` (if present from superspace) — or compose from `three-column/` + custom tab strip.

## Composition

```
+---+----------------------+
| A |  TabsBar             |
| B |+----------+----------+
| C ||          |          |
|   ||  Editor  | Inspect  |
|   ||          |          |
|   |+----------+----------+
|   ||  Status / Console   |
+---+----------------------+
```

- A = activity bar (icons for Files, Search, Git, Extensions, Settings)
- TabsBar = open file tabs
- Editor + Inspector = main work area
- Status/Console = bottom panel (collapsible)

## When to use

- Block editor apps (notion-style)
- Code/markdown editors
- Workflow builders (n8n-style)

## Wired with notion

Mount `frontend/slices/notion/` inside this layout. Activity bar → notion sidebars (workspace tree, search, inbox). Editor area → notion BlockEditor.
