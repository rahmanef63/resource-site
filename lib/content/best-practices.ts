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
    id: "rr-slice-flow",
    title: "Working with rr slices",
    rules: [
      {
        title: "Adopt = npx rr add <slug>",
        rule: "Pull a slice into your project with `npx rr add <slug>`. CLI copies files into `slices/<slug>/` (you own them).",
      },
      {
        title: "Lift = sanitize first",
        rule: "Before pushing UP to rr, strip consumer-specific URLs, env names, role enums, and table coupling. Replace with props or env-configured allowlists.",
      },
      {
        title: "Catalog entry + metadata trio is mandatory",
        rule: "New slice in rr needs: catalog entry in `lib/content/slices.ts` + `slice.json` + `slice.contract.ts` + `slice.manifest.json`. Validate with `npm run validate:all`.",
      },
      {
        title: "MCP integration via create-your-mcp slice",
        rule: "Add ChatGPT / Claude / Cursor connector support via `npx rr add create-your-mcp` — DON'T roll your own OAuth/PKCE.",
      },
    ],
  },
];
