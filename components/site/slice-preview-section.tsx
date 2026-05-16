"use client";

import * as React from "react";
import { Columns2, ExternalLink, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { PreviewFrame } from "@/components/site/preview-frame";
import { SplitPreviewPane } from "@/components/site/split-preview-pane";
import {
  PREVIEW_DEFAULTS,
  activePreviewPath,
  hasDualSurface,
  type PreviewSource,
  type PreviewSurfaceMode,
} from "@/components/site/preview";

type SurfaceTab = PreviewSurfaceMode | "split";

type Props =
  | {
      /** New API — pass a normalized PreviewSource. */
      source: PreviewSource;
      sourceHref: string;
      /** Legacy props (ignored when `source` is set). */
      publicPath?: never;
      adminPath?: never;
      defaultSurface?: never;
      defaultView?: never;
      defaultZoom?: never;
    }
  | {
      /** Legacy direct-props API — kept for backward compat. */
      publicPath: string;
      adminPath?: string;
      defaultSurface?: PreviewSurfaceMode;
      defaultView?: import("@/lib/preview-presets").PreviewView;
      defaultZoom?: number;
      sourceHref: string;
      source?: never;
    };

/** Slice detail "Live preview" section. Renders Public/Admin tabs when
 *  the source has both surfaces; falls back to a bare PreviewFrame
 *  otherwise. Consumes the normalized PreviewSource SSOT. */
export function SlicePreviewSection(props: Props) {
  // Normalize both API shapes into one source object.
  const source: PreviewSource = React.useMemo(() => {
    if ("source" in props && props.source) return props.source;
    return {
      publicPath: props.publicPath!,
      adminPath: props.adminPath,
      defaultSurface: props.defaultSurface,
      defaultView: props.defaultView,
      defaultZoom: props.defaultZoom,
    };
  }, [props]);

  const dual = hasDualSurface(source);
  const [surface, setSurface] = React.useState<SurfaceTab>(source.defaultSurface ?? "public");
  const activeSurface: PreviewSurfaceMode = surface === "admin" ? "admin" : "public";
  const activePath = activePreviewPath(source, activeSurface);

  const view = source.defaultView ?? PREVIEW_DEFAULTS.view;
  const zoom = source.defaultZoom;

  return (
    <ShowcaseCard
      icon={Eye}
      label="Live preview"
      actions={
        <>
          {dual && (
            <Tabs value={surface} onValueChange={(v) => setSurface(v as SurfaceTab)}>
              <TabsList className="h-7 bg-muted/40 p-0.5">
                <TabsTrigger value="public" className="h-6 gap-1 px-2 text-[11px]">
                  <Eye className="size-3" /> Public
                </TabsTrigger>
                <TabsTrigger value="split" className="h-6 gap-1 px-2 text-[11px]">
                  <Columns2 className="size-3" /> Split
                </TabsTrigger>
                <TabsTrigger value="admin" className="h-6 gap-1 px-2 text-[11px]">
                  <Shield className="size-3" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {surface !== "split" && (
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <a href={activePath} target="_blank" rel="noreferrer">
                Open standalone <ExternalLink className="size-3" />
              </a>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <a href={props.sourceHref} target="_blank" rel="noreferrer">
              View source <ExternalLink className="size-3" />
            </a>
          </Button>
        </>
      }
      variant="iframe"
    >
      {dual ? (
        <Tabs value={surface} onValueChange={(v) => setSurface(v as SurfaceTab)}>
          <TabsContent value="public" className="m-0">
            <PreviewFrame src={source.publicPath} defaultView={view} defaultZoom={zoom} />
          </TabsContent>
          <TabsContent value="split" className="m-0">
            <div className="h-[80svh] min-h-[480px]">
              <SplitPreviewPane
                publicSrc={source.publicPath}
                adminSrc={source.adminPath!}
                view={view}
              />
            </div>
          </TabsContent>
          <TabsContent value="admin" className="m-0">
            <PreviewFrame src={source.adminPath!} defaultView={view} defaultZoom={zoom} />
          </TabsContent>
        </Tabs>
      ) : (
        <PreviewFrame src={source.publicPath} defaultView={view} defaultZoom={zoom} />
      )}
    </ShowcaseCard>
  );
}
