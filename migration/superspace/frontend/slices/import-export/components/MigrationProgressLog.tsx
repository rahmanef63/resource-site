"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { BulkMigrationResult } from "../types";

interface MigrationProgressLogProps {
  result: BulkMigrationResult;
  onRollback?: (migrationId: string) => void;
  isRollingBack?: boolean;
}

const STATUS_CONFIG = {
  created: {
    icon: CheckCircle2,
    color: "text-green-500",
    label: "Created",
    badge: "default" as const,
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    label: "Failed",
    badge: "destructive" as const,
  },
  skipped: {
    icon: SkipForward,
    color: "text-muted-foreground",
    label: "Skipped",
    badge: "secondary" as const,
  },
  rolled_back: {
    icon: RotateCcw,
    color: "text-orange-500",
    label: "Rolled Back",
    badge: "outline" as const,
  },
} as const;

export function MigrationProgressLog({
  result,
  onRollback,
  isRollingBack,
}: MigrationProgressLogProps) {
  const progress =
    result.totalWorkspaces > 0
      ? Math.round(
          ((result.createdWorkspaces + result.failedWorkspaces) /
            result.totalWorkspaces) *
            100
        )
      : 100;

  const statusColor =
    result.status === "completed"
      ? "text-green-600"
      : result.status === "partial"
      ? "text-orange-500"
      : "text-destructive";

  const canRollback =
    result.status !== "failed" &&
    result.createdWorkspaces > 0 &&
    onRollback != null;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm font-semibold capitalize ${statusColor}`}>
              {result.status === "completed"
                ? "Migration Complete"
                : result.status === "partial"
                ? "Partial Success"
                : "Migration Failed"}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {result.createdWorkspaces} of {result.totalWorkspaces} workspaces
              created
              {result.failedWorkspaces > 0 &&
                ` · ${result.failedWorkspaces} failed`}
            </p>
          </div>
          {canRollback && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRollback!(result.migrationId)}
              disabled={isRollingBack}
              className="gap-1.5"
            >
              {isRollingBack ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Rollback
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="text-green-600 font-medium">
            ✓ {result.createdWorkspaces} created
          </span>
          {result.failedWorkspaces > 0 && (
            <span className="text-destructive font-medium">
              ✗ {result.failedWorkspaces} failed
            </span>
          )}
        </div>
      </div>

      {/* Per-workspace results */}
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Workspace Results
        </div>
        <div className="divide-y max-h-72 overflow-y-auto">
          {result.results.map((r) => {
            const cfg = STATUS_CONFIG[r.status];
            const Icon = cfg.icon;
            return (
              <div
                key={r.localId}
                className="flex items-start gap-3 px-3 py-2.5"
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {r.name}
                    </span>
                    <Badge variant={cfg.badge} className="text-xs px-1.5 py-0 shrink-0">
                      {cfg.label}
                    </Badge>
                  </div>
                  {r.error && (
                    <p className="text-xs text-destructive mt-0.5 break-words">
                      {r.error}
                    </p>
                  )}
                  {r.workspaceId && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      ID: {r.workspaceId}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
