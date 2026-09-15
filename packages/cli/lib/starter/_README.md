# __APP_NAME__

Scaffolded with [`rahman-resources`](https://www.npmjs.com/package/rahman-resources) — Next.js 16 + React 19 + Convex + Tailwind CSS 4 + shadcn/ui.

## Setup

```bash
# npm
npm install --legacy-peer-deps --include=dev
npm run typecheck
npm run lint
npm run dev

# or Bun
bun install
bun run typecheck
bun run lint
bun run dev
```

Copy `.env.example` to `.env.local` when wiring Convex and other browser-visible values. The CLI records your package manager in `rr.json` and can auto-detect npm/Bun later.

## Add a slice

```bash
# React/Next default
npx rahman-resources@latest add appshell

# same project using Bun as the package manager
bunx rahman-resources@latest add appshell --package-manager bun
```

Browse the [Slices catalog](https://resource.rahmanef.com/slices) for renderer/dependency details. Canonical active slices also expose SvelteKit distributions, but full-app Next templates remain Next-specific until explicitly ported.

## Convex

Run `npx convex dev --once` or `bunx convex dev --once` after configuring your deployment. The scaffold keeps generated Convex types available for production builds and slices add their own declared backend roots.

## Hard rules

- Auth = `@convex-dev/auth` when auth is enabled.
- Use `proxy.ts`, not legacy `middleware.ts`, on Next 16.
- Keep renderer-specific UI dependencies explicit; portable slice cores stay framework-neutral.
