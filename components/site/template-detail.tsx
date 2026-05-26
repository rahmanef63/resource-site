"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyPageButton } from "@/components/site/copy-page-button";
import { AssemblerInspector } from "@/components/site/assembler-inspector";
import { RecentlyUpdatedBadge } from "@/components/site/recently-updated-badge";
import { MaturityBadge } from "@/components/site/maturity-badge";
import { useFeatureManifest, type Selections } from "@/components/site/feature-context";
import { buildPreviewManifest } from "@/components/site/preview";
import { getTemplateConfig } from "@/lib/templates/configs";
import { getDemoUrl } from "@/lib/content/template-subdomains";
import { CodeTab } from "@/components/site/template-detail/code-tab";
import { PromptTab } from "@/components/site/template-detail/prompt-tab";
import { StaticInspector } from "@/components/site/template-detail/static-inspector";
import type {
  TemplateDetailData,
  TemplateDetailNeighbor,
} from "@/components/site/template-detail/types";

type Props = {
  kind: "layout" | "recipe";
  basePath: "/layouts" | "/recipes";
  data: TemplateDetailData;
  prev: TemplateDetailNeighbor | null;
  next: TemplateDetailNeighbor | null;
  prompt: string;            // fallback static prompt
  siteUrl: string;
};

export function TemplateDetail({ kind, basePath, data, prev, next, prompt, siteUrl }: Props) {
  const tplConfig = React.useMemo(() => getTemplateConfig(data.slug), [data.slug]);
  const demoUrl = React.useMemo(() => getDemoUrl(data.slug), [data.slug]);

  const manifest = React.useMemo(() => {
    const inspectorRender = tplConfig
      ? () => <AssemblerInspector />
      : () => <StaticInspector data={data} />;
    return buildPreviewManifest({
      id: `${kind}:${data.slug}`,
      title: data.title,
      subtitle: data.description,
      publicPath: data.previewPath,
      adminPath: data.adminPreviewPath,
      // BR-wave — when slug has a demo subdomain, point the
      // SplitPane new-tab buttons there (iframe srcs stay internal
      // so localStorage stays in sync between public + admin panes).
      publicExternalUrl: demoUrl ? `${demoUrl}/` : undefined,
      adminExternalUrl: demoUrl ? `${demoUrl}/admin` : undefined,
      defaultSurface: data.defaultSurface,
      defaultView: data.defaultView,
      defaultZoom: data.defaultZoom,
      splitStorageKey: data.slug ?? data.previewPath,
      code: () => (
        <CodeTab
          slug={data.slug}
          exampleCode={data.exampleCode}
          primaryFile={data.primaryFile}
          files={data.files}
          pullPaths={data.pullPaths}
          dependencies={data.dependencies}
          codeFiles={data.codeFiles}
          codeRootPath={data.codeRootPath}
        />
      ),
      prompt: () => (
        <PromptTab fallback={prompt} kind={kind} slug={data.slug} title={data.title} />
      ),
      sourceRepo: {
        owner: "rahmanef63",
        repo: "resource-site",
        branch: "main",
        path: data.repoPath,
      },
      inspector: {
        title: tplConfig ? "Assemble" : "Inspector",
        render: inspectorRender,
      },
      config: tplConfig?.config,
      composePrompt: tplConfig
        ? (s: Selections) => tplConfig.composePrompt(data.slug, data.title, s)
        : undefined,
      composePreviewSrc: tplConfig?.composePreviewSrc,
    });
  }, [data, prompt, kind, tplConfig]);

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
          <MaturityBadge status={data.status} />
          <RecentlyUpdatedBadge slug={data.slug} kind="template" />
        </div>
        <h1 className="truncate text-lg font-semibold tracking-tight">{data.title}</h1>
      </div>
      <div className="flex items-center gap-1">
        {demoUrl && (
          <Button asChild variant="outline" size="sm" className="hidden gap-1.5 text-xs sm:inline-flex">
            <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3" />
              Live demo
            </Link>
          </Button>
        )}
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
