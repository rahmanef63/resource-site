# marketing-chrome

Config-driven marketing site **header + footer**. React/Next remains the default
adapter; Svelte 5/SvelteKit is additive. Both adapters reuse one framework-neutral
chrome core for nav/CTA/footer/social/layout semantics and the same agentic
`marketing-chrome.configure` tool.

```bash
npx rr add marketing-chrome
npx rr add marketing-chrome --framework sveltekit
```

## Surface

| Surface | React default | Svelte adapter |
|---|---|---|
| Header | `MarketingHeader` + shadcn Sheet/Button | `MarketingHeader.svelte` + native modal mobile menu |
| Footer | `MarketingFooter` + Lucide neutral social icons | `MarketingFooter.svelte` + dependency-free social abbreviations |
| Brand logo | `React.ReactNode` | Svelte snippet |
| Shared data | `BrandBase`, nav, CTA, columns, legal, social, layouts | exact same `lib/core.ts` |
| Agent tool | `marketing-chrome.configure` | exact same `lib/tools.ts` |

### Header layouts

- `split` — brand left, inline nav + CTAs right.
- `centered` — brand row above centered nav / CTA row.
- `minimal` — brand + CTAs only; mobile menu omits nav.
- `sticky` pins the bar with `sticky top-0 z-40`.
- External nav links get `target="_blank" rel="noreferrer noopener"` from one shared helper.
- Secondary CTA is always ordered before primary CTA.

### Footer layouts

- `columns` — brand/social + link columns + legal bar.
- `slim` — brand + legal/copyright + social in one responsive row.
- Social links always open in a new tab with `noopener noreferrer`.

## Framework boundary

The portable `BrandBase` contains only `name` and optional `href`. Render-node
logos intentionally stay framework-native: React adds `logo?: React.ReactNode`;
Svelte accepts a logo snippet. This prevents React types from leaking into the
shared contract.

No Convex or env vars are required. The React default keeps shadcn + Lucide;
the Svelte distribution requires only `svelte@^5` and uses no React, Next,
Lucide, or shadcn dependency.

Public preview: https://resource.rahmanef.com/preview/slices/marketing-chrome
