import { Bot, FileJson, ScrollText, Sparkles } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { DocCard } from "@/components/site/doc-primitives";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { layouts } from "@/lib/content/layouts";
import { site } from "@/lib/content/site";
import { PageHeader } from "@/components/site/page-header";
import { AgentIndex } from "./agent-index";

export const metadata = { title: "Install with Agent" };

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Automation"
        title="Install with Agent"
        description={
          <>
            Hand any layout or module to your AI coding agent. Copy the prompt, paste it into
            Claude / Codex / Cursor — the agent reads <code className="font-mono text-xs">{site.url}/api/knowledge</code>{" "}
            and <code className="font-mono text-xs">{site.url}/llms.txt</code> to learn the rules.
          </>
        }
      />

      {/* Featured: the fastest path to a working install. Primary-tinted so it
          reads as the page's call-to-action, not just another panel. */}
      <DocCard className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-card to-card p-5 ring-1 ring-primary/10">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <h2 className="text-base font-semibold">Try it</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a layout and copy a one-shot install prompt for your agent.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {layouts.slice(0, 4).map((l) => (
            <InstallWithAgent
              key={l.slug}
              prompt={buildAgentPrompt({ layoutSlug: l.slug, layoutTitle: l.title })}
              variant="outline"
              size="sm"
              label={l.title}
            />
          ))}
        </div>
      </DocCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <DocCard className="group p-4 transition-colors hover:border-foreground/30">
          <div className="flex items-center gap-2">
            <FileJson className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Knowledge endpoints</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/api/knowledge" className="font-mono text-xs text-foreground/80 hover:text-foreground">
                /api/knowledge
              </Link>{" "}
              — JSON catalog of every layout + module + resource + rule
            </li>
            <li>
              <Link href="/llms.txt" className="font-mono text-xs text-foreground/80 hover:text-foreground">
                /llms.txt
              </Link>{" "}
              — plain-text manifest for LLMs
            </li>
          </ul>
        </DocCard>

        <DocCard className="flex flex-col p-4">
          <div className="flex items-center gap-2">
            <ScrollText className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Source repo</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            All layouts and modules live under one monorepo.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-fit gap-1.5">
            <Link href={site.repo} target="_blank" rel="noopener noreferrer">
              <Github className="size-3.5" />
              View on GitHub
            </Link>
          </Button>
        </DocCard>
      </div>

      <DocCard className="flex items-center gap-3 border-dashed bg-card/40 p-4">
        <Bot className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Modules work standalone. Layouts assume Next 16 + React 19 + Tailwind 4 + Convex
          self-hosted + <code className="font-mono text-xs">@convex-dev/auth</code>.
        </p>
      </DocCard>

      <AgentIndex />
    </div>
  );
}
