import { CodeBlock } from "@/components/site/code-block";
import { RepoLink } from "@/components/site/repo-link";

export const metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  const tree = `resources/
├── template-base/        # canonical copy-from template (lean)
│   ├── app/              # Next.js App Router (route groups: marketing, content, cms, dashboard, admin)
│   ├── frontend/
│   │   ├── slices/       # vertical features (each owns config, page, views, components, settings, agent, types, docs)
│   │   │   └── notion/   # nested slice (slice-of-slices)
│   │   └── shared/       # cross-feature: ui (3-col layout, dashboard shell, sidebar, header, motion), foundation, theme
│   ├── convex/
│   │   ├── features/     # backend mirror per slice
│   │   ├── shared/       # activity, comments, search, attachments
│   │   ├── lib/          # rbac, audit, converters
│   │   └── auth.ts       # @convex-dev/auth canonical setup
│   ├── scripts/          # CLI: create:feature, sync:all, validate:*, generate-slice-docs
│   ├── proxy.ts          # Next 16 request-time boundary
│   ├── instrumentation.ts
│   └── package.json
├── cookbook/             # opinionated layout variants (8)
├── recipes/              # feature drop-ins (8)
└── docs/                 # the kitab (architecture, deploy, audit, theme, motion, convex, prune)`;

  const sliceShape = `frontend/slices/<slug>/
├── config.ts            # defineFeature({ id, name, ui, technical, status, permissions })
├── init.ts              # registerFeatureSettings + agent registry
├── page.tsx
├── views/
├── features/
├── components/
├── shared/              # slice-private
├── settings/
├── agent/
├── types/
└── docs/                # AUTO-GENERATED via pnpm generate:slice-docs
    ├── DEPS.md
    ├── CONTRACT.md
    ├── STATUS.md
    └── USAGE.md`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Architecture</h1>
      <p className="mt-3 text-muted-foreground">
        Vertical-slice. Copy-first. Auto-discovered. Convex-mirrored.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Repo shape</h2>
        <CodeBlock code={tree} language="text" filename="resources/" />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Slice shape</h2>
        <p className="text-muted-foreground">
          Add a feature = add a folder. Auto-discovered via{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            frontend/shared/lib/features/registry.ts
          </code>
          {" "}(generated). No hardcoding.
        </p>
        <CodeBlock code={sliceShape} language="text" filename="frontend/slices/<slug>/" />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Hard rules</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm">
          <li><strong>NO Clerk.</strong> Auth = <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@convex-dev/auth</code>.</li>
          <li><strong>shadcn-only UI.</strong> No raw <code>&lt;button&gt;</code>, <code>&lt;dialog&gt;</code>, native date/file inputs. Use ResponsiveDialog, DateField, FileUpload.</li>
          <li><strong>Copy-first.</strong> Never greenfield. Every artifact comes from a proven source project.</li>
          <li><strong>Stack lock</strong>: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.</li>
          <li><strong>audit-bp ≥80</strong> before any deploy.</li>
          <li><strong>Workspace isolation</strong>: every Convex query <code>.withIndex('by_workspace', …)</code>.</li>
          <li><strong>RBAC + audit log</strong> on every mutation.</li>
        </ul>
        <RepoLink path="CLAUDE.md">CLAUDE.md (full rules)</RepoLink>
      </section>
    </div>
  );
}
