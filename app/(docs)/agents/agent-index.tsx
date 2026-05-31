import type { ReactNode } from "react";
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { buildSliceAgentPrompt } from "@/lib/slice-agent-prompt";
import { layouts } from "@/lib/content/layouts";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";

/** One copyable prompt row — title + slug, with Copy + open-detail actions
 *  that lift on hover. Shared by the slice + template lists below. */
function PromptRow({
  href,
  title,
  slug,
  copy,
  openIcon,
  openLabel,
}: {
  href: string;
  title: string;
  slug: string;
  copy: ReactNode;
  openIcon: ReactNode;
  openLabel: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors hover:border-foreground/30 hover:bg-accent/30">
      <Link href={href} className="min-w-0 flex-1">
        <span className="block truncate font-medium transition-colors group-hover:text-primary">
          {title}
        </span>
        <span className="block truncate font-mono text-xs text-muted-foreground">
          {slug}
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        {copy}
        <Button asChild variant="ghost" size="sm">
          <Link href={href} aria-label={openLabel}>
            {openIcon}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function IndexSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-[10px]">
          {count}
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function AgentIndex() {
  const visibleSlices = slices.filter((s) => !isHidden(s.slug));
  const visibleLayouts = layouts.filter((l) => !isHidden(l.slug));
  return (
    <div className="space-y-8">
      <IndexSection title="All slice prompts" count={visibleSlices.length}>
        {visibleSlices.map((s) => (
          <PromptRow
            key={s.slug}
            href={`/agents/${s.slug}`}
            title={s.title}
            slug={s.slug}
            openIcon={<ArrowRight className="size-3.5" />}
            openLabel={`Open ${s.title} prompt page`}
            copy={
              <InstallWithAgent
                prompt={buildSliceAgentPrompt(s)}
                label="Copy"
                variant="ghost"
                size="sm"
              />
            }
          />
        ))}
      </IndexSection>

      <IndexSection title="All template prompts" count={visibleLayouts.length}>
        {visibleLayouts.map((l) => (
          <PromptRow
            key={l.slug}
            href={`/agents/${l.slug}`}
            title={l.title}
            slug={l.slug}
            openIcon={<Layers className="size-3.5" />}
            openLabel={`Open ${l.title} prompt page`}
            copy={
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
            }
          />
        ))}
      </IndexSection>
    </div>
  );
}
