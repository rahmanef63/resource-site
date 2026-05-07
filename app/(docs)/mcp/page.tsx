import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/site/code-block";
import { RepoLink } from "@/components/site/repo-link";
import { site } from "@/lib/content/site";

export const metadata = {
  title: "MCP — rahman-resources-mcp",
  description:
    "Model Context Protocol server for the Rahman Resources kitab. Exposes templates, features, recipes, and Claude Skills as MCP tools/resources to Claude Code, Cursor, and Cline.",
};

const NPM_PACKAGE = "rahman-resources-mcp";
const NPM_VERSION = "0.1.0";
const NPM_URL = `https://www.npmjs.com/package/${NPM_PACKAGE}`;
const REPO_PATH = `${site.repo}/tree/main/packages/mcp`;

const MCP_CONFIG_JSON = `{
  "mcpServers": {
    "rahman-resources": {
      "command": "npx",
      "args": ["-y", "rahman-resources-mcp"]
    }
  }
}`;

const CURSOR_CONFIG_JSON = `// Cursor: Settings → MCP → New MCP Server
{
  "name": "rahman-resources",
  "command": "npx",
  "args": ["-y", "rahman-resources-mcp"],
  "transport": "stdio"
}`;

type Tool = {
  name: string;
  purpose: string;
  args?: string;
};

const TOOLS: Tool[] = [
  {
    name: "rr_list_templates",
    purpose: "List full-app website templates (Personal Brand OS, Agency Studio, Kreator Studio, Konsultan OS, Wirausaha OS, Riset Kit, …)",
    args: "{ tag?: string }",
  },
  {
    name: "rr_list_features",
    purpose: "List backend / integration features (auth, midtrans, resend, vector-search, ai-router, …)",
    args: "{ tag?: string }",
  },
  {
    name: "rr_list_recipes",
    purpose: "List UI patterns to copy manually (block-editor, command-palette, asymmetric-masonry, …)",
  },
  {
    name: "rr_list_skills",
    purpose: "List Claude Skills inventory (anthropics + rahman skills shipped via the kitab)",
    args: "{ scope?: 'anthropics' | 'rahman' | 'all' }",
  },
  {
    name: "rr_search",
    purpose: "Fuzzy search across all kinds. Returns ranked hits with kind + slug.",
    args: "{ query: string }",
  },
  {
    name: "rr_get",
    purpose: "Full entry by slug (template, feature, recipe, or skill).",
    args: "{ slug: string }",
  },
  {
    name: "rr_compose_init_command",
    purpose: "Emit the `npx rahman-resources init` command for a selection. Use this when scaffolding a fresh project.",
    args: "{ appName, template?, features?, skills? }",
  },
  {
    name: "rr_compose_add_commands",
    purpose: "Emit `add` / `add-skill` commands for an existing rr.json project. Use this when extending an installed kitab.",
    args: "{ features?, skills?, template? }",
  },
];

const RESOURCES: { uri: string; purpose: string }[] = [
  { uri: "rr://manifest", purpose: "Full kitab manifest — every layout, feature, recipe, skill, in one JSON tree." },
  { uri: "rr://templates/{slug}", purpose: "One template entry (e.g. `rr://templates/kreator-studio-os`)." },
  { uri: "rr://features/{slug}", purpose: "One feature entry." },
  { uri: "rr://recipes/{slug}", purpose: "One recipe entry." },
  { uri: "rr://skills/{slug}", purpose: "One Claude Skill entry." },
];

export default function McpDocsPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-muted-foreground">Tooling</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">MCP server</h1>
      <p className="mt-3 text-muted-foreground">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{NPM_PACKAGE}</code>{" "}
        is a Model Context Protocol server that exposes the entire Rahman kitab —
        every template, feature, recipe, and Claude Skill — to MCP-aware clients
        (Claude Code, Cursor, Cline). Once wired, your agent can <em>discover</em>{" "}
        and <em>compose</em> kitab artifacts without you copy-pasting slugs.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <a
          href={NPM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 hover:bg-muted"
        >
          <span className="font-mono text-xs">npm</span>
          <span className="font-medium">{NPM_PACKAGE}</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            v{NPM_VERSION}
          </Badge>
        </a>
        <a
          href={REPO_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          packages/mcp →
        </a>
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Why use it</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm">
          <li>
            <strong>Discovery without scrolling docs.</strong> Ask Claude
            <em> "what kitab templates ship a public + admin combo?"</em> — agent calls{" "}
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

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Install (Claude Code)</h2>
        <p className="text-muted-foreground">
          Add to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">~/.claude/mcp.json</code>{" "}
          (global) or{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            .claude/mcp.json
          </code>{" "}
          (per-project):
        </p>
        <CodeBlock code={MCP_CONFIG_JSON} language="json" filename="mcp.json" />
        <p className="text-sm text-muted-foreground">
          Then run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/mcp</code>{" "}
          inside Claude Code — you should see <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">rahman-resources</code>{" "}
          in the connected list with 8 tools.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Install (Cursor / Cline)</h2>
        <p className="text-muted-foreground">
          Same stdio command — wire via the editor&apos;s MCP UI.
        </p>
        <CodeBlock code={CURSOR_CONFIG_JSON} language="json" filename="cursor mcp settings" />
      </section>

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

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Resources (rr:// URIs)</h2>
        <p className="text-muted-foreground">
          MCP <em>resources</em> are read-only documents the agent can fetch by URI.
          Each kitab entry is one resource; clients can pin them as context.
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

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Versioning</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm">
          <li>
            <strong>{NPM_PACKAGE}</strong> — current{" "}
            <Badge variant="secondary" className="font-mono text-[10px]">
              v{NPM_VERSION}
            </Badge>
          </li>
          <li>
            <strong>rahman-resources (CLI)</strong> — current{" "}
            <Badge variant="secondary" className="font-mono text-[10px]">
              v0.4.3
            </Badge>{" "}
            (the manifest source)
          </li>
          <li>
            Tools are stable from v0.1.0. Adding new tools = minor bump; removing or
            renaming = major bump.
          </li>
        </ul>
      </section>

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

      <section className="mt-12 flex flex-wrap items-center gap-3">
        <RepoLink>View source</RepoLink>
        <a
          href={NPM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          npm package →
        </a>
        <Link
          href="/installation"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Installation
        </Link>
        <Link
          href="/agents"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Install with agent →
        </Link>
      </section>
    </div>
  );
}
