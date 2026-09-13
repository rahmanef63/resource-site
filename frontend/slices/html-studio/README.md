# html-studio — sandboxed HTML/CSS/JS editor with live preview

A tiny web-page studio. Type HTML / CSS / JS, watch it render live in a sandboxed iframe, then Save to a shareable `/p/<slug>`. Code / Split / Preview, responsive/tablet/phone widths, saved pages and public/private visibility are backed by one framework-neutral document adapter/core.

## Security boundary

Every framework uses the same `HTML_SANDBOX` constant:

`allow-scripts allow-forms allow-popups allow-presentation`

It intentionally omits **`allow-same-origin`**. Arbitrary `srcdoc` code therefore runs in an opaque origin and cannot read the host's cookies/localStorage. Do not add `allow-same-origin` in a renderer; this boundary is containment, not sanitization.

## React / Next (default)

```tsx
import { HtmlStudio } from "@/features/html-studio";

<div className="h-dvh"><HtmlStudio /></div>
```

The default renderer uses Lucide + shadcn. `htmlStudioApp` remains the React/appshelly lazy descriptor.

## Svelte 5 / SvelteKit

```bash
npx rr add html-studio --framework sveltekit
```

```svelte
<script lang="ts">
  import { HtmlStudio } from "@/features/html-studio-svelte";
</script>

<div class="h-dvh"><HtmlStudio /></div>
```

The Svelte renderer preserves the 250ms live preview, Code/Split/Preview modes, device widths, Save/open/delete list, visibility, copy-link and `payload={{ slug }}` behavior without React, Next, Lucide or shadcn runtime imports.

## Shared host seam

```ts
import { configureHtmlStudio } from "@/features/html-studio";

configureHtmlStudio({
  mode: "live",
  save: (doc) => myApi.publishPage(doc),
  load: (slug) => myApi.getPage(slug),
  list: () => myApi.listPages(),
  remove: (slug) => myApi.deletePage(slug),
});
```

With no wiring, the bundled in-memory mock keeps editor, preview, Save, saved list and open/delete flows interactive. Omit `save` for read-only mode or `list` to hide the saved rail.
