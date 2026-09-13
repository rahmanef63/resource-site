# html-studio — Svelte 5 / SvelteKit

Native Svelte HTML/CSS/JS studio over the same framework-neutral document store and sandbox contract as the React default distribution.

```svelte
<script lang="ts">
  import { HtmlStudio, configureHtmlStudio } from "@/features/html-studio-svelte";

  configureHtmlStudio({
    mode: "live",
    save: (doc) => api.savePage(doc),
    load: (slug) => api.loadPage(slug),
    list: () => api.listPages(),
    remove: (slug) => api.removePage(slug),
  });
</script>

<div class="h-dvh"><HtmlStudio /></div>
```

With no host wiring the bundled in-memory mock keeps editor, live preview, Save, saved-page rail, open/delete, visibility and copy-link flows interactive.

## Security invariant

The preview iframe uses the shared `HTML_SANDBOX` value:

`allow-scripts allow-forms allow-popups allow-presentation`

It intentionally omits `allow-same-origin`. Do not add it: arbitrary `srcdoc` code must stay in an opaque origin and must not inherit host cookies/localStorage access.
