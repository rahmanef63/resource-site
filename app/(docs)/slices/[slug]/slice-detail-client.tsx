"use client";

import * as React from "react";
import { ExternalLink, FileCode, Info, Package, SquareStack, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { SliceCodeViewer } from "@/components/site/slice-code/code-viewer";
import { useFeatureManifest } from "@/components/site/feature-context";
import { buildPreviewManifest } from "@/components/site/preview";
import { getDemoUrl } from "@/lib/content/template-subdomains";
import type { SliceFile } from "@/lib/slice-files";
import type { SliceEntry } from "@/lib/content/slices";
import { DetailsTab } from "./details-tab";
import { useRelatedGroups } from "./use-related-groups";

interface Props {
  slice: SliceEntry;
  codeFiles?: SliceFile[];
  sourceHref: string;
  installCommand: string;
}

/** Registers the docs-shell tabbed preview manifest. Mirrors
 *  `/layouts/[slug]` so both routes share the same chrome.
 *
 *  BS-fix (2026-05-20) — added a "Details" tab containing the slice
 *  metadata (peers, npm, env, providers, agent recipe, related
 *  slices, install command). Before this fix, those sections were
 *  rendered as page `{children}` ABOVE the FeatureBar, which pushed
 *  the actual preview off-screen since the docs-shell doesn't
 *  scroll-wrap children when tabs are present. */
export function SliceDetailClient({
  slice,
  codeFiles,
  sourceHref,
  installCommand,
}: Props) {
  const demoUrl = getDemoUrl(slice.slug);
  const relatedGroups = useRelatedGroups(slice);
  const manifest = React.useMemo(() => {
    return buildPreviewManifest({
      id: `slice:${slice.slug}`,
      title: slice.title,
      subtitle: slice.tagline ?? slice.description,
      publicPath: slice.previewPath,
      adminPath: slice.adminPreviewPath,
      publicExternalUrl: demoUrl ? `${demoUrl}/` : undefined,
      adminExternalUrl: demoUrl ? `${demoUrl}/admin` : undefined,
      defaultSurface: slice.defaultSurface,
      defaultView: slice.defaultView,
      defaultZoom: slice.defaultZoom,
      splitStorageKey: `slice:${slice.slug}`,
      code: slice.slicePath
        ? () => (
            <CodeTab
              slug={slice.slug}
              slicePath={slice.slicePath}
              codeFiles={codeFiles}
              dependencies={slice.npm ?? []}
              sourceHref={sourceHref}
              wiring={slice.wiring}
              variants={slice.variants}
            />
          )
        : undefined,
      extras: [
        {
          id: "details",
          label: "Details",
          icon: Info,
          render: () => (
            <DetailsTab
              slice={slice}
              relatedGroups={relatedGroups}
              sourceHref={sourceHref}
              installCommand={installCommand}
            />
          ),
        },
      ],
      sourceRepo: {
        owner: "rahmanef63",
        repo: "resource-site",
        branch: "main",
        path: slice.slicePath ?? "",
      },
    });
  }, [slice, codeFiles, sourceHref, relatedGroups, installCommand, demoUrl]);

  useFeatureManifest(manifest);
  return null;
}

function CodeTab({
  slug,
  slicePath,
  codeFiles,
  dependencies,
  sourceHref,
  wiring,
  variants,
}: {
  slug: string;
  slicePath: string;
  codeFiles?: SliceFile[];
  dependencies: string[];
  sourceHref: string;
  wiring?: string;
  variants?: { title: string; desc: string }[];
}) {
  const cliCmd = `npx rahman-resources add ${slug} my-app`;
  return (
    <div className="h-full space-y-4 overflow-auto p-4">
      <ShowcaseCard
        icon={Terminal}
        label="Install via CLI (auto-pulls peers + deps)"
        variant="code"
        actions={
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <a href={sourceHref} target="_blank" rel="noreferrer">
              View source <ExternalLink className="size-3" />
            </a>
          </Button>
        }
      >
        <CodeBlock code={cliCmd} language="bash" filename="install.sh" />
      </ShowcaseCard>

      {variants && variants.length > 0 && (
        <ShowcaseCard icon={SquareStack} label={`Variants (${variants.length})`} variant="static">
          <ul className="space-y-1.5 text-xs">
            {variants.map((v) => (
              <li key={v.title} className="flex gap-2">
                <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{v.title}</code>
                <span className="text-muted-foreground">{v.desc}</span>
              </li>
            ))}
          </ul>
        </ShowcaseCard>
      )}

      {wiring && (
        <ShowcaseCard icon={FileCode} label="Wiring" variant="code">
          <CodeBlock code={wiring} language="tsx" filename="usage.tsx" />
        </ShowcaseCard>
      )}

      {dependencies.length > 0 && (
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

      {codeFiles && codeFiles.length > 0 ? (
        <SliceCodeViewer slug={slug} rootPath={slicePath} files={codeFiles} />
      ) : (
        <ShowcaseCard icon={FileCode} label="No files" variant="static">
          <p className="text-xs text-muted-foreground">
            Slice source not available client-side. Open the GitHub link above.
          </p>
        </ShowcaseCard>
      )}
    </div>
  );
}
