"use client";

import * as React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField } from "@/components/admin/field";
import { ExportBlock } from "@/components/admin/export-block";
import { useAdminState } from "@/lib/admin/storage";
import { emitSiteTs, type SiteData } from "@/lib/admin/codegen";
import { site } from "@/lib/content/site";

const DEFAULTS: SiteData = {
  name: site.name,
  shortName: site.shortName,
  description: site.description,
  tagline: site.tagline,
  url: site.url,
  repo: site.repo,
  author: site.author,
  authorUrl: site.authorUrl,
};

export default function AdminSitePage() {
  const [state, setState, reset] = useAdminState<SiteData>("site", DEFAULTS);
  const [showExport, setShowExport] = React.useState(false);

  function update<K extends keyof SiteData>(k: K, v: SiteData[K]) {
    setState((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin · Site</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Site metadata</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit your site name, tagline, repo URL. Hit Export to copy{" "}
          <code className="font-mono text-xs">lib/content/site.ts</code>.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" value={state.name} onChange={(v) => update("name", v)} />
          <TextField label="Short name" value={state.shortName} onChange={(v) => update("shortName", v)} />
        </div>
        <TextField label="Tagline" value={state.tagline} onChange={(v) => update("tagline", v)} />
        <TextAreaField
          label="Description"
          value={state.description}
          onChange={(v) => update("description", v)}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="URL" value={state.url} onChange={(v) => update("url", v)} mono />
          <TextField label="Repo" value={state.repo} onChange={(v) => update("repo", v)} mono />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Author" value={state.author} onChange={(v) => update("author", v)} />
          <TextField label="Author URL" value={state.authorUrl} onChange={(v) => update("authorUrl", v)} mono />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => setShowExport(true)} size="sm" className="gap-1.5">
          <Save className="size-3.5" /> Generate TS
        </Button>
        <Button onClick={reset} variant="outline" size="sm" className="gap-1.5">
          <RotateCcw className="size-3.5" /> Reset to defaults
        </Button>
      </div>

      {showExport && (
        <ExportBlock
          filename="lib/content/site.ts"
          source={emitSiteTs(state)}
          description="Paste over the existing file, commit, push."
        />
      )}
    </div>
  );
}
