# Recipe: multi-block-selection

Marquee + click+shift block selection with bulk actions. Source: notion-page-clone block-selection.

Already at `template-base/frontend/slices/notion/slices/block-selection/`.

## Mechanics

- `BlockSelectionProvider` context tracks `Set<string>` of selected IDs + anchor for range select
- `MarqueeOverlay` draws selection box during pointer drag
- Document-level capture listener for modifier-aware grip clicks
- `SelectionToolbar` floats above selection with bulk actions (delete, duplicate, convert type)
- `multiMove` hook handles drag-as-group with nesting safety (can't move parent into child)
