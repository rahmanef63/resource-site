# Recipe: page-tree-sidebar

Hierarchical page tree with drag-drop reordering. Source: notion-page-clone workspace-sidebar.

Already at `template-base/frontend/slices/notion/slices/workspace-sidebar/`.

## Tech

`@dnd-kit/sortable` with `verticalListSortingStrategy`. Tree state as `Set<string>` of open IDs. Reorder via `reorderPages(parentId, orderedIds)` action.

## Sections

- Favorites
- Recents
- All Pages (tree)

## Density modes

`lib/density.ts` toggles compact ↔ comfortable spacing.

## Standalone use

```bash
cp -r template-base/frontend/slices/notion/slices/workspace-sidebar frontend/slices/sidebar
# Adjust imports
```
