"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Box, Code2, Columns2, Eye, FileCode, FolderTree, LayoutDashboard, Package, Rocket, Tag, Terminal, Wand2 } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { CopyPageButton } from "@/components/site/copy-page-button";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { PreviewPane } from "@/components/site/preview-pane";
import { SplitPreviewPane } from "@/components/site/split-preview-pane";
import { AssemblerInspector } from "@/components/site/assembler-inspector";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import {
  repoUrl,
  useFeatureContext,
  useFeatureManifest,
  type FeatureManifest,
  type Selections,
} from "@/components/site/feature-context";
import { getTemplateConfig } from "@/lib/templates/configs";
import type { PreviewView } from "@/lib/preview-presets";

type Neighbor = { slug: string; title: string };

type Props = {
  kind: "layout" | "recipe";
  basePath: "/layouts" | "/recipes";
  data: {
    slug: string;
    title: string;
    description: string;
    source: string;
    repoPath: string;
    primaryFile?: string;
    files?: string[];
    pullPaths?: string[];
    dependencies?: string[];
    exampleCode: string;
    agentRecipe: string;
    tags: string[];
    previewPath?: string;
    adminPreviewPath?: string;
    defaultSurface?: "public" | "admin";
    defaultView?: PreviewView;
    defaultZoom?: number;
    badge?: string;
  };
  prev: Neighbor | null;
  next: Neighbor | null;
  prompt: string;            // fallback static prompt
  siteUrl: string;
};

export function TemplateDetail({ kind, basePath, data, prev, next, prompt, siteUrl }: Props) {
  const tplConfig = React.useMemo(() => getTemplateConfig(data.slug), [data.slug]);

  const hasDualSurface = !!(data.previewPath && data.adminPreviewPath);

  const manifest: FeatureManifest = React.useMemo(() => {
    const tabs = [
      // Single-surface preview (existing layouts)
      data.previewPath && !hasDualSurface
        ? {
            id: "preview",
            label: "Preview",
            icon: Eye,
            render: () => <PreviewPane src={data.previewPath!} />,
          }
        : null,
      // Dual-surface: Public tab
      data.previewPath && hasDualSurface
        ? {
            id: "preview-public",
            label: "Public",
            icon: Eye,
            render: () => <PreviewPane src={data.previewPath!} />,
          }
        : null,
      // Dual-surface: Split tab (between Public + Admin)
      hasDualSurface
        ? {
            id: "preview-split",
            label: "Split",
            icon: Columns2,
            render: () => (
              <SplitPreviewPane
                publicSrc={data.previewPath!}
                adminSrc={data.adminPreviewPath!}
              />
            ),
          }
        : null,
      // Dual-surface: Admin tab
      data.adminPreviewPath
        ? {
            id: "preview-admin",
            label: "Admin",
            icon: LayoutDashboard,
            render: () => <PreviewPane src={data.adminPreviewPath!} />,
          }
        : null,
      {
        id: "code",
        label: "Code",
        icon: Code2,
        render: () => (
          <CodeTab
            slug={data.slug}
            exampleCode={data.exampleCode}
            primaryFile={data.primaryFile}
            files={data.files}
            pullPaths={data.pullPaths}
            dependencies={data.dependencies}
          />
        ),
      },
      {
        id: "prompt",
        label: "Prompt",
        icon: Wand2,
        render: () => <PromptTab fallback={prompt} kind={kind} slug={data.slug} title={data.title} />,
      },
    ].filter(Boolean) as NonNullable<FeatureManifest["tabs"]>;

    const sourceRepo: FeatureManifest["sourceRepo"] = {
      owner: "rahmanef63",
      repo: "resource-site",
      branch: "main",
      path: data.repoPath,
    };

    const inspectorRender = tplConfig
      ? () => <AssemblerInspector />
      : () => <StaticInspector data={data} basePath={basePath} prompt={prompt} siteUrl={siteUrl} />;

    return {
      title: data.title,
      subtitle: data.description,
      tabs,
      defaultTab: hasDualSurface
        ? data.defaultSurface === "admin"
          ? "preview-admin"
          : "preview-public"
        : data.previewPath
          ? "preview"
          : "code",
      responsive: !!(data.previewPath || data.adminPreviewPath),
      defaultView: data.defaultView,
      defaultZoom: data.defaultZoom,
      sourceRepo,
      inspector: { title: tplConfig ? "Assemble" : "Inspector", render: inspectorRender },
      config: tplConfig?.config,
      composePrompt: tplConfig
        ? (s: Selections) => tplConfig.composePrompt(data.slug, data.title, s)
        : undefined,
      composePreviewSrc: tplConfig?.composePreviewSrc,
    };
  }, [data, basePath, prompt, siteUrl, kind, tplConfig, hasDualSurface]);

  useFeatureManifest(manifest);

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-background/60 px-4 py-3">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          {data.badge && (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {data.badge}
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full text-[10px]">
            from {data.source}
          </Badge>
          {tplConfig && (
            <Badge className="rounded-full bg-violet-500/15 text-[10px] text-violet-300 hover:bg-violet-500/15">
              configurable
            </Badge>
          )}
        </div>
        <h1 className="truncate text-lg font-semibold tracking-tight">{data.title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <CopyPageButton title={data.title} url={`${siteUrl}${basePath}/${data.slug}`} body={data.exampleCode} />
        {prev && (
          <Button asChild variant="ghost" size="icon" className="size-8" aria-label="Previous">
            <Link href={`${basePath}/${prev.slug}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
        {next && (
          <Button asChild variant="ghost" size="icon" className="size-8" aria-label="Next">
            <Link href={`${basePath}/${next.slug}`}>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

// ----- Code tab — explicit pull commands + file tree + example snippet
function CodeTab({
  slug,
  exampleCode,
  primaryFile,
  files,
  pullPaths,
  dependencies,
}: {
  slug: string;
  exampleCode: string;
  primaryFile?: string;
  files?: string[];
  pullPaths?: string[];
  dependencies?: string[];
}) {
  const owner = "rahmanef63";
  const repo = "resource-site";
  const branch = "main";
  const pulls = pullPaths && pullPaths.length > 0 ? pullPaths : [`cookbook/layouts/${slug}`];
  const initCmd = `npx rahman-resources init my-app\ncd my-app`;
  const cliCmd = `npx rahman-resources add ${slug} my-app`;
  const degitCmd = pulls
    .map((p) => `npx tiged --force ${owner}/${repo}/${p}#${branch} my-app/${p}`)
    .join("\n");
  const sparseCmd = [
    `git clone --filter=blob:none --sparse --branch ${branch} https://github.com/${owner}/${repo}.git _tmp`,
    `cd _tmp && git sparse-checkout init --cone`,
    `git sparse-checkout set ${pulls.join(" ")}`,
    `cd .. && cp -r ${pulls.map((p) => `_tmp/${p}`).join(" ")} my-app/ && rm -rf _tmp`,
  ].join("\n");

  return (
    <div className="h-full space-y-4 overflow-auto p-4">
      <ShowcaseCard
        icon={Rocket}
        label="Fresh project — scaffold first"
        variant="code"
        footer="Skip if you already have a Next 16 project."
      >
        <CodeBlock code={initCmd} language="bash" filename="bootstrap.sh" />
      </ShowcaseCard>

      <ShowcaseCard
        icon={Terminal}
        label="Then drop in this template (auto-pulls deps)"
        variant="code"
      >
        <CodeBlock code={cliCmd} language="bash" filename="install.sh" />
      </ShowcaseCard>

      <details className="overflow-hidden rounded-xl border bg-muted/20">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Alt: degit (manual, {pulls.length} folder{pulls.length === 1 ? "" : "s"})
        </summary>
        <div className="border-t border-border/60 p-2">
          <CodeBlock code={degitCmd} language="bash" filename="degit.sh" />
        </div>
      </details>

      <details className="overflow-hidden rounded-xl border bg-muted/20">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Alt: git sparse-checkout
        </summary>
        <div className="border-t border-border/60 p-2">
          <CodeBlock code={sparseCmd} language="bash" filename="sparse-checkout.sh" />
        </div>
      </details>

      {dependencies && dependencies.length > 0 && (
        <ShowcaseCard
          icon={Package}
          label={`Dependencies (${dependencies.length})`}
          variant="code"
        >
          <CodeBlock
            code={`pnpm add ${dependencies.join(" ")}`}
            language="bash"
            filename="install.sh"
          />
        </ShowcaseCard>
      )}

      {files && files.length > 0 && (
        <ShowcaseCard
          icon={FolderTree}
          label={`Files in this template (${files.length})`}
          variant="static"
        >
          <ul className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            {files.map((f) => (
              <li key={f} className="truncate">· {f}</li>
            ))}
          </ul>
        </ShowcaseCard>
      )}

      <ShowcaseCard
        icon={FileCode}
        label="Example mount"
        variant="code"
      >
        <CodeBlock code={exampleCode} language="tsx" filename={primaryFile ?? "example.tsx"} />
      </ShowcaseCard>
    </div>
  );
}

// ----- Prompt tab — reads composer + selections live
function PromptTab({ fallback, kind, slug, title }: { fallback: string; kind: string; slug: string; title: string }) {
  const { manifest, selections } = useFeatureContext();
  const composed = manifest?.composePrompt ? manifest.composePrompt(selections) : fallback;
  return (
    <div className="h-full overflow-auto p-4">
      <ShowcaseCard
        icon={Wand2}
        label="Agent prompt"
        badge={
          <span className="text-[10px] text-muted-foreground">
            {manifest?.composePrompt ? "↻ updates with selection" : "static"}
          </span>
        }
        actions={
          <>
            <InstallWithAgent prompt={composed} size="sm" />
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <a
                href={`/api/knowledge?${kind}=${slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Knowledge JSON →
              </a>
            </Button>
          </>
        }
        variant="code"
        footer={title}
      >
        <CodeBlock code={composed} language="markdown" filename="agent-prompt.md" />
      </ShowcaseCard>
    </div>
  );
}

// ----- Static inspector (when template has no config schema)
function StaticInspector({
  data, basePath, prompt, siteUrl,
}: { data: Props["data"]; basePath: Props["basePath"]; prompt: string; siteUrl: string }) {
  void basePath; void siteUrl; void prompt;
  return (
    <div className="space-y-5 text-sm">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">About</p>
        <p className="mt-2 leading-relaxed text-foreground/80">{data.description}</p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
        <div className="mt-2 flex items-center gap-2">
          <Box className="size-3.5 text-muted-foreground" />
          <span className="text-xs">{data.source}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-2 w-full justify-start gap-2">
          <Link
            href={repoUrl({ owner: "rahmanef63", repo: "resource-site", branch: "main", path: data.repoPath })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-3.5" />
            <span className="truncate font-mono text-xs">{data.repoPath}</span>
          </Link>
        </Button>
      </section>

      {data.primaryFile && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary file</p>
          <div className="mt-2 flex items-center gap-2 rounded border bg-muted/40 p-2">
            <FileCode className="size-3.5 text-muted-foreground" />
            <code className="truncate font-mono text-xs">{data.primaryFile}</code>
          </div>
        </section>
      )}

      {data.files && data.files.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Files ({data.files.length})
          </p>
          <ul className="mt-2 space-y-1 rounded border p-2">
            {data.files.map((f) => (
              <li key={f} className="font-mono text-[11px] text-muted-foreground">{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Agent recipe</p>
        <p className="mt-2 leading-relaxed text-foreground/70">{data.agentRecipe}</p>
      </section>

      {data.tags.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Tag className="mr-1 inline size-3" /> Tags
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
