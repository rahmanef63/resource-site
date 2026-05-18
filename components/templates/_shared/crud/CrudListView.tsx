"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef, CrudController, EntityMeta } from "./types";

/**
 * Generic admin list — table with View/Edit/Delete row actions + top
 * "New <entity>" button. Pass a CrudController + ColumnDef[]. Click New
 * → dispatch create(blank()) → redirect to editor at `editPath(id)`.
 */
export function CrudListView<T>({
  meta,
  controller,
  columns,
  editPath,
  description,
}: {
  meta: EntityMeta;
  controller: CrudController<T>;
  columns: ColumnDef<T>[];
  /** Builds the /admin/<entity>/<id> editor URL. */
  editPath: (id: string) => string;
  /** Optional sub-header line below the title. */
  description?: React.ReactNode;
}) {
  function createNew() {
    const item = controller.blank();
    controller.create(item);
    if (typeof window !== "undefined") {
      window.location.href = editPath(controller.getId(item));
    }
  }

  function deleteItem(id: string, label: string) {
    if (confirm(`Delete "${label}"?`)) controller.remove(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{meta.labelPlural}</h1>
          <p className="text-xs text-muted-foreground">
            {controller.items.length} total
            {description ? <> · {description}</> : null}
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={createNew}>
          <Plus className="size-3.5" /> New {meta.label.toLowerCase()}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.width}>
                  {c.header}
                </TableHead>
              ))}
              <TableHead className="w-[14%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controller.items.map((row) => {
              const id = controller.getId(row);
              const label = renderForLabel(row, columns);
              const publicHref = meta.publicHref?.(row as unknown);
              return (
                <TableRow key={id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.mono ? "font-mono text-xs" : "text-xs"}>
                      <CellRender col={c} row={row} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {publicHref && (
                        <Button asChild size="icon" variant="ghost" className="size-7" title="View public">
                          <Link href={publicHref} target="_blank">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="icon" variant="ghost" className="size-7" title="Edit">
                        <Link href={editPath(id)}>
                          <Pencil className="size-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => deleteItem(id, label)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {controller.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-8 text-center text-xs text-muted-foreground">
                  No {meta.labelPlural.toLowerCase()} yet. Click{" "}
                  <span className="font-medium">New {meta.label.toLowerCase()}</span>.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CellRender<T>({ col, row }: { col: ColumnDef<T>; row: T }) {
  const value = (row as Record<string, unknown>)[col.key];
  if (col.render) return <>{col.render(value, row)}</>;
  if (col.badge) {
    const variant = col.badge === true ? "outline" : col.badge;
    return (
      <Badge variant={variant as "outline" | "secondary" | "default"} className="text-[10px]">
        {String(value ?? "")}
      </Badge>
    );
  }
  if (Array.isArray(value)) return <>{value.join(", ")}</>;
  return <>{String(value ?? "")}</>;
}

function renderForLabel<T>(row: T, columns: ColumnDef<T>[]): string {
  // First column = display label
  const first = columns[0];
  if (!first) return "item";
  const value = (row as Record<string, unknown>)[first.key];
  return String(value ?? "item");
}
