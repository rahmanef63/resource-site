import { CodeBlock } from "@/components/site/code-block";

export const metadata = { title: "Audit Chain" };

const GUARDS = [
  {
    name: "audit:slices",
    script: "scripts/validation/audit-slice.mjs",
    coverage: "30/30 slices",
    rules: [
      "Metadata trio: slice.json + slice.contract.ts + slice.manifest.json all exist",
      "Naming: folder name === slice.json slug === config.ts slug",
      "Imports: slice files only resolve via @/components/ui/*, @/shared/*, @/features/<own-slug>/*, @convex/*, or relative-within-slice",
      "Schema clash: no two slices declare the same Convex table name",
      "Config agreement: config.ts slug + title + category match slice.json",
    ],
    severity: "All violations are errors. CI blocks.",
  },
  {
    name: "audit:templates",
    script: "scripts/validation/audit-templates.mjs",
    coverage: "367 files / 35 templates / cookbook + preview slices / 7 website-template Pages CRUD surfaces",
    rules: [
      "shadcn primitives only — no raw <button>, <dialog>, <input type=date|file>",
      "Hardcoded /preview/<slug> tokens only in rewriter-handled files (robots.ts, sitemap.ts, site-config.ts, nav-config.ts)",
      "Template-literal aware: <button> inside CodeBlock string templates is skipped",
      "Every website-template MUST wire Pages CRUD: admin/pages/page.tsx + admin/pages/[id]/page.tsx + public/[...slug]/page.tsx (P-wave 2026-05-18)",
    ],
    severity:
      "Error in components/templates/* + cookbook/layouts/* + missing Pages CRUD on website-templates; warning in single-page block demos.",
  },
  {
    name: "audit:file-size",
    script: "scripts/validation/audit-file-size.mjs",
    coverage: "970 files scanned",
    rules: [
      "Max 200 lines per source file",
      "Exempt: pure-data files (lib/content/*, theme presets, per-template seed.ts, _generated/)",
      "Grandfather list at scripts/validation/audit-file-size.grandfather.json — must shrink, never grow",
    ],
    severity: "New violations are errors. Grandfathered files emit warnings.",
  },
  {
    name: "validate:manifests",
    script: "scripts/validation/validate-manifests.mjs",
    coverage: "30/30 slice manifests",
    rules: [
      "Validates each slice.manifest.json against docs/slice.manifest.schema.json",
      "Schema is `oneOf [SchemaA, SchemaB]` — both modern + legacy shapes valid",
      "Schema A: { slug, version, tier, distribution, files: [paths], imports }",
      "Schema B: { name, deps, files: { include, exclude }, env, ... }",
    ],
    severity: "Errors fail validation. Run with --check to fail CI on errors.",
  },
  {
    name: "audit:convex-features",
    script: "scripts/validation/audit-convex-features.mjs",
    coverage: "19/19 convex/features/* folders",
    rules: [
      "Canon files (top-level only): _schema.ts (REQUIRED), query.ts, mutation.ts, action.ts, http.ts, index.ts, README.md (warned), slice trio",
      "BANNED: schema.ts (no underscore), mutations.ts/queries.ts/actions.ts (plural)",
      "Private helpers/types: underscore-prefix (e.g. _helpers.ts, _types.ts)",
      "_schema.ts should export `<slug>Tables` for root-schema composition (warning)",
      "Subfolders (e.g. payment/actions/<provider>.ts) allowed — canon applies to top-level only",
    ],
    severity: "BANNED files + missing _schema.ts are errors. Naming + missing tables export are warnings.",
  },
  {
    name: "audit:docs-primitives",
    script: "scripts/validation/audit-docs-primitives.mjs",
    coverage: "app/(docs) .tsx",
    rules: [
      "Flags raw `<div … rounded-lg border bg-card …>` panels — prefer <DocCard> (components/site/doc-primitives) so panel chrome has one restyle source",
      "Narrow by design: only <div> openers (Link / <details> panels keep the chrome inline), only app/(docs) (DocCard is docs-site-internal)",
    ],
    severity: "Advisory only — always exits 0, never blocks. A DRY nudge, not a gate.",
  },
];

export default function AuditChainPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Operator</p>
        <h1 className="text-3xl font-bold tracking-tight">Audit Chain</h1>
        <p className="text-muted-foreground">
          Four CI guards enforce rr conventions across the catalog. All run
          locally via{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">npm run slices:check</code>{" "}
          and gate every commit + push via{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.githooks/pre-commit</code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">.githooks/pre-push</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Run all</h2>
        <CodeBlock
          code={`# Full chain locally
npm run slices:check

# Individual guards
npm run audit:slices
npm run audit:templates
npm run audit:file-size
npm run audit:convex-features
npm run audit:docs-primitives
npm run validate:manifests
npm run validate:contracts:check

# Hooks (auto on commit + push)
.githooks/pre-commit   # typecheck + contracts + 3 audit gates (~15s)
.githooks/pre-push     # 3 audit gates (~5s)`}
          language="bash"
          filename="terminal"
        />
      </section>

      {GUARDS.map((g) => (
        <section key={g.name} className="space-y-3 border-t pt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{g.name}</h2>
            <span className="text-xs text-muted-foreground">{g.coverage}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1 font-mono">{g.script}</code>
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-sm">
            {g.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{g.severity}</p>
        </section>
      ))}

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-xl font-semibold tracking-tight">Adding a new guard</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm">
          <li>
            Write the scanner at{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">scripts/validation/&lt;name&gt;.mjs</code>{" "}
            — keep main file ≤200 LOC (extract helpers to{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">&lt;name&gt;-helpers.mjs</code>).
          </li>
          <li>
            Exit codes: 0 = clean, 1 = errors. Warnings print but don&apos;t fail.
          </li>
          <li>
            Wire into{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">package.json</code>{" "}
            scripts (audit:&lt;name&gt;) and the{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">slices:check</code>{" "}
            chain.
          </li>
          <li>
            Add to{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">.githooks/pre-push</code>{" "}
            (or pre-commit if fast enough).
          </li>
          <li>
            Add this page entry above.
          </li>
        </ol>
      </section>
    </div>
  );
}
