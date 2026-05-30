import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { McpInstallTabs } from "@/components/site/mcp-install-tabs";
import { RepoLink } from "@/components/site/repo-link";
import { PageHeader } from "@/components/site/page-header";
import { site } from "@/lib/content/site";
import { PACKAGE_VERSIONS } from "@/lib/content/package-versions";
import { ToolsTable, ResourcesTable, WorkflowsSection } from "./page-tables";
import {
  WhySection, QuickWireSection, ExampleSection,
  SourceOfTruthSection, VersioningSection, TroubleshootSection,
} from "./page-sections";

export const metadata = {
  title: "MCP — rahman-resources-mcp",
  description:
    "Model Context Protocol server for the Rahman Resources kitab. Exposes templates, features, recipes, Claude Skills, and CRUD workflows as MCP tools/resources to Claude Code, Cursor, and Cline.",
};

const NPM_PACKAGE = "rahman-resources-mcp";
const NPM_URL = `https://www.npmjs.com/package/${NPM_PACKAGE}`;
const REPO_PATH = `${site.repo}/tree/main/packages/mcp`;

export default function McpDocsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Automation"
        title="MCP server"
        description={
          <>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{NPM_PACKAGE}</code>{" "}
            is a Model Context Protocol server that exposes the entire Rahman kitab —
            every template, feature, recipe, and Claude Skill — to MCP-aware clients
            (Claude Code, Cursor, Cline). Once wired, your agent can <em>discover</em>{" "}
            and <em>compose</em> kitab artifacts without you copy-pasting slugs.
          </>
        }
      />

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
            v{PACKAGE_VERSIONS.mcp}
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

      <WhySection />
      <McpInstallTabs />
      <QuickWireSection />
      <ToolsTable />
      <ResourcesTable />
      <WorkflowsSection />
      <ExampleSection />
      <SourceOfTruthSection />
      <VersioningSection />
      <TroubleshootSection />

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
