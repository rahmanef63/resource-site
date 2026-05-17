"use client";

import * as React from "react";
import Link from "next/link";
import { Box, FileCode, Tag } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { repoUrl } from "@/components/site/feature-context";
import type { TemplateDetailData } from "./types";

export function StaticInspector({
  data,
}: {
  data: TemplateDetailData;
}) {
  return (
    <div className="space-y-5 text-sm">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">About</p>
        <p className="mt-2 leading-relaxed text-foreground/80">{data.description}</p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
        <div className="mt-2 flex items-center gap-2">
          <Box className="size-3.5 text-muted-foreground" />
          <span className="text-xs">{data.source}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-2 w-full justify-start gap-2">
          <Link
            href={repoUrl({ owner: "rahmanef63", repo: "resource-site", branch: "main", path: data.repoPath })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-3.5" />
            <span className="truncate font-mono text-xs">{data.repoPath}</span>
          </Link>
        </Button>
      </section>

      {data.primaryFile && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary file</p>
          <div className="mt-2 flex items-center gap-2 rounded border bg-muted/40 p-2">
            <FileCode className="size-3.5 text-muted-foreground" />
            <code className="truncate font-mono text-xs">{data.primaryFile}</code>
          </div>
        </section>
      )}

      {data.files && data.files.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Files ({data.files.length})
          </p>
          <ul className="mt-2 space-y-1 rounded border p-2">
            {data.files.map((f) => (
              <li key={f} className="font-mono text-[11px] text-muted-foreground">{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Agent recipe</p>
        <p className="mt-2 leading-relaxed text-foreground/70">{data.agentRecipe}</p>
      </section>

      {data.tags.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Tag className="mr-1 inline size-3" /> Tags
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
