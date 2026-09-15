import {
  Layers,
  Workflow,
  Rocket,
  ShieldCheck,
  Wand2,
  GitBranch,
  Component,
  PackagePlus,
} from "lucide-react";

export const features = [
  {
    icon: Layers,
    title: "Vertical-Slice Architecture",
    description:
      "Each feature owns its config, page, views, components, settings, agent, and Convex mirror. Add or remove a feature by adding or removing one folder.",
  },
  {
    icon: Workflow,
    title: "Copy-First Flow",
    description:
      "Never greenfield. Every artifact comes from a proven source project (internal kitab-core, rahmanef.com, cescadesigns, notion-clone). Edit imports, ship.",
  },
  {
    icon: Component,
    title: "shadcn-only UI",
    description:
      "All components are shadcn primitives or composed from them. ResponsiveDialog, DateField, FileUpload — no raw HTML buttons or dialogs.",
  },
  {
    icon: ShieldCheck,
    title: "audit-bp Gated",
    description:
      "Best-practice auditor pulls latest Next 16 / React 19 / Convex docs via Context7 before scoring. Score ≥80 to ship.",
  },
  {
    icon: Rocket,
    title: "Dokploy in One Command",
    description:
      "si-coder skill creates the GitHub repo, pushes, configures Dokploy, sets DNS, and triggers deploy. Zero human involvement.",
  },
  {
    icon: GitBranch,
    title: "Self-hosted Convex + @convex-dev/auth",
    description:
      "No Clerk. Self-hosted Convex backend in the same docker-compose. Postgres-backed for prod.",
  },
  {
    icon: Wand2,
    title: "Auto-generated Slice Docs",
    description:
      "Per-slice DEPS.md, CONTRACT.md, STATUS.md, USAGE.md generated from imports + defineFeature config.",
  },
  {
    icon: PackagePlus,
    title: "Cookbook + Recipes",
    description:
      "8 layout variants and 8 feature drop-ins (block editor, command palette, db views, comments, ...) ready to mount.",
  },
];

export const stack = [
  { group: "Frameworks", name: "Next.js 16", url: "https://nextjs.org/docs", detail: "Default full-app renderer: App Router, React Server Components and Cache Components." },
  { group: "Frameworks", name: "React 19", url: "https://react.dev", detail: "Default component runtime for the Next.js distribution." },
  { group: "Frameworks", name: "SvelteKit 2", url: "https://svelte.dev/docs/kit", detail: "Native application framework for explicit SvelteKit scaffolds and slice distributions." },
  { group: "Frameworks", name: "Svelte 5", url: "https://svelte.dev/docs/svelte/overview", detail: "Runes, snippets and modern event syntax; no legacy Svelte syntax in new distributions." },
  { group: "Shared foundation", name: "TypeScript", url: "https://www.typescriptlang.org", detail: "Strict portable cores are shared across renderers wherever framework-neutral code is possible." },
  { group: "Shared foundation", name: "Tailwind CSS 4", url: "https://tailwindcss.com", detail: "CSS-first tokens and utility styling for both Next.js and SvelteKit hosts." },
  { group: "Shared foundation", name: "Convex", url: "https://docs.convex.dev", detail: "Backend/data layer. Slice Convex roots stay renderer-independent and install with either framework." },
  { group: "Shared foundation", name: "convex-svelte", url: "https://docs.convex.dev/client/svelte/overview", detail: "Official Svelte client adapter for reactive queries, mutations/actions and SvelteKit integration." },
  { group: "Shared foundation", name: "@convex-dev/auth", url: "https://labs.convex.dev/auth", detail: "React uses the official adapter; Svelte auth surfaces inject the framework-neutral AuthFlow instead of faking an undocumented adapter." },
  { group: "UI libraries", name: "shadcn/ui", url: "https://ui.shadcn.com", detail: "React/Next host primitives. Renderer-specific dependencies are declared per slice." },
  { group: "UI libraries", name: "Native Svelte components", url: "https://svelte.dev/docs", detail: "Svelte distributions are native .svelte surfaces over shared cores; they do not pull React shadcn by accident." },
  { group: "UI libraries", name: "Lucide", url: "https://lucide.dev", detail: "React slices use lucide-react where needed; Svelte slices use @lucide/svelte or renderer-free glyphs." },
  { group: "Package managers", name: "npm", url: "https://docs.npmjs.com", detail: "Supported for init, dependency installation, shadcn execution and slice installation." },
  { group: "Package managers", name: "Bun", url: "https://bun.sh", detail: "First-class bun.lock detection plus bun install, bun add and bunx command generation." },
  { group: "Delivery", name: "@sveltejs/adapter-node", url: "https://svelte.dev/docs/kit/adapter-node", detail: "SvelteKit production adapter used by the fresh Svelte scaffold for Node/Dokploy self-hosting." },
  { group: "Delivery", name: "Dokploy", url: "https://dokploy.com", detail: "Self-hosted production deployment target used by the reference site." },
];
