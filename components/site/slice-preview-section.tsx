"use client";

import * as React from "react";
import { ExternalLink, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { PreviewFrame } from "@/components/site/preview-frame";
import type { PreviewView } from "@/lib/preview-presets";

type Props = {
  publicPath: string;
  adminPath?: string;
  defaultSurface?: "public" | "admin";
  defaultView?: PreviewView;
  defaultZoom?: number;
  sourceHref: string;
};

/** Slice detail "Live preview" section. Single surface → bare
 *  PreviewFrame; dual surface → Public/Admin tabs (mirrors the
 *  full-app template detail pattern). */
export function SlicePreviewSection({
  publicPath,
  adminPath,
  defaultSurface = "public",
  defaultView,
  defaultZoom,
  sourceHref,
}: Props) {
  const dual = !!adminPath;
  const [tab, setTab] = React.useState<"public" | "admin">(defaultSurface);
  const activePath = tab === "admin" && adminPath ? adminPath : publicPath;

  return (
    <ShowcaseCard
      icon={Eye}
      label="Live preview"
      actions={
        <>
          {dual && (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "public" | "admin")}>
              <TabsList className="h-7 bg-muted/40 p-0.5">
                <TabsTrigger value="public" className="h-6 gap-1 px-2 text-[11px]">
                  <Eye className="size-3" /> Public
                </TabsTrigger>
                <TabsTrigger value="admin" className="h-6 gap-1 px-2 text-[11px]">
                  <Shield className="size-3" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <a href={activePath} target="_blank" rel="noreferrer">
              Open standalone <ExternalLink className="size-3" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <a href={sourceHref} target="_blank" rel="noreferrer">
              View source <ExternalLink className="size-3" />
            </a>
          </Button>
        </>
      }
      variant="iframe"
    >
      {dual ? (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "public" | "admin")}>
          <TabsContent value="public" className="m-0">
            <PreviewFrame
              src={publicPath}
              defaultView={defaultView ?? "desktop"}
              defaultZoom={defaultZoom}
            />
          </TabsContent>
          <TabsContent value="admin" className="m-0">
            <PreviewFrame
              src={adminPath!}
              defaultView={defaultView ?? "desktop"}
              defaultZoom={defaultZoom}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <PreviewFrame
          src={publicPath}
          defaultView={defaultView ?? "desktop"}
          defaultZoom={defaultZoom}
        />
      )}
    </ShowcaseCard>
  );
}
