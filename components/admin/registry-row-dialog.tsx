"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailRow } from "@/components/admin/detail-row";
import type { SliceManifest } from "@/lib/admin/registry";

const CATEGORY_TONE: Record<string, string> = {
  infra: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  payments: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ui: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  content: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ai: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
};

export function RegistryRowDialog({
  slice,
  open,
  onOpenChange,
  isHidden,
  onToggleHide,
}: {
  slice: SliceManifest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHidden: boolean;
  onToggleHide: (slug: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {slice && (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono text-base">{slice.slug}</DialogTitle>
              <DialogDescription>{slice.title ?? "—"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <DetailRow label="Version" mono>
                {slice.version}
              </DetailRow>
              {slice.category && (
                <DetailRow label="Category">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] ${CATEGORY_TONE[slice.category] ?? ""}`}
                  >
                    {slice.category}
                  </Badge>
                </DetailRow>
              )}
              {slice.kind && (
                <DetailRow label="Kind" mono>
                  {slice.kind}
                </DetailRow>
              )}
              {slice.description && (
                <DetailRow label="Description">{slice.description}</DetailRow>
              )}
              {slice.tags && slice.tags.length > 0 && (
                <DetailRow label="Tags">
                  <div className="flex flex-wrap gap-1">
                    {slice.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </DetailRow>
              )}
              <DetailRow label="Contract">
                {slice.hasContract ? "✓ contract (slice.json)" : "— missing"}
              </DetailRow>
              <DetailRow label="Manifest">
                {slice.hasManifest ? "✓ slice.manifest.json" : "— missing"}
              </DetailRow>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/slices/${slice.slug}`} target="_blank">
                  <ExternalLink className="size-3.5" />
                  View public
                </Link>
              </Button>
              <Button
                size="sm"
                variant={isHidden ? "default" : "destructive"}
                className="gap-1.5"
                onClick={() => onToggleHide(slice.slug)}
              >
                {isHidden ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                {isHidden ? "Unhide" : "Hide from public"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
