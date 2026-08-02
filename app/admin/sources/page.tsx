"use client";

import * as React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, TagField } from "@/components/admin/field";
import { ListEditor } from "@/components/admin/list-editor";
import { ExportBlock } from "@/components/admin/export-block";
import { useAdminState } from "@/lib/admin/storage";
import { emitSourcesTs } from "@/lib/admin/codegen";
import { sources as defaults, type Source } from "@/lib/content/sources";

function blank(): Source {
  return {
    id: `source-${Date.now()}`,
    name: "@new-source",
    description: "",
    url: "",
    contributes: [],
  };
}

export default function AdminSourcesPage() {
  const [items, setItems, reset] = useAdminState<Source[]>("sources", defaults);
  const [showExport, setShowExport] = React.useState(false);

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin · Sources</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Sources</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Source projects every layout/recipe is copied from. Export overwrites{" "}
          <code className="font-mono text-xs">lib/content/sources.ts</code>.
        </p>
      </div>

      <ListEditor<Source>
        items={items}
        onChange={setItems}
        blank={blank}
        itemLabel={(s) => s.name}
        itemSubLabel={(s) => s.url || "private (no public link)"}
        renderEditor={(s, update) => (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="ID" value={s.id} onChange={(v) => update({ id: v })} mono />
              <TextField label="Name" value={s.name} onChange={(v) => update({ name: v })} />
            </div>
            <TextAreaField
              label="Description"
              value={s.description}
              onChange={(v) => update({ description: v })}
              rows={3}
            />
            <TextField label="URL (optional, leave blank for private)" value={s.url ?? ""} onChange={(v) => update({ url: v || undefined })} mono />
            <TagField
              label="What it contributes"
              value={s.contributes}
              onChange={(v) => update({ contributes: v })}
            />
            <TextField
              label="Badge (optional)"
              value={s.badge ?? ""}
              onChange={(v) => update({ badge: v || undefined })}
              hint="e.g. core, archived, beta"
            />
          </div>
        )}
      />

      <div className="flex items-center gap-2">
        <Button onClick={() => setShowExport(true)} size="sm" className="gap-1.5">
          <Save className="size-3.5" /> Generate TS
        </Button>
        <Button onClick={reset} variant="outline" size="sm" className="gap-1.5">
          <RotateCcw className="size-3.5" /> Reset to defaults
        </Button>
      </div>

      {showExport && (
        <ExportBlock filename="lib/content/sources.ts" source={emitSourcesTs(items)} />
      )}
    </div>
  );
}
