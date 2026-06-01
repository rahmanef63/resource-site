"use client";

/** CoverPicker — the 4-tab cover chooser (Gallery · Upload · Link · Unsplash).
 *  Upload tab appears only when `onUpload` is wired; Unsplash live-search only
 *  when `searchUnsplash` is wired (else it browses the curated set). */

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CoverData, CoverSourceProps } from "../types";
import { GalleryTab } from "./cover-picker/GalleryTab";
import { UploadTab } from "./cover-picker/UploadTab";
import { LinkTab } from "./cover-picker/LinkTab";
import { UnsplashTab } from "./cover-picker/UnsplashTab";

type Tab = "gallery" | "upload" | "link" | "unsplash";

interface Props extends CoverSourceProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (c: CoverData) => void;
}

export function CoverPicker({ open, onOpenChange, onPick, onUpload, searchUnsplash }: Props) {
  const [tab, setTab] = React.useState<Tab>("gallery");
  const tabs: { id: Tab; label: string }[] = [
    { id: "gallery", label: "Gallery" },
    ...(onUpload ? [{ id: "upload" as const, label: "Upload" }] : []),
    { id: "link", label: "Link" },
    { id: "unsplash", label: "Unsplash" },
  ];
  const handle = (c: CoverData) => { onPick(c); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-sm">Page cover</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          {tabs.map((t) => (
            <button
              key={t.id} type="button" onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition",
                tab === t.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {tab === "gallery" && <GalleryTab onPick={handle} />}
          {tab === "upload" && onUpload && <UploadTab onPick={handle} onUpload={onUpload} />}
          {tab === "link" && <LinkTab onPick={handle} />}
          {tab === "unsplash" && <UnsplashTab onPick={handle} searchUnsplash={searchUnsplash} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
