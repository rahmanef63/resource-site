import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/site/code-block";
import { PACKAGE_VERSIONS } from "@/lib/content/package-versions";

const NPM_PACKAGE = "rahman-resources-mcp";

export function WhySection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Why use it</h2>
      <ul className="list-disc space-y-2 pl-6 text-sm">
        <li>
          <strong>Discovery without scrolling docs.</strong> Ask Claude
          <em> &quot;what kitab templates ship a public + admin combo?&quot;</em> — agent calls{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rr_list_templates</code>{" "}
          and answers from live data.
        </li>
        <li>
          <strong>Command composition.</strong> Agent reasons about what you want, then
          emits the exact{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx rahman-resources init …</code>{" "}
          command to run.
        </li>
        <li>
          <strong>Single source of truth.</strong> The MCP loads from{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rahman-resources/lib/manifest.json</code>{" "}
          (the CLI&apos;s manifest) — never drifts.
        </li>
        <li>
          <strong>Read-only.</strong> No file writes, no shell exec. The agent
          still runs commands itself; the MCP just tells it which.
        </li>
      </ul>
    </section>
  );
}

export function QuickWireSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Quick wire (CLI helper)</h2>
      <p className="text-muted-foreground">
        The sister CLI prints the JSON snippet for you:
      </p>
      <CodeBlock
        code={`npx rahman-resources mcp`}
        language="bash"
        filename="terminal"
      />
    </section>
  );
}

export function ExampleSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Example — agent flow</h2>
      <p className="text-muted-foreground">
        A typical session in Claude Code looks like:
      </p>
      <CodeBlock
        code={`You:    "Scaffold a consultancy site with Midtrans + Resend.
        Use the kitab."

Agent → calls rr_list_templates({ tag: "consultant" })
      → finds "konsultan-os"
      → calls rr_get({ slug: "konsultan-os" })
      → reads agentRecipe + dependencies
      → calls rr_compose_init_command({
          appName: "my-consultancy",
          template: "konsultan-os",
          features: ["midtrans", "resend"],
          skills: ["use-audit-bp", "use-si-coder"]
        })
      → returns:
          npx rahman-resources init my-consultancy \\
            --template konsultan-os \\
            --features midtrans,resend \\
            --skills use-audit-bp,use-si-coder

Agent runs the command via Bash tool. Project scaffolded.`}
        language="text"
        filename="session.log"
      />
    </section>
  );
}

export function SourceOfTruthSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Source of truth</h2>
      <p className="text-muted-foreground">
        The MCP reads the manifest from the sibling{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rahman-resources</code>{" "}
        npm package (same monorepo, separate publish). When working in the
        monorepo, the loader falls back to the local CLI package at{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">packages/cli/lib/</code>.
      </p>
      <p className="text-muted-foreground">
        Regenerate the manifest after editing any{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">lib/content/*.ts</code>:
      </p>
      <CodeBlock
        code={`cd packages/cli
node scripts/gen-manifest.mjs`}
        language="bash"
        filename="terminal"
      />
    </section>
  );
}

export function VersioningSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Versioning</h2>
      <p className="text-sm text-muted-foreground">
        Versions read at build time from the monorepo&apos;s{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">package.json</code> —
        this badge always matches the current repo state.
      </p>
      <ul className="list-disc space-y-2 pl-6 text-sm">
        <li>
          <strong>{NPM_PACKAGE}</strong> — current{" "}
          <Badge variant="secondary" className="font-mono text-[10px]">
            v{PACKAGE_VERSIONS.mcp}
          </Badge>
        </li>
        <li>
          <strong>rahman-resources (CLI)</strong> — current{" "}
          <Badge variant="secondary" className="font-mono text-[10px]">
            v{PACKAGE_VERSIONS.cli}
          </Badge>{" "}
          (the manifest + workflow source)
        </li>
        <li>
          Adding new tools or resource kinds = minor bump. Removing or renaming
          tools = major bump. Workflow markdown content = patch.
        </li>
      </ul>
    </section>
  );
}

export function TroubleshootSection() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Troubleshooting</h2>
      <ul className="list-disc space-y-2 pl-6 text-sm">
        <li>
          <strong>Tool not appearing</strong> — restart Claude Code after editing{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">mcp.json</code>.
        </li>
        <li>
          <strong>npx prompts to download</strong> — the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">-y</code>{" "}
          flag in args auto-confirms; without it, MCP startup hangs.
        </li>
        <li>
          <strong>Stale results</strong> — manifest is bundled into the npm
          package; run{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx -y rahman-resources-mcp@latest</code>{" "}
          to force a fresh fetch.
        </li>
        <li>
          <strong>Empty skills list</strong> — older versions miss
          skills.json. Upgrade to v0.1.0+.
        </li>
      </ul>
    </section>
  );
}
