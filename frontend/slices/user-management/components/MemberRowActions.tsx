"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MembersLabels } from "../types";

interface Props {
  canManage: boolean;
  onRemove?: () => void;
  labels: MembersLabels;
}

export function MemberRowActions({ canManage, onRemove, labels }: Props) {
  if (!canManage || !onRemove) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Member actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {labels.remove}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
