# kanban-board

Drag-drop columns w/ HTML5 DnD (no dnd-kit). Default → localStorage. Opt-in → Convex.

## Use (local)
```tsx
const { cards, move } = useKanbanStore("my-board", [
  { id: "1", title: "Wireframe", column: "todo" },
  { id: "2", title: "Spec", column: "doing" },
]);
<KanbanBoard
  columns={[{id:"todo",title:"To do"},{id:"doing",title:"Doing"},{id:"done",title:"Done"}]}
  cards={cards}
  onMove={move}
/>
```

## Use (Convex)
1. Copy `convex/kanban.ts` + schema fragment.
2. Replace `useKanbanStore` with `useQuery(api.kanban.list)` + `useMutation(api.kanban.move)`.

## Upgrade to dnd-kit
For nested lists, accessibility, keyboard reordering — install `@dnd-kit/core + @dnd-kit/sortable` and replace draggable handlers.
