# html-studio — sandboxed HTML/CSS/JS editor with live preview

A tiny web-page studio. Type HTML / CSS / JS, watch it render live in a
**sandboxed** iframe, then Save to a shareable `/p/<slug>`. Code / Split /
Preview view toggle, device-width preview (responsive / tablet / phone), a
saved-pages rail, and public/private visibility.

## Security boundary

The preview iframe runs user code with `sandbox="allow-scripts allow-forms
allow-popups allow-presentation"` — crucially **without** `allow-same-origin`,
so the framed document gets a unique opaque origin and cannot read the host's
cookies / localStorage. Keep that intact wherever the HTML renders; it is the
containment, not a scrubber (the studio renders arbitrary markup on purpose).

## Mount

```tsx
import { HtmlStudio } from "@/features/html-studio";

// Zero wiring → in-memory mock store (editor + live preview + saved list all live)
<HtmlStudio />
```

Pass `payload={{ slug }}` to open a saved page, or hand `htmlStudioApp`
(lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureHtmlStudio } from "@/features/html-studio";

configureHtmlStudio({
  mode: "live",
  save: (doc) => myApi.publishPage(doc),     // returns { slug }
  load: (slug) => myApi.getPage(slug),        // SavedPage | null
  list: () => myApi.listPages(),              // omit to hide the saved rail
  remove: (slug) => myApi.deletePage(slug),
});
```

Every other file in the slice imports ONLY this seam. Omit `save` for a
read-only sandbox, or `list` to hide the saved-pages rail.
