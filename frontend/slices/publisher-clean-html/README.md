# Publisher — clean HTML

Render a node tree to a **standalone, framework-runtime-free HTML document** with
one deduped CSS bundle and layered sanitization. Harvested + decoupled from the
Instatic CMS publisher — the host caching / loops / visual-components / Layer-C
islands are left behind; this is the pure render-to-clean-HTML core.

```bash
npx rr add publisher-clean-html
```

Stateless, env-free, **zero npm deps**, no Convex.

## Use it

```ts
import { publishPage, createModuleRegistry, type ModuleDefinition } from "@/features/publisher-clean-html";

const registry = createModuleRegistry([
  { id: "base.body", render: (_p, children) => ({ html: children.join("") }) },
  {
    id: "demo.heading",
    schema: { text: { type: "text" } },          // schema drives prop escaping
    render: (p) => ({ html: `<h1>${p.text}</h1>`, css: "h1{font-size:1.5rem}" }),
  },
] satisfies ModuleDefinition[]);

const tree = {
  rootNodeId: "root",
  nodes: {
    root: { id: "root", moduleId: "base.body", children: ["h"] },
    h: { id: "h", moduleId: "demo.heading", props: { text: "Hello" } },
  },
};

const { html } = publishPage(tree, registry, { title: "My page" });
// → <!DOCTYPE html>… one <style> bundle (reset + deduped module CSS) … <body><h1>Hello</h1></body>
```

Preview it: `<PublishPreview html={html} />` (sandboxed iframe `srcDoc`).

## What it does

1. **Walk** the tree bottom-up: render children → `escapeProps(props, schema)` →
   call the module's pure `render(props, children)` → dedup CSS by `moduleId`
   (~60-80% shrink) → splice author `classIds` + `inlineStyles` onto the root.
2. **Escape by schema type**, not by guessing the key name:
   `url|image|media` → safe-URL, `richtext` → DOMPurify, `svg` → SVG profile,
   everything else → HTML-escape.
3. **Assemble** `<!DOCTYPE>` + reset + framework + deduped module CSS + a
   deterministic (sorted) CSP plan. `cssEmission: "external"` returns the bundle
   separately and links it instead.

## Sanitization (the security spine)

| Layer | Guard |
|---|---|
| HTML | `escapeHtml` + `isSafeUrl`/`safeUrl` (block `javascript:`/`data:`) |
| CSS value | `sanitiseCssValue` (block `expression()`, `{}`, `</`, …) |
| CSS block | `sanitizeModuleCSS` (`</style` → `<\/style` RAWTEXT neutraliser) |
| Richtext / SVG | injected DOMPurify |

**Richtext/SVG fail closed.** The slice ships the *seam*, not the dependency —
call `configureRichtextSanitizer(DOMPurify)` once to enable rich output.
Without it, `sanitizeRichtext` strips every tag and `sanitizeSvg` returns `""`.

```ts
import DOMPurify from "dompurify";
import { configureRichtextSanitizer } from "@/features/publisher-clean-html";
configureRichtextSanitizer(DOMPurify); // browser; or a Node DOM runtime server-side
```

## Not included (host concerns)

Disk/LRU caching, async loop/media prefetch, `base.loop` / visual-component
renderers, Layer-C dynamic islands, framework token → CSS generation. Bring a
tree producer (a visual canvas or `pages-cms`); pass framework/class CSS via
`PublishOptions`.
