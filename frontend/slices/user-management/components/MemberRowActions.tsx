"use client";

import { MoreHorizontal, Trash2, Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberStatus, MembersLabels } from "../types";

interface Props {
  canManage: boolean;
  status?: MemberStatus;
  onRemove?: () => void;
  /** Toggle the member between active / inactive (members.manage). */
  onSetStatus?: (status: "active" | "inactive") => void;
  labels: MembersLabels;
}

export function MemberRowActions({ canManage, status, onRemove, onSetStatus, labels }: Props) {
  if (!canManage) return null;
  const canToggle = !!onSetStatus && (status === "active" || status === "inactive");
  if (!onRemove && !canToggle) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Member actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canToggle && status === "active" ? (
          <DropdownMenuItem onClick={() => onSetStatus?.("inactive")}>
            <Ban className="mr-2 h-4 w-4" />
            {labels.deactivate}
          </DropdownMenuItem>
        ) : null}
        {canToggle && status === "inactive" ? (
          <DropdownMenuItem onClick={() => onSetStatus?.("active")}>
            <Check className="mr-2 h-4 w-4" />
            {labels.activate}
          </DropdownMenuItem>
        ) : null}
        {onRemove ? (
          <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {labels.remove}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
