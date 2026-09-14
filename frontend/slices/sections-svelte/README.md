# Sections — Svelte 5 / SvelteKit

Native Svelte distribution for the canonical `sections` landing-page slice. React/Next remains the default installer; use `--framework sveltekit` for this renderer.

## Included

- `LandingProvider`, list view, and full editor over the same `LandingStore` adapter.
- Shared reducer, ordering, blank-section factory, field schema, and config parser.
- Native Svelte renderers for stats, testimonials, FAQ, pricing, newsletter, and custom content.
- Background-image shell and image-ratio semantics shared with React.
- No React, Next, Lucide React, shadcn, Embla, or template-shared runtime in the Svelte distribution.

```bash
npx rr add sections --framework sveltekit
```

Pass `store=` directly to `LandingView` / `LandingEditorView`, or wrap them in `LandingProvider`. Public renderers accept the same `LandingSection` objects and config JSON as React.
