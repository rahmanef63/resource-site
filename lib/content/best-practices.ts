// Single source of truth for rr's best practice doctrine.
//
// Rendered TWO ways from the same data:
//   - <BestPracticeDocs /> at /best-practice → human-readable docs
//   - <BestPracticePrompt /> at /best-practice (AI Prompt tab) → one-shot
//     prompt you paste into Claude / ChatGPT / Cursor / etc. so the AI
//     follows rr conventions seamlessly.
//
// Edit ONE file; both surfaces refresh.

export type BestPracticeRule = {
  /** Short label rendered in nav + as the rule title. */
  title: string;
  /** Plain-text imperative — what the rule says to do (or not do). */
  rule: string;
  /** Optional reason — why the rule exists. */
  why?: string;
  /** Optional code/config example. */
  example?: string;
};

export type BestPracticeSection = {
  id: string;
  title: string;
  intro?: string;
  rules: BestPracticeRule[];
};

export const BEST_PRACTICES: BestPracticeSection[] = [
  {
    id: "stack",
    title: "Stack baseline",
    intro:
      "Every rr-based app targets the same modern Next + React + Convex baseline. Drift = compatibility risk for the rr slice catalog.",
    rules: [
      {
        title: "Next.js 16 + React 19",
        rule: "Pin Next ^16 and React ^19 in package.json. No `middleware.ts` — use `proxy.ts` instead.",
        why: "Next 16 deprecates middleware.ts and ships App Router + Cache Components as the default.",
        example: "// package.json\n\"next\": \"^16.0.0\",\n\"react\": \"^19.0.0\"\n",
      },
      {
        title: "Tailwind v4",
        rule: "Use Tailwind v4 with `@tailwindcss/postcss`. Bridge a v3 config via `@config` only during migration.",
      },
      {
        title: "Convex self-hosted",
        rule: "Use Convex self-hosted via Docker Compose on the same Dokploy node. Pin `convex` ^1.16 minimum.",
        why: "Self-hosted = zero per-user cost, full schema portability, deploy via `npx convex deploy --env-file …`.",
      },
      {
        title: "Auth = @convex-dev/auth",
        rule: "Use `@convex-dev/auth` for sessions. NO Clerk. Custom auth slices are allowed only when @convex-dev/auth is documented as insufficient.",
      },
    ],
  },
  {
    id: "structure",
    title: "Vertical slice structure",
    intro:
      "Every feature is a vertical slice that owns its full stack. No deep cross-slice imports.",
    rules: [
      {
        title: "Slice layout",
        rule: "Each feature lives at `frontend/slices/<slug>/` (UI + types) + optionally `convex/features/<slug>/` (schema + queries + mutations).",
        example:
          "frontend/slices/cta/\n  ├── components/  ├── lib/  ├── views/\n  ├── config.ts   ├── index.ts\n  └── slice.json  slice.contract.ts  slice.manifest.json",
      },
      {
        title: "Barrel-only cross-slice imports",
        rule: "Other slices import via `@/features/<own-slug>` only. Never reach into `@/features/foo/lib/internal-thing.ts`.",
        why: "Deep imports lock you into another slice's internal layout. Barrels are the contract.",
      },
      {
        title: "Slice metadata trio",
        rule: "Every slice ships `slice.json` (schema-validated metadata), `slice.contract.ts` (typed DSL), and `slice.manifest.json` (CLI distribution payload).",
      },
      {
        title: "Props-driven portability",
        rule: "Portable slices NEVER hardcode consumer-specific URLs, env names, or copy. Hardcode = lift blocker.",
        example:
          "// BAD\nconst SITE = \"https://rahmanef.com\";\n\n// GOOD\nexport function HeroView({ siteUrl }: { siteUrl: string }) { … }",
      },
    ],
  },
  {
    id: "convex",
    title: "Convex rules",
    rules: [
      {
        title: "Always validate public mutation/query args",
        rule: "Every `mutation()` / `query()` reachable from the client must declare `args:` with `v.*` validators.",
        why: "Convex's audit-bp marks missing validators as P0 — anything goes from a crafted client without them.",
      },
      {
        title: "No bare .collect()",
        rule: "`ctx.db.query(...).collect()` scans the table. Use `.withIndex(...).take(N)` or paginate.",
        why: "Bare collects bypass the query-budget guardrails and degrade as the table grows.",
        example: `// BAD\nawait ctx.db.query("posts").collect();\n\n// GOOD\nawait ctx.db.query("posts").withIndex("by_createdAt").order("desc").take(50);`,
      },
      {
        title: "Server-side authz on every mutation",
        rule: "Call `requireUser` / `requireAdmin` from `convex/_shared/auth.ts` inside the handler. Never trust route-layer gates alone.",
        why: "Convex HTTP queries are directly reachable — Next.js layout gates don't protect them.",
      },
      {
        title: "Use indexes",
        rule: "Every query that filters or orders should use `.withIndex(...)`. Add the index in the schema's `defineTable(…).index(…)`.",
      },
    ],
  },
  {
    id: "next-app",
    title: "Next.js app rules",
    rules: [
      {
        title: "proxy.ts not middleware.ts",
        rule: "Next 16 renamed middleware to proxy. Move logic to `proxy.ts` at the project root.",
      },
      {
        title: "next/link + next/image only",
        rule: "Never use `<a href=\"/internal\">` or `<img src=…>`. Use `<Link>` / `<Image>` so Next can prefetch + optimise.",
      },
      {
        title: "NEXT_PUBLIC_ only for non-sensitive values",
        rule: "Any value prefixed `NEXT_PUBLIC_` is exposed in the client bundle. Never put secrets, API keys, or admin emails there.",
      },
      {
        title: "Cache Components for static reads",
        rule: "SSG marketing pages should opt into Cache Components via `\"use cache\"` + `cacheLife` / `cacheTag`. Enable `experimental.cacheComponents` in next.config.mjs first.",
      },
      {
        title: "Server Actions require authn + authz",
        rule: "`'use server'` exports MUST verify the caller before mutating state. Treat them like public API endpoints.",
      },
    ],
  },
  {
    id: "modularity",
    title: "File modularity",
    intro:
      "Files are read more than written. Keep them small, single-purpose, and composable so consumers can grok + reuse + replace pieces without reading the whole thing.",
    rules: [
      {
        title: "Max 200 lines per file",
        rule: "Hard cap: no source file may exceed 200 lines (excl. pure data exports like `lib/content/*.ts` catalog arrays, `*/seed.ts`, theme presets, and `_generated/`). If a component, route, or module is approaching the cap, split before shipping. Audit gate: `audit:file-size`.",
        why: "Large files hide concerns, resist diff review, force consumers to scroll instead of compose. The cap forces extraction of reusable pieces — composition over accumulation.",
        example: "// BAD: 400-line PostEditor.tsx with toolbar + body + sidebar + status panel\n// GOOD: PostEditor.tsx (≤200) composes <Toolbar/> + <EditorBody/> + <SidebarMeta/> + <StatusPanel/> from neighbour files",
      },
      {
        title: "Single responsibility per file",
        rule: "One default export OR one cohesive cluster of named exports per file. If you find yourself prefixing exports (`createX`, `parseX`, `serializeX`, `validateX`) — those are 4 files, not 4 exports.",
        why: "Single-responsibility files are testable in isolation, replaceable without ripple, and reusable without context.",
      },
      {
        title: "Extract reusable, don't inline twice",
        rule: "If a UI pattern (filter pills, status badge, picker grid) repeats — extract to `components/` or `shared/`. If two slices need the same util — promote to `shared/<name>/utils/`.",
        why: "Duplication compounds: the third copy is where bug-fix divergence starts. Extract on the SECOND occurrence, not the third.",
      },
      {
        title: "Dynamic over hardcoded",
        rule: "Prefer config-driven + props-driven code. Replace switch/if-chains with lookup maps. Replace literal arrays with derived selectors. Replace inline copy with `labels` props.",
        why: "Dynamic code adapts when the consumer customizes; hardcoded code forces them to fork.",
        example: "// BAD\nif (kind === 'admin') return <AdminLink/>;\nif (kind === 'user') return <UserLink/>;\n\n// GOOD\nconst LINKS = { admin: AdminLink, user: UserLink };\nconst Link = LINKS[kind];\nreturn <Link/>;",
      },
      {
        title: "Compose, don't accumulate",
        rule: "When adding a feature, ask: can I add a new file that COMPOSES with the existing one, instead of editing the existing one bigger?",
        why: "Open-closed principle in practice. Existing file stays small + tested; new file is the one that changes.",
      },
    ],
  },
  {
    id: "ui",
    title: "UI rules",
    rules: [
      {
        title: "shadcn primitives only",
        rule: "All UI builds on shadcn primitives. Never use raw `<button>`, `<dialog>`, `<input type=date|file>` directly — wrap with `ResponsiveDialog`, `DateField`, `FileUpload`.",
      },
      {
        title: "Theme tokens, not hex",
        rule: "Use `bg-background` / `text-foreground` / `border-border` etc. Tailwind theme tokens make preset swaps work.",
      },
      {
        title: "Mobile-first responsive",
        rule: "Layout breakpoints climb up — start at single-column on mobile, layer `md:` / `lg:` modifiers.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery rules",
    rules: [
      {
        title: "Solo-dev = push direct to main",
        rule: "When tests/typecheck/validate are green, push direct to main. NO PRs for solo work. Dokploy auto-deploys on push.",
        why: "PRs add ceremony without review benefit when the solo dev is also the reviewer.",
      },
      {
        title: "Conventional commits",
        rule: "`feat(scope): subject` / `fix(scope): subject` / `chore(scope): subject`. Body explains the WHY.",
      },
      {
        title: "Co-author the AI",
        rule: "End every AI-assisted commit message with `Co-Authored-By: Claude … <noreply@anthropic.com>` so authorship is honest.",
      },
      {
        title: "Self-hosted runner / Dokploy webhook",
        rule: "No GitHub Actions cloud minutes. Local CI via pre-push hook or `/sc-git ci`; Dokploy auto-builds on push.",
      },
    ],
  },
  {
    id: "rr-distribution-kinds",
    title: "rr distribution kinds (TEMPLATE vs SLICE)",
    intro:
      "rr publishes TWO different installable kinds. They install to different paths and answer different needs — confusing them is the #1 source of \"the output looks nothing like the docs\" reports.",
    rules: [
      {
        title: "TEMPLATE = full-app scaffold",
        rule: "A TEMPLATE (catalog: `lib/content/layouts.ts`, e.g. `personal-brand-os`, `agency-studio-os`) is a whole-app starter — public marketing routes + admin dashboard + Convex schema. Install with `npx rr add <template-slug>` (defaults to `--at root` → routes promoted to `app/(public)/` + `app/admin/`, hardcoded `/preview/<slug>` path constants in nav-config/site-config/robots/sitemap auto-rewritten). Pass `--at preview` only for sandbox demos that keep the `/preview/<slug>` URL prefix.",
        why: "Templates are NOT vertical slices — they don't ship `slice.json` + `slice.contract.ts` + `slice.manifest.json`. They're monolithic scaffolds you fork and customize.",
      },
      {
        title: "SLICE = drop-in vertical feature",
        rule: "A SLICE (catalog: `lib/content/slices.ts`, e.g. `comments`, `doku-payment`, `ai-chat`) is one self-contained feature. Install with `npx rr add <slice-slug>` — CLI copies files into `frontend/slices/<slug>/` + (optionally) `convex/features/<slug>/`. Each slice ships the metadata trio (`slice.json` + `slice.contract.ts` + `slice.manifest.json`) and is props-driven so it composes with the rest of your app.",
        why: "Slices are mix-and-match. The trio is what makes a slice composable — without it the CLI can't audit dep peers, env, RBAC scopes, or table collisions.",
      },
      {
        title: "Adopt = npx rr add <slug>",
        rule: "CLI auto-detects kind via catalog lookup and prints `[TEMPLATE]` or `[SLICE]` in the banner. Trust the banner — if you expected a slice and got `[TEMPLATE]`, you used the wrong slug.",
      },
      {
        title: "Lift = sanitize first",
        rule: "Before pushing UP to rr (slice path only), strip consumer-specific URLs, env names, role enums, and table coupling. Replace with props or env-configured allowlists.",
      },
      {
        title: "Catalog entry + metadata trio is mandatory (slices)",
        rule: "New slice in rr needs: catalog entry in `lib/content/slices.ts` + `slice.json` + `slice.contract.ts` + `slice.manifest.json`. Validate with `npm run validate:all` (chain includes `audit:slices` + `audit:templates`).",
      },
      {
        title: "MCP integration via create-your-mcp slice",
        rule: "Add ChatGPT / Claude / Cursor connector support via `npx rr add create-your-mcp` — DON'T roll your own OAuth/PKCE.",
      },
    ],
  },
];
