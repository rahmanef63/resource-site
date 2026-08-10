"use client";

import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { formatTime, statusOf, type McpTokenRow } from "./mcp-admin-helpers";

/** Token status pill variants — exported for consumer restyle/extend. */
export const tokenStatusVariants = cva(
  "inline-block rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium",
  {
    variants: {
      status: {
        active: "bg-foreground text-background",
        inactive: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { status: "inactive" },
  },
);

export type McpTokenTableProps = {
  rows: McpTokenRow[] | undefined;
  onRevoke: (id: string, label: string) => Promise<void> | void;
};

export function McpTokenTable({ rows, onRevoke }: McpTokenTableProps) {
  const handleRevoke = async (id: string, label: string) => {
    if (typeof window === "undefined") return;
    if (
      !window.confirm(
        `Revoke token "${label}"? Apps using it will lose access on the next call.`,
      )
    ) {
      return;
    }
    await onRevoke(id, label);
  };

  if (rows === undefined) {
    return (
      <div className="border-2 border-foreground rounded-lg p-6 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="border-2 border-foreground rounded-lg p-8 text-center text-muted-foreground">
        No tokens yet. Connect an AI client to mint the first one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-foreground rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-foreground text-background">
          <tr>
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Status</th>
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Label / Client</th>
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Created</th>
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Last used</th>
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-medium">Expires</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-foreground">
          {rows.map((r) => {
            const s = statusOf(r);
            return (
              <tr key={r._id} className="align-top">
                <td className="px-3 py-3">
                  <span
                    className={tokenStatusVariants({
                      status: s === "active" ? "active" : "inactive",
                    })}
                  >
                    {s}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-sm">{r.label ?? "—"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{r.clientId}</div>
                  {r.scope && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      scope: {r.scope}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.createdAt)}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.lastUsedAt)}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">{formatTime(r.expiresAt)}</td>
                <td className="px-3 py-3 text-right">
                  {s === "active" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(r._id, r.label ?? r.clientId)}
                      className="h-auto border-2 border-destructive px-2 py-1 text-[10px] uppercase tracking-widest font-medium text-destructive hover:bg-destructive hover:text-background"
                    >
                      Revoke
                    </Button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
