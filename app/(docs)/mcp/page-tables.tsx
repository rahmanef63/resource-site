import { TOOLS, RESOURCES } from "./page-data";

export function ToolsTable() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Tools (8 read-only)</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Tool</th>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Args</th>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((t) => (
              <tr key={t.name} className="border-t align-top">
                <td className="px-3 py-3 font-mono text-xs">{t.name}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                  {t.args ?? "—"}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{t.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ResourcesTable() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Resources (rr:// URIs)</h2>
      <p className="text-muted-foreground">
        MCP <em>resources</em> are read-only documents the agent can fetch by URI.
        Each catalog entry is one resource; clients can pin them as context.
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">URI</th>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r) => (
              <tr key={r.uri} className="border-t align-top">
                <td className="px-3 py-3 font-mono text-xs">{r.uri}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const WORKFLOW_ROWS: { uri: string; body: React.ReactNode }[] = [
  {
    uri: "rr://workflow/templates",
    body: (
      <>
        Add / edit / remove a website-template. Wires{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">lib/content/layouts.ts</code>{" "}
        + <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">app/preview/{`<slug>`}/</code>{" "}
        + <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components/templates/{`<base>`}/</code>{" "}
        + manifest regen + CLI publish.
      </>
    ),
  },
  {
    uri: "rr://workflow/features",
    body: (
      <>
        Add / edit / remove a feature. Wires{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">convex/features/{`<slug>`}/</code>{" "}
        + <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">frontend/slices/{`<slug>`}/</code>{" "}
        + 3 registry generators + CLI publish.
      </>
    ),
  },
  {
    uri: "rr://workflow/recipes",
    body: <>Add / edit / remove a UI-only recipe. Lower-friction — no slice / convex deps required.</>,
  },
  {
    uri: "rr://workflow/skills",
    body: (
      <>
        Add / edit / remove a Claude Skill. Wires{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">claude-skills.ts</code>{" "}
        + <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">sync-skills.mjs</code>{" "}
        + <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">~/.agents/skills/{`<slug>`}/SKILL.md</code>{" "}
        + CLI publish.
      </>
    ),
  },
];

export function WorkflowsSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Workflows (CRUD)</h2>
      <p className="text-muted-foreground">
        The MCP also ships <em>workflow docs</em> — markdown that teaches an agent
        how to <strong>Create / Read / Update / Delete</strong> each catalog item kind,
        including the npm publish step. Wire them via{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rr_get_workflow</code>{" "}
        (or read the resources directly).
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Resource</th>
              <th className="px-3 py-2 font-mono text-xs uppercase tracking-wider">Covers</th>
            </tr>
          </thead>
          <tbody>
            {WORKFLOW_ROWS.map((r) => (
              <tr key={r.uri} className="border-t align-top">
                <td className="px-3 py-3 font-mono text-xs">{r.uri}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Source of truth: the markdown lives at{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">packages/cli/lib/workflows/{`<kind>`}.md</code>{" "}
        and ships in the CLI tarball — same single-source-of-truth pattern as the manifest.
      </p>
    </section>
  );
}
