"use client";

/** AddCoverButton — the "Add cover" affordance shown when a page has no cover.
 *  Opens the CoverPicker; on pick, hands the host a CoverData to store. */

import * as React from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoverData, CoverSourceProps } from "../types";
import { CoverPicker } from "./CoverPicker";

interface Props extends CoverSourceProps {
  onPick: (c: CoverData) => void;
  className?: string;
}

export function AddCoverButton({ onPick, className, onUpload, searchUnsplash }: Props) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className={className}>
        <ImagePlus className="mr-1.5 h-3.5 w-3.5" /> Add cover
      </Button>
      <CoverPicker open={open} onOpenChange={setOpen} onPick={onPick} onUpload={onUpload} searchUnsplash={searchUnsplash} />
    </>
  );
}
