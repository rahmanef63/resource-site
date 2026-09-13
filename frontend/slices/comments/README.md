# Comments — Threaded

Polymorphic-target threaded comments over `TargetRef = { kind, id, subId? }`.
The slice owns comment ordering, reply nesting, open counts, forbidden-word
validation, CRUD bindings, agent tools, and a canonical Convex backend while the
consumer owns the visual skin and target domain.

## Install

```bash
npx rr add comments
# Svelte 5 / SvelteKit
npx rr add comments --framework sveltekit
```

React/Next remains the default distribution. Both frameworks reuse the same
`Comment` / `TargetRef` types, `buildThread`, `createCommentsState`, agent tools,
and `convex/features/comments` backend.

The React distribution exposes render-prop `CommentsThread` / `CommentsAnchor`
plus the compatibility `useComments` adapter. The Svelte distribution exposes
renderless snippet equivalents, so the host can keep its own cards, avatars,
composer, badges, and navigation.

`createCommentsState(bindings, { target, forbiddenWords })` returns sorted flat
items, nested reply trees, `openCount`, loading state, and CRUD methods. The
`pathMap` seam on `CommentsAnchor` stays host-defined so page/blog/task routes are
never hardcoded into this slice.

## Backend boundary

The Convex feature stores polymorphic target fields and author/reply/resolution
state. Reads should be wrapped by the host's target-visibility rule; mutations
require authenticated authors. Pair with `convex-auth` for identity.
