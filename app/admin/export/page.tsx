"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileCode, GitBranch } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExportBlock } from "@/components/admin/export-block";
import { useAdminState } from "@/lib/admin/storage";
import {
  emitLayoutsTs,
  emitRecipesTs,
  emitSourcesTs,
  emitSiteTs,
  type SiteData,
} from "@/lib/admin/codegen";
import { layouts, type LayoutEntry } from "@/lib/content/layouts";
import { recipes, type RecipeEntry } from "@/lib/content/recipes";
import { sources, type Source } from "@/lib/content/sources";
import { site } from "@/lib/content/site";

const SITE_DEFAULTS: SiteData = {
  name: site.name,
  shortName: site.shortName,
  description: site.description,
  tagline: site.tagline,
  url: site.url,
  repo: site.repo,
  author: site.author,
  authorUrl: site.authorUrl,
};

export default function AdminExportPage() {
  const [siteState] = useAdminState<SiteData>("site", SITE_DEFAULTS);
  const [layoutsState] = useAdminState<LayoutEntry[]>("layouts", layouts);
  const [recipesState] = useAdminState<RecipeEntry[]>("recipes", recipes);
  const [sourcesState] = useAdminState<Source[]>("sources", sources);

  function downloadAll() {
    const files: Array<[string, string]> = [
      ["lib/content/site.ts", emitSiteTs(siteState)],
      ["lib/content/layouts.ts", emitLayoutsTs(layoutsState)],
      ["lib/content/recipes.ts", emitRecipesTs(recipesState)],
      ["lib/content/sources.ts", emitSourcesTs(sourcesState)],
    ];
    for (const [name, content] of files) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name.split("/").pop()!;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin · Export</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Export TS files</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Copy or download each file. Replace the contents of the matching path under{" "}
          <code className="font-mono text-xs">lib/content/</code>, commit, push. Dokploy
          autodeploys on push.
        </p>
      </div>

      <Alert>
        <GitBranch className="size-3.5" />
        <AlertDescription className="text-xs">
          Suggested commit message:{" "}
          <code className="font-mono">chore(content): update kitab catalog via /admin</code>
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5" onClick={downloadAll}>
          <Download className="size-3.5" /> Download all 4 files
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/admin">
            <FileCode className="size-3.5" /> Back to overview
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <ExportBlock filename="lib/content/site.ts" source={emitSiteTs(siteState)} />
        <ExportBlock filename="lib/content/layouts.ts" source={emitLayoutsTs(layoutsState)} />
        <ExportBlock filename="lib/content/recipes.ts" source={emitRecipesTs(recipesState)} />
        <ExportBlock filename="lib/content/sources.ts" source={emitSourcesTs(sourcesState)} />
      </div>
    </div>
  );
}
