"use client";

import * as React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, TagField } from "@/components/admin/field";
import { ListEditor } from "@/components/admin/list-editor";
import { ExportBlock } from "@/components/admin/export-block";
import { useAdminState } from "@/lib/admin/storage";
import { emitRecipesTs } from "@/lib/admin/codegen";
import { recipes as defaults, type RecipeEntry } from "@/lib/content/recipes";

function blank(): RecipeEntry {
  return {
    slug: `new-recipe-${Date.now()}`,
    title: "Untitled",
    description: "",
    source: "",
    repoPath: "",
    files: [],
    tags: [],
    exampleCode: "",
    agentRecipe: "",
  };
}

export default function AdminRecipesPage() {
  const [items, setItems, reset] = useAdminState<RecipeEntry[]>("recipes", defaults);
  const [showExport, setShowExport] = React.useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin · Recipes</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Recipes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, edit, or remove feature drop-ins. Export overwrites{" "}
          <code className="font-mono text-xs">lib/content/recipes.ts</code>.
        </p>
      </div>

      <ListEditor<RecipeEntry>
        items={items}
        onChange={setItems}
        blank={blank}
        itemLabel={(r) => r.title || r.slug}
        itemSubLabel={(r) => `from ${r.source || "?"} · ${r.files.length} file${r.files.length === 1 ? "" : "s"}`}
        renderEditor={(r, update) => (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Slug" value={r.slug} onChange={(v) => update({ slug: v })} mono />
              <TextField label="Title" value={r.title} onChange={(v) => update({ title: v })} />
            </div>
            <TextField label="Source project" value={r.source} onChange={(v) => update({ source: v })} />
            <TextAreaField label="Description" value={r.description} onChange={(v) => update({ description: v })} rows={3} />
            <TextField label="Repo path" value={r.repoPath} onChange={(v) => update({ repoPath: v })} mono />
            <TagField label="Files (one per Enter)" value={r.files} onChange={(v) => update({ files: v })} />
            <TagField label="Tags" value={r.tags} onChange={(v) => update({ tags: v })} />
            <TextAreaField
              label="Example code"
              value={r.exampleCode}
              onChange={(v) => update({ exampleCode: v })}
              rows={8}
              mono
              placeholder="import { ... } from ..."
            />
            <TextAreaField
              label="Agent recipe"
              value={r.agentRecipe}
              onChange={(v) => update({ agentRecipe: v })}
              rows={2}
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
        <ExportBlock filename="lib/content/recipes.ts" source={emitRecipesTs(items)} />
      )}
    </div>
  );
}
