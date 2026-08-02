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
  { name: "Next.js 16", url: "https://nextjs.org/docs" },
  { name: "React 19", url: "https://react.dev" },
  { name: "TypeScript 5.6", url: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS 4", url: "https://tailwindcss.com" },
  { name: "shadcn/ui", url: "https://ui.shadcn.com" },
  { name: "Convex (self-hosted)", url: "https://docs.convex.dev/self-hosting" },
  { name: "@convex-dev/auth", url: "https://labs.convex.dev/auth" },
  { name: "Dokploy", url: "https://dokploy.com" },
  { name: "Radix UI", url: "https://www.radix-ui.com" },
  { name: "Lucide Icons", url: "https://lucide.dev" },
];
