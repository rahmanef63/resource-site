# rahman-resources

Scaffolder + template installer for the [Rahman Resources kitab](https://github.com/rahmanef63/resource-site).

## Quick start

```bash
npx rahman-resources init my-app
cd my-app
cp .env.example .env.local         # fill NEXT_PUBLIC_CONVEX_URL
npm install --legacy-peer-deps
npx convex dev --once               # generates convex/_generated
npm run dev
```

`init` ships a minimal Next 16 + React 19 + Convex + Tailwind 4 + shadcn/ui skeleton (~18 files). Then drop in any layout/recipe/feature with `add`.

## Commands

```bash
npx rahman-resources init <app-name>             # scaffold fresh project
npx rahman-resources add <slug> [target-dir]     # drop in a layout/recipe/feature
npx rahman-resources list [layouts|recipes|features]
npx rahman-resources info <slug>
```

### Inspect a template

```bash
npx rahman-resources info personal-brand-os
```

### Install into a project

```bash
# fresh
npx rahman-resources init my-app
cd my-app && npx rahman-resources add personal-brand-os .

# existing
cd existing-app
npx rahman-resources add personal-brand-os .
```

The CLI:

1. Pulls only the folders listed for that template (via [`tiged`](https://github.com/tiged/tiged)) — no full clone.
2. Detects your package manager (`pnpm` / `yarn` / `bun` / `npm`) and installs the template's npm dependencies.
3. Prints the agent recipe: what to wire next.

## What's included

Every template ships:

- The page route(s) under `app/`
- The slice components under `components/templates/<slug>/`
- A drop-in Convex backend slice under `convex/templates/<slug>/` (where applicable)

Schema files are written to `convex/templates/<slug>/schema.ts` — merge into your existing `convex/schema.ts` or move it up.

## Templates (current)

Run `npx rahman-resources list` to see the live catalog. Highlights:

| Slug | Category | What |
|---|---|---|
| `personal-brand-os` | website-template | Public site + admin dashboard for solo brand |
| `dashboard-three-column` | dashboard | Resizable left/main/right with drawer fallback |
| `dashboard-mobile-dock` | dashboard | Native-feel mobile dock + desktop sidebar |
| `cms-public-storefront` | cms | E-commerce / blog storefront |
| `landing-*` | marketing | Hero/bento/masonry/kinetic landings |

## Updating the manifest

The manifest is generated from `site/lib/content/layouts.ts`. To regenerate:

```bash
cd packages/cli
node scripts/gen-manifest.mjs
```

`prepublishOnly` runs this automatically before `npm publish`.

## License

MIT
