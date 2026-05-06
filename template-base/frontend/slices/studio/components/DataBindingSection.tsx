"use client";

/**
 * DataBindingSection
 *
 * Shown in the Studio right-panel inspector when a data-bindable block widget
 * (tableBlock, kanbanBlock, listBlock, etc.) is selected.
 *
 * Lets the user connect the block to a live data source (database table or
 * documents list) by saving `_dataBinding` into the node's props.
 * The Convex query is `api.features.studio.queries.getStudioDataBinding`.
 */

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSharedCanvas } from "@/frontend/shared/builder";
import { useWorkspaceId } from "@/frontend/shared/foundation/workspaces/hooks/useWorkspaceId";
import { DATA_BINDABLE_BLOCK_TYPES, type DataBindingFeatureId } from "../hooks/useStudioDataBinding";
import { Database, FileText, Link2, Unlink } from "lucide-react";
import { Label } from "@/components/ui/label";

const FEATURE_OPTIONS: { id: DataBindingFeatureId; label: string; icon: React.ElementType }[] = [
  { id: "database", label: "Database Table", icon: Database },
  { id: "docs", label: "Documents", icon: FileText },
];

interface DataBindingSectionProps {
  selectedNode: any | null;
}

export function DataBindingSection({ selectedNode }: DataBindingSectionProps) {
  const { setNodeProps } = useSharedCanvas();
  const workspaceId = useWorkspaceId();
  const [expanded, setExpanded] = useState(false);

  if (!selectedNode) return null;

  const nodeType: string = selectedNode.data?.comp || selectedNode.data?.type || "";
  if (!DATA_BINDABLE_BLOCK_TYPES.has(nodeType)) return null;

  const props = selectedNode.data?.props ?? {};
  const currentBinding = props._dataBinding as { featureId: DataBindingFeatureId; resourceId: string } | undefined;

  const saveBinding = (featureId: DataBindingFeatureId, resourceId: string) => {
    setNodeProps(selectedNode.id, { ...props, _dataBinding: { featureId, resourceId } });
  };

  const clearBinding = () => {
    const { _dataBinding: _removed, ...rest } = props;
    setNodeProps(selectedNode.id, rest);
  };

  return (
    <div className="border-t border-border/50">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Link2 size={12} className="text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Data Source</span>
          {currentBinding && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Connected
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Feature selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Feature</Label>
            <div className="flex gap-1.5">
              {FEATURE_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => saveBinding(id, currentBinding?.featureId === id ? (currentBinding.resourceId) : "all")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
                    currentBinding?.featureId === id
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border/50 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resource ID — only for database (docs uses all by default) */}
          {currentBinding?.featureId === "database" && workspaceId && (
            <DatabaseTablePicker
              workspaceId={workspaceId}
              selectedTableId={currentBinding.resourceId}
              onSelect={(tableId) => saveBinding("database", tableId)}
            />
          )}

          {/* Status */}
          {currentBinding && (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">Source:</span>{" "}
                {currentBinding.featureId === "database" ? `database / ${currentBinding.resourceId.slice(-8)}` : "documents"}
              </div>
              <button
                type="button"
                onClick={clearBinding}
                className="flex items-center gap-1 text-[10px] text-destructive hover:underline"
              >
                <Unlink size={10} /> Remove binding
              </button>
            </div>
          )}

          {!currentBinding && (
            <p className="text-[10px] text-muted-foreground">
              Select a feature above to connect this block to live data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Database table picker sub-component ────────────────────────────────────

function DatabaseTablePicker({
  workspaceId,
  selectedTableId,
  onSelect,
}: {
  workspaceId: ReturnType<typeof useWorkspaceId> & {};
  selectedTableId: string;
  onSelect: (id: string) => void;
}) {
  const tables = useQuery(api.features.database.queries.list, { workspaceId });

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Table</Label>
      <select
        value={selectedTableId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full h-8 rounded-md border border-border/50 bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Select a table…</option>
        {(tables ?? []).map((t: any) => (
          <option key={t._id} value={t._id}>
            {t.name || t._id}
          </option>
        ))}
      </select>
    </div>
  );
}
