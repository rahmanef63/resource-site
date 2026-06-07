# loading-states — Loading States

One configurable `LoadingSkeleton` component plus per-kind presets, composed
on top of the shadcn `Skeleton` primitive, and a spinner-based `LoadingState`
for in-flight work where a skeleton would be wrong. The SSOT that replaces
ad-hoc `animate-pulse` divs and hand-rolled `Loader2` spans.

## Install

```bash
npx rahman-resources add loading-states
# alias: npx rr add loading-states
```

Requires the shadcn `skeleton` and `spinner` primitives:

```bash
npx shadcn@latest add skeleton spinner
```

## Usage

```tsx
import { LoadingSkeleton, LoadingState } from "@/features/loading-states";

// Skeleton — pick the shape that mirrors the streamed content
<LoadingSkeleton kind="table" count={8} columns={5} />
<LoadingSkeleton kind="list" />
<LoadingSkeleton kind="block" className="h-64" />

// Spinner — work in flight (actions, refetches)
<LoadingState variant="inline" label="Refreshing…" />
<LoadingState variant="block" label="Loading workspace…" />

// Overlay — veil over a `relative` parent during a mutation
<div className="relative">
  <DataView />
  {saving && <LoadingState variant="overlay" label="Saving…" />}
</div>
```

### Kinds

`"text" | "card" | "list" | "table" | "form" | "page" | "block"`

`count` overrides lines/rows/fields per kind; `columns` applies to `table`.
Defaults live in `LOADING_PRESETS`.

## Drop-in: route `loading.tsx`

```tsx
import { LoadingSkeleton } from "@/slices/loading-states";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <LoadingSkeleton kind="page" />
    </div>
  );
}
```

## Skeleton vs spinner — when to use which

- **Skeleton** (`LoadingSkeleton`) — first paint of content with a known
  shape: route transitions, panel bodies, lists/tables before data arrives.
- **Spinner** (`LoadingState`) — indeterminate work where shape is unknown
  or the content already exists: form submits, refetches, overlays.

## Rules of engagement

- shadcn-only UI primitives. No raw `<button>` / `<dialog>`.
- 200-line hard cap per source file.
- Slice imports resolve via `@/components/ui/*`, `@/lib/utils`, or relative
  within-slice only.
