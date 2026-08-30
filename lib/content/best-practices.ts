// Single source of truth for rr's best practice doctrine.

import type { BestPracticeTechId } from "./best-practice-techs";
//
// Rendered TWO ways from the same data:
//   - <BestPracticeDocs /> at /best-practice → human-readable docs
//   - <BestPracticePrompt /> at /best-practice (AI Prompt tab) → one-shot
//     prompt you paste into Claude / ChatGPT / Cursor / etc. so the AI
//     follows rr conventions seamlessly.
//
// Edit ONE file; both surfaces refresh.
//
// Mirrors rr conventions v3 (2026-08-31). Canonical source = CLAUDE.md in
// the rr repo; if this disagrees with CLAUDE.md, CLAUDE.md wins.

/** Rule tier — higher tier wins on conflict. See the "Rule tiers" section. */
export type BestPracticeTier = "P0" | "P1" | "P2";

export type BestPracticeRule = {
  /** Short label rendered in nav + as the rule title. */
  title: string;
  /** Plain-text imperative — what the rule says to do (or not do). */
  rule: string;
  /** Tier — P0 security/data, P1 architecture, P2 style. Omit for meta rows. */
  tier?: BestPracticeTier;
  /** Optional reason — why the rule exists. */
  why?: string;
  /** Optional code/config example. */
  example?: string;
  /** Rule appears only when every listed technology is active. */
  appliesTo?: BestPracticeTechId[];
};

export type BestPracticeSection = {
  id: string;
  title: string;
  /** Dominant tier for the section header badge (rules may override per-rule). */
  tier?: BestPracticeTier;
  intro?: string;
  /** Section appears only when every listed technology is active. */
  appliesTo?: BestPracticeTechId[];
  rules: BestPracticeRule[];
};

export const BEST_PRACTICES: BestPracticeSection[] = [
  {
    id: "tiers",
    title: "Rule tiers & conflict resolution",
    intro:
      "Every rule carries a tier. When two rules conflict, the higher tier wins. When you can't ask the user (autonomous run, mid-task): pick the option this doctrine recommends, add a `// TODO(rr): confirm — chose X over Y because …` marker, and continue. Never silently guess.",
    rules: [
      {
        title: "P0 — security & data integrity",
        tier: "P0",
        rule: "NEVER violate, no exceptions, no TODO escape hatch. If a P0 rule blocks the task, stop and report instead of working around it.",
      },
      {
        title: "P1 — architecture & structure",
        tier: "P1",
        rule: "Violate only when genuinely necessary. Every violation needs a `// TODO(rr): <why + what the compliant version looks like>` at the site AND a note in the commit body.",
      },
      {
        title: "P2 — style & modularity",
        tier: "P2",
        rule: "Enforced by lint/audit tooling. If the tooling passes, you pass.",
      },
    ],
  },
  {
    id: "stack",
    title: "Stack baseline",
    tier: "P1",
    intro:
      "The active profile and its reviewed versions are shown above these docs. Version facts live in best-practice-techs.ts; rules never duplicate them.",
    rules: [
      {
        title: "Next.js profile",
        tier: "P1",
        appliesTo: ["nextjs"],
        rule: "Use the reviewed Next.js + React versions from the active profile, App Router, TypeScript strict, Tailwind v4, and shadcn/ui. Upgrade security/LTS releases instead of pinning an older remembered version.",
      },
      {
        title: "Svelte profile",
        tier: "P1",
        appliesTo: ["svelte"],
        rule: "Use the reviewed Svelte 5 + SvelteKit versions from the active profile, TypeScript strict, Bun, Tailwind v4, and shadcn-svelte. New Svelte code MUST use Runes and current Svelte 5 syntax.",
      },
      {
        title: "Tailwind v4",
        tier: "P1",
        rule: "Use Tailwind v4 and theme tokens. Do not copy a legacy v3 setup unless the task is explicitly a migration.",
      },
      {
        title: "Convex profile",
        tier: "P1",
        appliesTo: ["convex"],
        rule: "Use the reviewed Convex version from the active profile. Keep backend functions framework-neutral; use the official frontend adapter for the selected framework and keep Convex functions in the framework-supported location.",
      },
      {
        title: "Next + Convex auth",
        tier: "P1",
        appliesTo: ["nextjs", "convex"],
        rule: "For rr's Next + Convex starter, use @convex-dev/auth unless a documented requirement needs another provider. Keep auth checks inside Convex handlers regardless of route protection.",
      },
      {
        title: "Svelte + Convex auth",
        tier: "P1",
        appliesTo: ["svelte", "convex"],
        rule: "Use convex-svelte setupAuth/useAuth as the integration boundary. Do not copy React auth providers into Svelte. Choose an auth adapter/provider only after checking its current Svelte support; community-maintained adapters must be labeled as such.",
      },
    ],
  },
  {
    id: "structure",
    title: "Vertical slice structure",
    tier: "P1",
    intro:
      "Every feature is a vertical slice that owns its full stack. No deep cross-slice imports — the barrel is the contract.",
    rules: [
      {
        title: "Slice layout",
        tier: "P1",
        rule: "Consumer UI features live at root `slices/<slug>/`; rr internal source stays at `frontend/slices/<slug>/`. Framework routes import the root slice barrel. Per-slice UI shape stays `components/ lib/ utils/ hooks|state/ config/ api/` + types + tests + barrel.",
        example:
          "slices/cta/\n  ├── components/  ├── lib/  ├── hooks/  ├── config/\n  ├── utils/  ├── api/  ├── types.ts  ├── index.ts\n  └── slice.json  slice.manifest.json",
      },
      {
        title: "Convex backend location follows the frontend",
        tier: "P1",
        appliesTo: ["convex"],
        rule: "Keep the root slice as the feature UI contract, but put Convex functions where the framework integration supports them: rr/Next copy-source may use `convex/features/<slug>/`; SvelteKit + convex-svelte uses `src/convex/` (configured by `convex.json`). Expose typed data adapters through the root slice instead of importing generated backend internals everywhere.",
      },
      {
        title: "Barrel-only cross-slice imports",
        tier: "P1",
        rule: "Cross-slice access goes through the target slice barrel only. Use the host alias (`@/features/<slug>` in the Next rr convention or `$features/<slug>` in the Svelte starter), shared UI/backend aliases, or relative paths within the same slice. No `../../` reaching into another slice's internals.",
        why: "Deep imports lock you into another slice's internal layout. The barrel is the contract.",
        example:
          "// DON'T — deep import into another slice\nimport { parseMention } from \"@/features/comments/lib/mention-parser\";\n\n// DO — through the barrel\nimport { parseMention } from \"@/features/comments\";",
      },
      {
        title: "Metadata PAIR (not trio)",
        tier: "P1",
        rule: "Every slice ships `slice.json` (contract folded in under the `contract` block since 2026-06-21) + `slice.manifest.json`. Version SSOT: `slice.json.version === slice.manifest.json.version`, gated by `audit:slices`. `lib/content/slices.ts` scalars are GENERATED via `gen-slice-catalog.mjs` — never hand-edit them.",
        why: "The old third file (`slice.contract.ts`) was folded into `slice.json.contract` — one SSOT, drift impossible.",
      },
      {
        title: "Props-driven portability",
        tier: "P1",
        rule: "Portable slices NEVER hardcode consumer URLs, env names, role enums, or copy. Hardcode = lift blocker.",
        example:
          "// BAD\nconst SITE = \"https://rahmanef.com\";\n\n// GOOD\nexport function HeroView({ siteUrl }: { siteUrl: string }) { … }",
      },
      {
        title: "rr backend is admin-only",
        tier: "P1",
        appliesTo: ["convex"],
        rule: "Site demos run on the localStorage adapter, NOT Convex. `convex/features/*` in rr is copy-source for consumers. Never compose every feature into rr's own `convex/schema.ts` — that turns the library into a monolith.",
      },
    ],
  },
  {
    id: "dynamic-pages",
    title: "Dynamic pages & route composition",
    tier: "P1",
    intro:
      "Routes are adapters, not feature homes. Repeated pages derive from one registry/data source instead of cloned route files.",
    rules: [
      {
        title: "Root vertical slices stay canonical",
        tier: "P1",
        rule: "Consumer feature code lives at root `slices/<slug>/`. Route files import the slice barrel and adapt route params/data; they do not become a second feature implementation.",
      },
      {
        title: "One dynamic route for one page family",
        tier: "P1",
        rule: "When multiple pages share one shape, use one dynamic route plus a registry/data SSOT. Do not create one hardcoded page file per entity.",
        example: "// Next: app/apps/[slug]/page.tsx\n// SvelteKit: src/routes/apps/[slug]/+page.svelte\n// Both resolve slug -> one registry/data source -> slice component",
      },
      {
        title: "Navigation derives from the same registry",
        tier: "P1",
        rule: "Menus, breadcrumbs, page titles, sitemap entries, permissions, and dynamic-page lookup derive from one typed registry where possible. Never maintain parallel route/nav arrays for the same facts.",
      },
      {
        title: "Thin route boundaries",
        tier: "P2",
        rule: "A route should parse params, load/authorize data, choose the slice, and render. Business logic, reusable UI, and mutations stay inside the vertical slice/backend boundary.",
      },
    ],
  },
  {
    id: "convex",
    title: "Convex rules",
    appliesTo: ["convex"],
    rules: [
      {
        title: "Validators on every public function",
        tier: "P0",
        rule: "Every `mutation()` / `query()` reachable from the client MUST declare `args:` with `v.*` validators.",
        why: "Without them, anything goes from a crafted client. audit-bp marks missing validators as P0.",
        example:
          '// DO\nexport const setRole = mutation({\n  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("member")) },\n  handler: async (ctx, args) => { /* … */ },\n});',
      },
      {
        title: "Server-side authz inside every handler",
        tier: "P0",
        rule: "Call `requireUser` / `requireAdmin` from `convex/_shared/auth.ts` as the FIRST line of the handler. Route-layer gates do not protect Convex HTTP endpoints.",
        why: "Convex HTTP queries are directly reachable — Next.js layout gates don't protect them.",
        example:
          "// DO\nhandler: async (ctx, args) => {\n  await requireAdmin(ctx);\n  await ctx.db.patch(args.id, { role: args.role });\n}",
      },
      {
        title: "No bare .collect(); index every filtered/ordered query",
        tier: "P1",
        rule: "`ctx.db.query(...).collect()` scans the table. Use `.withIndex(...).take(N)` or paginate; add the index in `defineTable(…).index(…)`. Exception: tiny bounded config tables (< ~50 rows) may `.collect()` with a `// TODO(rr): bounded table` marker.",
        why: "Bare collects bypass query-budget guardrails and degrade as the table grows.",
        example: `// BAD\nawait ctx.db.query("posts").collect();\n\n// GOOD\nawait ctx.db.query("posts").withIndex("by_author", q => q.eq("authorId", args.authorId)).take(50);`,
      },
    ],
  },
  {
    id: "next-app",
    title: "Next.js rules",
    appliesTo: ["nextjs"],
    rules: [
      {
        title: "NEXT_PUBLIC_ only for non-sensitive values",
        tier: "P0",
        rule: "Any value prefixed `NEXT_PUBLIC_` ships in the client bundle. Never put secrets, API keys, or admin emails there.",
      },
      {
        title: "Server Actions verify the caller",
        tier: "P0",
        rule: "Every `'use server'` export authenticates AND authorizes before mutating. Treat them as public API endpoints.",
      },
      {
        title: "proxy.ts not middleware.ts",
        tier: "P1",
        rule: "Next 16 renamed middleware to proxy. Put logic in `proxy.ts` at the project root.",
      },
      {
        title: "next/link + next/image only",
        tier: "P1",
        rule: "Never use `<a href=\"/internal\">` or `<img src=…>`. Use `<Link>` / `<Image>` so Next can prefetch + optimise.",
      },
      {
        title: "Cache Components for static reads",
        tier: "P1",
        rule: "Use Cache Components when explicit caching helps: set `cacheComponents: true`, then apply `\"use cache\"` with `cacheLife` / `cacheTag` at the correct boundary. Do not use the old `experimental.cacheComponents` flag.",
      },
      {
        title: "runtime fs reads need outputFileTracingIncludes",
        tier: "P1",
        rule: "Runtime `fs.readdir` / `readFile` on repo dirs requires that dir in `outputFileTracingIncludes` in next.config.mjs. Works locally, silently empty in the standalone Docker image otherwise.",
      },
    ],
  },
  {
    id: "svelte-app",
    title: "Svelte 5 / SvelteKit rules",
    appliesTo: ["svelte"],
    rules: [
      {
        title: "Runes for all new reactivity",
        tier: "P1",
        rule: "Use `$state`, `$derived` / `$derived.by`, `$effect` only for genuine side effects, `$props`, and `$bindable` only for intentional two-way binding. Do not generate legacy `$:` or `export let` in new code.",
      },
      {
        title: "Modern events and snippets",
        tier: "P1",
        rule: "Use event attributes (`onclick`, `oninput`, `onsubmit`) and callback props. Use snippets + `{@render ...}` instead of legacy `<slot>`; do not reach for `createEventDispatcher` for new components.",
      },
      {
        title: "Bun is the package manager",
        tier: "P1",
        rule: "Use `bun install`, `bun add`, `bunx`, and `bun run`. Commit `bun.lock`; do not create npm/pnpm/yarn lockfiles in the Svelte starter.",
      },
      {
        title: "Svelte AI tooling is part of verification",
        tier: "P1",
        rule: "When AI edits `.svelte` files, consult current official Svelte docs and use the Svelte MCP/AI tooling or autofixer when available. Do not trust remembered pre-Runes syntax.",
      },
      {
        title: "SvelteKit routes stay thin",
        tier: "P1",
        rule: "Keep `src/routes/**/+page(.server).ts` and `+page.svelte` as route/data adapters. Reusable feature code remains in root vertical slices and is imported through their barrels.",
      },
    ],
  },
  {
    id: "data-fetching",
    title: "Data fetching",
    tier: "P1",
    intro: "Server data should flow through the framework/backend integration, not lifecycle-effect synchronization.",
    rules: [
      {
        title: "Next + Convex dynamic first paint",
        tier: "P1",
        appliesTo: ["nextjs", "convex"],
        rule: "For authed/dynamic first paint, use the current Convex Next.js server helpers (for example preloadQuery/fetchQuery where appropriate) and hand the typed result/reference to the client boundary. Keep reactive reads on the Convex client after hydration.",
      },
      {
        title: "Next + Convex reactive client data",
        tier: "P1",
        appliesTo: ["nextjs", "convex"],
        rule: "Reactive client reads/writes use Convex React hooks through slice-local data adapters/hooks. Do not mirror a Convex subscription into useState via useEffect.",
      },
      {
        title: "Svelte + Convex reactive client data",
        tier: "P1",
        appliesTo: ["svelte", "convex"],
        rule: "Use `useQuery` / mutation/action helpers from `convex-svelte`. `useQuery` is already reactive — do not wrap it in `$derived` merely to make it reactive again.",
      },
      {
        title: "Svelte + Convex SSR",
        tier: "P1",
        appliesTo: ["svelte", "convex"],
        rule: "Use convex-svelte's current SvelteKit SSR helpers only when SSR materially improves the route. Keep the client subscription as the realtime continuation after hydration.",
      },
      {
        title: "No lifecycle fetch synchronization",
        tier: "P1",
        rule: "Do not use React `useEffect` or Svelte `$effect` as a default data-fetch mechanism. Use the framework loader/server boundary or reactive backend adapter; effects are for external side effects, not derived state.",
      },
    ],
  },
  {
    id: "error-handling",
    title: "Error handling & logging",
    tier: "P1",
    rules: [
      {
        title: "Convex → typed ConvexError",
        tier: "P1",
        appliesTo: ["convex"],
        rule: "Throw `ConvexError({ code, message })` with a typed code from the slice's `types.ts` (e.g. `NOT_AUTHORIZED | NOT_FOUND | RATE_LIMITED`). Never throw raw strings; never leak internal details to clients.",
        example:
          '// DON\'T\nthrow new Error("db failed: " + JSON.stringify(user));\n\n// DO\nthrow new ConvexError({ code: "NOT_AUTHORIZED", message: "Admin role required" });',
      },
      {
        title: "Client → map code to copy, surface via toast",
        tier: "P1",
        rule: "Catch at the slice's data/action adapter, map typed error codes to user copy, and surface them through the shared feedback/toast primitive. Never swallow silently; never use blocking `alert()` as product UX.",
      },
      {
        title: "Route boundaries",
        tier: "P1",
        appliesTo: ["nextjs"],
        rule: "Every relevant Next route group ships `error.tsx` (and `not-found.tsx` where relevant). Errors render inside the shell chrome, not a white page.",
      },
      {
        title: "SvelteKit route boundaries",
        tier: "P1",
        appliesTo: ["svelte"],
        rule: "Use SvelteKit `+error.svelte` / load error handling at the appropriate route boundary. Keep product chrome intact and do not turn recoverable feature errors into an unstyled page.",
      },
      {
        title: "Logging",
        tier: "P1",
        rule: "Server-side `console.error(\"[<slice>:<fn>]\", err)` with a context prefix. No PII in logs. No `console.log` left in shipped client code.",
      },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    tier: "P1",
    intro: "A slice's tests travel with it when copied — co-locate them.",
    rules: [
      {
        title: "Co-located per slice",
        tier: "P1",
        rule: "Unit/component tests live inside the slice — `slices/<slug>/__tests__/` or `<file>.test.ts(x)` next to the source.",
      },
      {
        title: "Mandatory slice contract tests",
        tier: "P1",
        rule: "Test the barrel's exported API and the critical user-visible state transitions the consumer relies on. Query by accessible behavior, not snapshots alone.",
      },
      {
        title: "Mandatory Convex handler tests",
        tier: "P1",
        appliesTo: ["convex"],
        rule: "Test every security-sensitive Convex query/mutation, including unauthenticated and wrong-owner denial paths. Use convex-test where it fits the deployed function shape.",
      },
      {
        title: "App-level e2e stays global",
        tier: "P1",
        rule: "Playwright smoke is app-level, not slice-owned. Run it with the project package runner (`npm run` in rr/Next today; `bun run` in the Svelte starter). Test files are excluded from the 200-LOC cap but still obey single-responsibility.",
      },
    ],
  },
  {
    id: "modularity",
    title: "File modularity",
    tier: "P2",
    intro:
      "Files are read more than written. Keep them small, single-purpose, composable so consumers grok + reuse + replace pieces without reading the whole thing. Tooling-enforced.",
    rules: [
      {
        title: "≤200 lines per source file",
        tier: "P2",
        rule: "Hard cap enforced by `audit:file-size` + eslint `max-lines`. Exclusions: pure data exports (`lib/content/*.ts`, `*/seed.ts`, theme presets), `_generated/`, test files, and `components/ui/*` (vendored shadcn — never edit, never count; customize by wrapping in `shared/` or slice components, or regenerate via the shadcn CLI).",
        why: "Large files hide concerns, resist diff review, force consumers to scroll instead of compose.",
        example: "// BAD: 400-line PostEditor.tsx (toolbar + body + sidebar + status)\n// GOOD: PostEditor.tsx (≤200) composes <Toolbar/> + <EditorBody/> + <SidebarMeta/> + <StatusPanel/>",
      },
      {
        title: "Single responsibility per file",
        tier: "P2",
        rule: "One default export OR one cohesive named-export cluster per file. Prefixed exports (`createX`, `parseX`, `serializeX`, `validateX`) = 4 files, not 4 exports.",
      },
      {
        title: "Extract on the SECOND occurrence",
        tier: "P2",
        rule: "Repeated UI pattern → `components/` or `shared/`. Util needed by two slices → `shared/<name>/utils/`. Not the third copy — the second.",
      },
      {
        title: "Dynamic over hardcoded",
        tier: "P2",
        rule: "Lookup maps over if/switch-chains; derived selectors over literal arrays; `labels` props over inline copy.",
        example: "// BAD\nif (kind === 'admin') return <AdminLink/>;\nif (kind === 'user') return <UserLink/>;\n\n// GOOD\nconst LINKS = { admin: AdminLink, user: UserLink };\nconst L = LINKS[kind];\nreturn <L/>;",
      },
      {
        title: "Compose, don't accumulate",
        tier: "P2",
        rule: "Prefer a new file that composes with the existing one over editing the existing one bigger. Existing file stays small + tested; the new file is the one that changes.",
      },
    ],
  },
  {
    id: "naming",
    title: "Naming",
    tier: "P2",
    rules: [
      {
        title: "File + export casing",
        tier: "P2",
        rule: "Files use kebab-case (`.ts`, `.tsx`, `.svelte` as appropriate). Component exports are PascalCase. React hooks use `useCamelCase`; Svelte state/helpers use descriptive camelCase names rather than fake React-hook naming. Utils/functions use camelCase.",
      },
      {
        title: "Types + constants placement",
        tier: "P2",
        rule: "Per-slice types in `types.ts`; per-slice constants in `config/`. `index.ts` exists ONLY as a barrel — never put implementation in it.",
      },
      {
        title: "Convex naming",
        tier: "P2",
        appliesTo: ["convex"],
        rule: "Table names plural camel (`posts`, `auditLogs`); indexes `by_<field>`.",
      },
    ],
  },
  {
    id: "ui",
    title: "UI rules",
    tier: "P1",
    rules: [
      {
        title: "shadcn-family primitives first",
        tier: "P1",
        rule: "Build shared product UI from the active framework's shadcn port (shadcn/ui for React, shadcn-svelte for Svelte) and composed wrappers. Use native semantics where they are the correct accessible primitive; do not hand-roll a second design-system primitive.",
      },
      {
        title: "Theme tokens, not hex",
        tier: "P1",
        rule: "Use `bg-background` / `text-foreground` / `border-border`. Semantic status colors resolve through the tones SSOT (`_shared/.../ui/tones.ts`) — never invent a local green-means-success.",
      },
      {
        title: "Mobile-first responsive",
        tier: "P1",
        rule: "Single column base, layer `md:` / `lg:` upward.",
      },
      {
        title: "No marketing chrome on workspace surfaces",
        tier: "P1",
        rule: "Workspace templates render full-bleed (`h-dvh`) — the workspace IS the product.",
      },
      {
        title: "Shell hierarchy: exactly one outer chrome",
        tier: "P1",
        rule: "dashboard-shell owns admin/workspace chrome; admin-panel / admin / platform-admin mount INSIDE it. Never nest two chromes.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery rules",
    tier: "P1",
    rules: [
      {
        title: "Solo-dev = push direct to main",
        tier: "P1",
        rule: "Tests + typecheck + validate green → push direct to main. No PRs. Dokploy auto-deploys. Risky changes go to staging first: `git push origin main:staging` → verify `e2e:staging` → then main.",
        why: "PRs add ceremony without review benefit when the solo dev is also the reviewer.",
      },
      {
        title: "Conventional commits",
        tier: "P1",
        rule: "`feat(scope): subject` / `fix` / `chore`. Body explains WHY and lists any P1 deviations (`TODO(rr)` markers added this commit).",
      },
      {
        title: "Co-author the AI",
        tier: "P1",
        rule: "End AI-assisted commits with `Co-Authored-By: Claude <noreply@anthropic.com>` so authorship is honest.",
      },
      {
        title: "Publish guardrail",
        tier: "P0",
        rule: "NEVER run `npm publish` yourself. When publish conditions hold (packages/ modified + version bumped above `npm view` + tsc green + pushed to main), end your response with the publish suggestion and let the user run the OTP step.",
      },
      {
        title: "No GitHub Actions cloud minutes",
        tier: "P1",
        rule: "Local CI via the pre-push hook or `/sc-git ci`; Dokploy builds on push.",
      },
    ],
  },
  {
    id: "copy-first",
    title: "Copy-first & Source Map",
    tier: "P1",
    rules: [
      {
        title: "Never greenfield what a proven source solved",
        tier: "P1",
        rule: "Check the Source Map in CLAUDE.md first; `cp -r` → adjust import aliases → strip business-specific bits.",
      },
      {
        title: "Missing source path → STOP and ask",
        tier: "P1",
        rule: "Source Map paths are machine-local (`~/projects/...`). If a source path doesn't exist on this machine, STOP and ask — don't reconstruct from memory; that defeats copy-first.",
      },
    ],
  },
  {
    id: "rr-distribution-kinds",
    title: "rr distribution kinds (TEMPLATE vs SLICE)",
    tier: "P1",
    intro:
      "rr publishes TWO installable kinds. They install to different paths and answer different needs — confusing them is the #1 support issue.",
    rules: [
      {
        title: "TEMPLATE = full-app scaffold",
        tier: "P1",
        rule: "A TEMPLATE (catalog: `lib/content/layouts.ts`) is a whole-app starter. Install `npx rr add <template-slug>` — defaults to `--at root` (routes promoted to `app/(public)/` + `app/admin/`, `/preview/<slug>` constants auto-rewritten). `--at preview` only for sandbox demos.",
        why: "Templates do NOT ship slice metadata — they're monolithic scaffolds you fork.",
      },
      {
        title: "SLICE = drop-in vertical feature",
        tier: "P1",
        rule: "A SLICE (catalog: `lib/content/slices.ts`) is one self-contained feature. `npx rr add <slice-slug>` copies into `slices/<slug>/` (+ optional `convex/features/<slug>/`) with the metadata pair. Variants: `add <slug> <variant>` flattens one; `add <slug>` copies all + switcher prop.",
        why: "The metadata pair is what makes a slice composable + auditable.",
      },
      {
        title: "Trust the CLI banner",
        tier: "P1",
        rule: "CLI prints `[TEMPLATE]` or `[SLICE]`. Wrong banner = wrong slug.",
      },
      {
        title: "Lift = sanitize first (slice path only)",
        tier: "P1",
        rule: "Strip consumer URLs, env names, role enums, table coupling → replace with props / env-configured allowlists. `npx rr lift` is operator-manual.",
      },
      {
        title: "MCP connectors via create-your-mcp",
        tier: "P1",
        rule: "Add ChatGPT / Claude / Cursor connector support via `npx rr add create-your-mcp` — never hand-roll OAuth/PKCE.",
      },
    ],
  },
  {
    id: "enforcement",
    title: "Enforcement map",
    intro:
      "What tooling guards each rule. If a rule has no tooling row, the prompt is its only guard — treat it as P1.",
    rules: [
      { title: "≤200 LOC", rule: "`audit:file-size` + eslint `max-lines`" },
      { title: "Barrel-only imports", rule: "eslint `no-restricted-imports` / boundaries + `audit:slices`" },
      { title: "No raw `<a>` / `<img>` / `<button>`", rule: "eslint `no-restricted-syntax`" },
      { title: "Validators + authz on Convex fns", rule: "`audit-bp` (P0 gate)", appliesTo: ["convex"] },
      { title: "Metadata pair version match", rule: "`audit:slices`" },
      { title: "Catalog scalars = generated", rule: "`gen:catalog:check` (pre-commit)" },
      { title: "Profile versions + docs freshness", rule: "`best-practice-techs.ts` SSOT + profile tests" },
      { title: "Skills JSON sync", rule: "`sync-skills.mjs --check` (prepublishOnly)" },
      { title: "Types", rule: "framework checker (`tsc` for Next; `svelte-check` for Svelte)" },
    ],
  },
];
