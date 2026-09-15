# notion-app — SvelteKit

Native Svelte 5/SvelteKit block editor over the same Notion App domain model, markdown bridge, adapter CRUD contract, tool collection and pure block semantics as the React/Next default.

```bash
npx rr add notion-app --framework sveltekit
```

Mount `<PageEditor pageId data />`. `data` is the same framework-neutral `EditorDataAdapter` contract used by the React editor. You may instead pass `initialPage` for local/controlled use. The Svelte surface supports title + block CRUD, slash/markdown transforms, lists/todos/headings/quote/callout/code/equation/media/table/toggle/layout placeholders, keyboard undo/redo, drag + button reorder, Markdown import/export, child-page creation, and optional tool registration/navigation. React-only host render components are not pulled into the Svelte runtime.
