// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { readAuditLocal, type AuditEntry } from "../lib/audit";

type Props = { entries?: AuditEntry[]; className?: string };

export function AuditLogView({ entries, className }: Props) {
  const [items, setItems] = React.useState<AuditEntry[]>(entries ?? []);
  React.useEffect(() => { if (!entries) setItems(readAuditLocal()); }, [entries]);
  return (
    <table className={className ?? "w-full text-sm"}>
      <thead><tr className="border-b text-left"><th className="py-2">Action</th><th>Target</th><th>When</th></tr></thead>
      <tbody>
        {items.map((e) => (
          <tr key={e.id} className="border-b">
            <td className="py-2 font-mono text-xs">{e.action}</td>
            <td className="font-mono text-xs">{e.targetId ?? "—"}</td>
            <td className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
