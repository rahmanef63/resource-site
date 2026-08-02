import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, ExternalLink, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { DocCard } from "@/components/site/doc-primitives";
import { PageHeader } from "@/components/site/page-header";
import { slices, getSlice } from "@/lib/content/slices";
import { layouts, getLayout } from "@/lib/content/layouts";
import { site } from "@/lib/content/site";
import {
  buildLayoutAgentPrompt,
  buildSliceAgentPrompt,
} from "@/lib/slice-agent-prompt";

export function generateStaticParams() {
  return [
    ...slices.map((s) => ({ slug: s.slug })),
    ...layouts.map((l) => ({ slug: l.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  if (slice) return { title: `${slice.title} — AI prompt` };
  const layout = getLayout(slug);
  if (layout) return { title: `${layout.title} — AI prompt` };
  return { title: "AI prompt not found" };
}

export default async function AgentPromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slice = getSlice(slug);
  const layout = slice ? null : getLayout(slug);
  if (!slice && !layout) notFound();

  const title = slice?.title ?? layout!.title;
  const subtitle = slice?.tagline ?? slice?.description ?? layout!.description;
  const prompt = slice
    ? buildSliceAgentPrompt(slice)
    : buildLayoutAgentPrompt(layout!);
  const sourceHref = slice
    ? `${site.repo}/tree/main/${slice.slicePath}`
    : `${site.repo}/tree/main/${layout!.repoPath}`;
  const detailHref = slice ? `/slices/${slice.slug}` : `/layouts/${layout!.slug}`;
  const kind = slice ? "Slice" : "Template";

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`${kind} · AI prompt`} title={title} description={subtitle} />

      <div className="flex flex-wrap gap-2">
        <InstallWithAgent prompt={prompt} label="Open in dialog + copy" />
        <Button asChild variant="outline" size="sm">
          <Link href={detailHref}>
            <Layers className="size-3.5" /> Resource detail
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={sourceHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" /> View source
          </Link>
        </Button>
      </div>

      <DocCard className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4 text-primary" />
          Copy this prompt into Claude / Codex / Cursor
        </div>
        <CodeBlock
          code={prompt}
          language="markdown"
          filename={`${slug}.prompt.md`}
        />
      </DocCard>

      <DocCard className="p-4 text-sm text-muted-foreground">
        <p>
          The agent will fetch{" "}
          <Link href="/llms.txt" className="font-mono text-xs hover:text-foreground">
            /llms.txt
          </Link>{" "}
          for the full ruleset and use{" "}
          <Link href="/api/knowledge" className="font-mono text-xs hover:text-foreground">
            /api/knowledge
          </Link>{" "}
          for the JSON catalog.
        </p>
      </DocCard>
    </div>
  );
}
