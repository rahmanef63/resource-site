"use client";

import * as React from "react";
import { Eye, EyeOff, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextField, TextAreaField, TagField, Field } from "@/components/admin/field";
import { ListEditor } from "@/components/admin/list-editor";
import { ExportBlock } from "@/components/admin/export-block";
import { useAdminState } from "@/lib/admin/storage";
import { emitLayoutsTs } from "@/lib/admin/codegen";
import { HIDDEN_KEY, emitHiddenTs } from "@/lib/admin/hidden";
import { layouts as defaults, type LayoutEntry } from "@/lib/content/layouts";

function blank(): LayoutEntry {
  return {
    slug: `new-layout-${Date.now()}`,
    title: "Untitled",
    category: "marketing",
    description: "",
    source: "",
    repoPath: "",
    primaryFile: "",
    tags: [],
    exampleCode: "",
    agentRecipe: "",
  };
}

export default function AdminLayoutsPage() {
  const [items, setItems, reset] = useAdminState<LayoutEntry[]>("layouts", defaults);
  const [hidden, setHidden] = useAdminState<string[]>(HIDDEN_KEY, []);
  const [showExport, setShowExport] = React.useState(false);
  const [showHiddenExport, setShowHiddenExport] = React.useState(false);

  const hiddenSet = React.useMemo(() => new Set(hidden), [hidden]);

  function toggleHide(slug: string) {
    setHidden((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin · Layouts</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Layouts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, edit, hide, or remove cookbook layouts. Export overwrites{" "}
          <code className="font-mono text-xs">lib/content/layouts.ts</code>. Hide marks a
          slug for removal from public catalogs — export{" "}
          <code className="font-mono text-xs">lib/content/hidden-slugs.ts</code> and wire
          <code className="font-mono text-xs"> isHidden(slug)</code> into consumers.
        </p>
      </div>

      <ListEditor<LayoutEntry>
        items={items}
        onChange={setItems}
        blank={blank}
        itemLabel={(l) => l.title || l.slug}
        itemSubLabel={(l) => `${l.category} · ${l.source || "no source"}`}
        isItemHidden={(l) => hiddenSet.has(l.slug)}
        extraRowActions={(l) => (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              toggleHide(l.slug);
            }}
            aria-label={hiddenSet.has(l.slug) ? "Unhide" : "Hide"}
          >
            <span>
              {hiddenSet.has(l.slug) ? (
                <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
              ) : (
                <EyeOff className="size-3.5 text-muted-foreground hover:text-foreground" />
              )}
            </span>
          </Button>
        )}
        renderEditor={(l, update) => (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Slug" value={l.slug} onChange={(v) => update({ slug: v })} mono />
              <TextField label="Title" value={l.title} onChange={(v) => update({ title: v })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <Select value={l.category} onValueChange={(v: string) => update({ category: v as LayoutEntry["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">marketing</SelectItem>
                    <SelectItem value="dashboard">dashboard</SelectItem>
                    <SelectItem value="cms">cms</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextField label="Source project" value={l.source} onChange={(v) => update({ source: v })} />
            </div>
            <TextAreaField label="Description" value={l.description} onChange={(v) => update({ description: v })} rows={3} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Repo path" value={l.repoPath} onChange={(v) => update({ repoPath: v })} mono />
              <TextField label="Primary file" value={l.primaryFile} onChange={(v) => update({ primaryFile: v })} mono />
            </div>
            <TagField label="Tags" value={l.tags} onChange={(v) => update({ tags: v })} />
            <TextAreaField
              label="Example code"
              value={l.exampleCode}
              onChange={(v) => update({ exampleCode: v })}
              rows={8}
              mono
              placeholder="import { ... } from ..."
            />
            <TextAreaField
              label="Agent recipe (one-liner instruction)"
              value={l.agentRecipe}
              onChange={(v) => update({ agentRecipe: v })}
              rows={2}
            />
          </div>
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setShowExport(true)} size="sm" className="gap-1.5">
          <Save className="size-3.5" /> Generate layouts.ts
        </Button>
        <Button
          onClick={() => setShowHiddenExport(true)}
          size="sm"
          variant={hiddenSet.size > 0 ? "default" : "outline"}
          className="gap-1.5"
          disabled={hiddenSet.size === 0}
        >
          <EyeOff className="size-3.5" /> Export hidden ({hiddenSet.size})
        </Button>
        <Button onClick={reset} variant="outline" size="sm" className="gap-1.5">
          <RotateCcw className="size-3.5" /> Reset to defaults
        </Button>
      </div>

      {showExport && (
        <ExportBlock filename="lib/content/layouts.ts" source={emitLayoutsTs(items)} />
      )}
      {showHiddenExport && (
        <ExportBlock
          filename="lib/content/hidden-slugs.ts"
          source={emitHiddenTs(hidden)}
          description="Commit this file, then wire isHidden(slug) into public catalog consumers."
        />
      )}
    </div>
  );
}
