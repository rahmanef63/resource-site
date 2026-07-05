// Single source of truth for rr's best practice doctrine.
//
// Rendered TWO ways from the same data:
//   - <BestPracticeDocs /> at /best-practice → human-readable docs
//   - <BestPracticePrompt /> at /best-practice (AI Prompt tab) → one-shot
//     prompt you paste into Claude / ChatGPT / Cursor / etc. so the AI
//     follows rr conventions seamlessly.
//
// Edit ONE file; both surfaces refresh.
//
// Mirrors rr conventions v2 (2026-07-05). Canonical source = CLAUDE.md in
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
};

export type BestPracticeSection = {
  id: string;
  title: string;
  /** Dominant tier for the section header badge (rules may override per-rule). */
  tier?: BestPracticeTier;
  intro?: string;
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
      "The pin is intentional: rr slices must compose identically across every consumer app. \"Works on my machine\" is a lift blocker. `check:stack-pin` compares package.json against this section in CI.",
    rules: [
      {
        title: "Next.js 16 + React 19",
        tier: "P1",
        rule: "Pin Next ^16 and React ^19 in package.json. No `middleware.ts` — use `proxy.ts` at the project root.",
        why: "Next 16 deprecates middleware.ts and ships App Router + Cache Components as the default.",
        example: "// package.json\n\"next\": \"^16.0.0\",\n\"react\": \"^19.0.0\"\n",
      },
      {
        title: "Tailwind v4",
        tier: "P1",
        rule: "Use Tailwind v4 with `@tailwindcss/postcss`. Bridge a v3 config via `@config` only during migration.",
      },
      {
        title: "Convex self-hosted",
        tier: "P1",
        rule: "Use Convex self-hosted via Docker Compose on the same Dokploy node. Pin `convex` ^1.16 minimum.",
        why: "Self-hosted = zero per-user cost, full schema portability, deploy via `npx convex deploy --env-file …`.",
      },
      {
        title: "Auth = @convex-dev/auth",
        tier: "P1",
        rule: "Use `@convex-dev/auth` for sessions. NO Clerk. Custom auth slices are allowed only when @convex-dev/auth is documented as insufficient.",
      },
      {
        title: "TypeScript strict + drift guard",
        tier: "P1",
        rule: "TS strict everywhere. If package.json versions disagree with this baseline, FLAG it — don't silently adopt either side.",
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
        rule: "Consumer projects: each feature lives at `slices/<slug>/` (+ optionally `convex/features/<slug>/`). rr internal repo only: `frontend/slices/<slug>/` (preserves Next routing). Don't mix the two conventions. Per-slice shape: `components/ lib/ utils/ hooks/ config/ api/` + `types.ts` + tests + the metadata pair.",
        example:
          "slices/cta/\n  ├── components/  ├── lib/  ├── hooks/  ├── config/\n  ├── utils/  ├── api/  ├── types.ts  ├── index.ts\n  └── slice.json  slice.manifest.json",
      },
      {
        title: "Barrel-only cross-slice imports",
        tier: "P1",
        rule: "Inside a slice, imports resolve ONLY via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, or relative-within-slice. No `../../` reaching into another slice's internals.",
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
        rule: "Site demos run on the localStorage adapter, NOT Convex. `convex/features/*` in rr is copy-source for consumers. Never compose every feature into rr's own `convex/schema.ts` — that turns the library into a monolith.",
      },
    ],
  },
  {
    id: "convex",
    title: "Convex rules",
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
        rule: "Marketing/SSG pages opt into `\"use cache\"` + `cacheLife` / `cacheTag`. Enable `experimental.cacheComponents` in next.config.mjs first.",
      },
      {
        title: "runtime fs reads need outputFileTracingIncludes",
        tier: "P1",
        rule: "Runtime `fs.readdir` / `readFile` on repo dirs requires that dir in `outputFileTracingIncludes` in next.config.mjs. Works locally, silently empty in the standalone Docker image otherwise.",
      },
    ],
  },
  {
    id: "data-fetching",
    title: "Data fetching",
    tier: "P1",
    intro: "If you're reaching for `useEffect` + `fetch`/`useState`, the answer is `useQuery` or a server component.",
    rules: [
      {
        title: "Authed/dynamic pages → preloadQuery",
        tier: "P1",
        rule: "Server component calls `preloadQuery` (convex/nextjs) for first paint, passes the ref to a client component using `usePreloadedQuery` — reactive after hydration, no loading flash.",
      },
      {
        title: "Reactive client state → useQuery/useMutation",
        tier: "P1",
        rule: "After first paint, reactive client state uses `useQuery` / `useMutation` from `convex/react`.",
      },
      {
        title: "Static marketing reads → fetchQuery in \"use cache\"",
        tier: "P1",
        rule: "Static reads use `fetchQuery` inside a `\"use cache\"` component, or build-time data.",
      },
      {
        title: "Never fetch in useEffect",
        tier: "P1",
        rule: "Client mutations go through slice-local hooks (`slices/<slug>/hooks/`), never inline in JSX handlers scattered across components.",
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
        rule: "Throw `ConvexError({ code, message })` with a typed code from the slice's `types.ts` (e.g. `NOT_AUTHORIZED | NOT_FOUND | RATE_LIMITED`). Never throw raw strings; never leak internal details to clients.",
        example:
          '// DON\'T\nthrow new Error("db failed: " + JSON.stringify(user));\n\n// DO\nthrow new ConvexError({ code: "NOT_AUTHORIZED", message: "Admin role required" });',
      },
      {
        title: "Client → map code to copy, surface via toast",
        tier: "P1",
        rule: "Catch in the slice's mutation hook, map code → user copy, surface via the shared toast (sonner). Never swallow silently; never `alert()`.",
      },
      {
        title: "Route boundaries",
        tier: "P1",
        rule: "Every route group ships `error.tsx` (and `not-found.tsx` where relevant). Errors render inside the shell chrome, not a white page.",
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
        title: "Mandatory per slice",
        tier: "P1",
        rule: "(1) the barrel's exported API — the contract consumers rely on; (2) every Convex mutation/query via `convex-test`, INCLUDING the authz-denied path (unauthenticated caller must be rejected).",
      },
      {
        title: "App-level e2e stays global",
        tier: "P1",
        rule: "Playwright smoke is global (`npm run e2e` local, `e2e:staging` against staging). Slices don't own e2e. Test files are excluded from the 200-LOC cap but still obey single-responsibility.",
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
        rule: "Files: `kebab-case.ts(x)`. Component exports: `PascalCase`. Hooks: `useCamelCase`. Utils/fns: `camelCase`.",
      },
      {
        title: "Types + constants placement",
        tier: "P2",
        rule: "Per-slice types in `types.ts`; per-slice constants in `config/`. `index.ts` exists ONLY as a barrel — never put implementation in it.",
      },
      {
        title: "Convex naming",
        tier: "P2",
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
        title: "shadcn primitives only",
        tier: "P1",
        rule: "All UI builds on shadcn primitives. Never raw `<button>`, `<dialog>`, `<input type=date|file>` — use `Button`, `ResponsiveDialog`, `DateField`, `FileUpload`.",
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
      { title: "Validators + authz on Convex fns", rule: "`audit-bp` (P0 gate)" },
      { title: "Metadata pair version match", rule: "`audit:slices`" },
      { title: "Catalog scalars = generated", rule: "`gen:catalog:check` (pre-commit)" },
      { title: "Stack pin vs package.json", rule: "`check:stack-pin`" },
      { title: "Skills JSON sync", rule: "`sync-skills.mjs --check` (prepublishOnly)" },
      { title: "Types", rule: "`npx tsc --noEmit`" },
    ],
  },
];
