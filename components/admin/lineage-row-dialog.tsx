"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
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
import type { LineageRow } from "@/lib/admin/lineage";

export function LineageRowDialog({
  row,
  open,
  onOpenChange,
  isHidden,
  onToggleHide,
}: {
  row: LineageRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHidden: boolean;
  onToggleHide: (slug: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {row && (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono text-base">{row.slice}</DialogTitle>
              <DialogDescription>
                Lineage hop · {row.transforms.length} transform(s)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <DetailRow label="From" mono>
                {row.from}
              </DetailRow>
              <DetailRow label="To" mono>
                {row.to}
              </DetailRow>
              <DetailRow label="Transforms">
                <div className="flex flex-wrap gap-1">
                  {row.transforms.map((t) => (
                    <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </DetailRow>
              <DetailRow label="Actor" mono>
                {row.actor}
              </DetailRow>
              <DetailRow label="When" mono>
                {row.at}
              </DetailRow>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                size="sm"
                variant={isHidden ? "default" : "destructive"}
                className="gap-1.5"
                onClick={() => onToggleHide(row.slice)}
              >
                {isHidden ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                {isHidden ? "Unhide slice" : "Hide slice from public"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
