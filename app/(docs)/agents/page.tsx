import { ArrowRight, Bot, Layers } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { buildSliceAgentPrompt } from "@/lib/slice-agent-prompt";
import { layouts } from "@/lib/content/layouts";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import { site } from "@/lib/content/site";

export const metadata = { title: "Install with Agent" };

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Agents</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Install with Agent</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Hand any layout or module to your AI coding agent. Copy the prompt, paste it into
          Claude / Codex / Cursor — the agent reads <code className="font-mono text-xs">{site.url}/api/knowledge</code>{" "}
          and <code className="font-mono text-xs">{site.url}/llms.txt</code> to learn the rules.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Try it</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a layout below and copy a one-shot install prompt for your agent.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold">Knowledge endpoints</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="/api/knowledge" className="font-mono text-xs hover:text-foreground">
                /api/knowledge
              </Link>{" "}
              — JSON catalog of every layout + module + resource + rule
            </li>
            <li>
              <Link href="/llms.txt" className="font-mono text-xs hover:text-foreground">
                /llms.txt
              </Link>{" "}
              — plain-text manifest for LLMs
            </li>
          </ul>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold">Source repo</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            All layouts and modules live under one monorepo.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
            <Link href={site.repo} target="_blank" rel="noopener noreferrer">
              <Github className="size-3.5" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-dashed bg-card/40 p-4">
        <Bot className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Modules work standalone. Layouts assume Next 16 + React 19 + Tailwind 4 + Convex
          self-hosted + <code className="font-mono text-xs">@convex-dev/auth</code>.
        </p>
      </div>

      <AgentIndex />
    </div>
  );
}

function AgentIndex() {
  const visibleSlices = slices.filter((s) => !isHidden(s.slug));
  const visibleLayouts = layouts.filter((l) => !isHidden(l.slug));
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold">All slice prompts</h2>
          <Badge variant="secondary" className="text-[10px]">
            {visibleSlices.length}
          </Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleSlices.map((s) => (
            <div
              key={s.slug}
              className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/agents/${s.slug}`}
                  className="truncate font-medium hover:text-primary"
                >
                  {s.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{s.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <InstallWithAgent
                  prompt={buildSliceAgentPrompt(s)}
                  label="Copy"
                  variant="ghost"
                  size="sm"
                />
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/agents/${s.slug}`} aria-label={`Open ${s.title} prompt page`}>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold">All template prompts</h2>
          <Badge variant="secondary" className="text-[10px]">
            {visibleLayouts.length}
          </Badge>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleLayouts.map((l) => (
            <div
              key={l.slug}
              className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/agents/${l.slug}`}
                  className="truncate font-medium hover:text-primary"
                >
                  {l.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{l.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <InstallWithAgent
                  prompt={buildAgentPrompt({
                    layoutSlug: l.slug,
                    layoutTitle: l.title,
                    agentRecipe: l.agentRecipe,
                  })}
                  label="Copy"
                  variant="ghost"
                  size="sm"
                />
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/agents/${l.slug}`} aria-label={`Open ${l.title} prompt page`}>
                    <Layers className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
