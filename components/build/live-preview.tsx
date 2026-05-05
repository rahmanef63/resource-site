"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PreviewFrame } from "@/components/site/preview-frame";

export function LivePreview({
  templateSlug,
  publicPath,
  adminPath,
  defaultSurface = "public",
}: {
  templateSlug: string | null;
  publicPath?: string;
  adminPath?: string;
  defaultSurface?: "public" | "admin";
}) {
  const [surface, setSurface] = React.useState<"public" | "admin">(defaultSurface);

  React.useEffect(() => { setSurface(defaultSurface); }, [defaultSurface, templateSlug]);

  // "Existing project" mode — user uploads their own rr.json. No live preview.
  const isExisting = templateSlug === "_existing";

  if (!templateSlug) {
    return (
      <div className="flex h-[480px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
        <Eye className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Pick a template to preview</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Or pick <span className="font-medium text-foreground">Existing project</span> to extend
          an rr.json you already have.
        </p>
      </div>
    );
  }

  if (isExisting) {
    return (
      <div className="flex h-[480px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
        <Eye className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Existing project — no preview</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Upload your <code className="rounded bg-muted px-1">rr.json</code> in the{" "}
          <span className="font-medium text-foreground">Project</span> tab. Pick features and
          skills on the left — the right panel emits the right{" "}
          <code className="rounded bg-muted px-1">add</code> commands.
        </p>
      </div>
    );
  }

  const src = surface === "admin" ? adminPath : publicPath;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-full text-[10px]">{templateSlug}</Badge>
        <div className="ml-auto flex items-center gap-0.5 rounded-md border bg-background p-0.5">
          <SurfaceTab on={surface === "public"} disabled={!publicPath} onClick={() => setSurface("public")}>
            public
          </SurfaceTab>
          <SurfaceTab on={surface === "admin"} disabled={!adminPath} onClick={() => setSurface("admin")}>
            admin
          </SurfaceTab>
        </div>
        {src && (
          <Button asChild size="icon" variant="ghost" className="size-7">
            <Link href={src} target="_blank" aria-label="Open in new tab">
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
      {src ? (
        <PreviewFrame
          src={src}
          defaultView="desktop"
          defaultZoom={0.55}
          viewControls="dropdown"
          className="h-[520px]"
        />
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
          No {surface} preview available for this template.
        </div>
      )}
    </div>
  );
}

function SurfaceTab({
  on, disabled, onClick, children,
}: {
  on: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-6 rounded px-2 text-[11px] font-medium transition-colors",
        on ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
        disabled && "opacity-40",
      )}
    >
      {children}
    </button>
  );
}
