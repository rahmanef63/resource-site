# Marketing Chrome — Svelte 5 / SvelteKit

Native Svelte header + footer adapter for the canonical `marketing-chrome` slice.
React/Next stays the default distribution; both adapters reuse the same portable
nav/CTA/footer/social/layout contracts and the same agentic configure tool.

```bash
npx rr add marketing-chrome --framework sveltekit
```

## Surface

- `MarketingHeader.svelte`: split / centered / minimal layouts, optional sticky bar, native `<dialog>` mobile menu, secure external nav attrs, secondary→primary CTA order, and close-after-navigation.
- `MarketingFooter.svelte`: columns / slim layouts, social links, legal links, copyright, and framework-native brand logo snippets.
- Shared canonical `core.ts`: data contracts + `externalLinkAttrs`, `headerShowsInlineNav`, `orderedCtas`, `SOCIAL_TEXT`.
- Shared canonical `tools.ts`: `marketing-chrome.configure` host merge-patch seam.

The Svelte distribution has no React, Next, Lucide, or shadcn dependency. `brand.logo`
may be a Svelte snippet; the portable shared brand contract itself only owns `name`
and optional `href` so framework-specific render nodes never leak into the core.
