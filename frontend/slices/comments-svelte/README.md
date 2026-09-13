# Comments — Svelte 5 / SvelteKit

Native renderless Svelte adapters for the canonical polymorphic threaded-comments
engine. React/Next remains the default distribution.

```bash
npx rr add comments --framework sveltekit
```

`CommentsThread` passes the canonical `CommentsState` into a Svelte snippet;
`CommentsAnchor` passes loading/open/total counts plus an optional deep-link.
The canonical `TargetRef`, thread builder, state/forbidden-word guard, agent tools,
and Convex backend are shared unchanged.
