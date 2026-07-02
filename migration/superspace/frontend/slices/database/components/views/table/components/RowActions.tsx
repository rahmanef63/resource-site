"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { api as apiUntyped } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";

export interface RowActionsProps {
  rowId: string;
  rowTitle?: string;
  docId?: Id<"documents"> | null;
  onDelete?: (rowId: string) => Promise<void> | void;
}

export function RowActions({ rowId, rowTitle, docId, onDelete }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();
  const { workspaceId } = useWorkspaceContext();

  const createDocument = useMutation(apiUntyped["features/docs/documents"].create);
  const linkDocToRow = useMutation((api.features.database.mutations as any).linkDocToRow);

  const canCreateDoc = Boolean(workspaceId);

  const docHref = useMemo(() => {
    if (!docId) return null;
    return `/dashboard/documents?docId=${encodeURIComponent(String(docId))}`;
  }, [docId]);

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    const confirmed = window.confirm("Delete this row? This cannot be undone.");
    if (!confirmed) return;
    void onDelete(rowId);
    setOpen(false);
  }, [onDelete, rowId]);

  const handleOpenDoc = useCallback(() => {
    if (!docHref) return;
    router.push(docHref);
    setOpen(false);
  }, [docHref, router]);

  const handleCreateDoc = useCallback(async () => {
    if (!workspaceId) {
      toast.error("Select a workspace first.");
      return;
    }

    setIsWorking(true);
    try {
      const createdDocId = (await createDocument({
        title: rowTitle?.trim() || "New page",
        isPublic: false,
        workspaceId,
      })) as Id<"documents">;

      await linkDocToRow({
        rowId: rowId as Id<"dbRows">,
        docId: createdDocId,
      });

      router.push(`/dashboard/documents?docId=${encodeURIComponent(String(createdDocId))}`);
      setOpen(false);
      toast.success("Page created.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create page.");
    } finally {
      setIsWorking(false);
    }
  }, [createDocument, linkDocToRow, router, rowId, rowTitle, workspaceId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button aria-label="More options"
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {docId ? (
          <DropdownMenuItem onClick={handleOpenDoc} disabled={!docHref}>
            <FileText className="mr-2 h-4 w-4" />
            Open page
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleCreateDoc} disabled={!canCreateDoc || isWorking}>
            <Plus className="mr-2 h-4 w-4" />
            Create page
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
          disabled={isWorking}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
