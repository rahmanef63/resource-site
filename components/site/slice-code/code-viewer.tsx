"use client";

import * as React from "react";
import { Download, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import type { SliceFile } from "@/lib/slice-files";
import { buildTree, formatBytes } from "./file-tree";
import { TreeNodes } from "./tree-node";
import { CodeView } from "./code-view";

interface Props {
  slug: string;
  /** Path under repo root the files were read from. Displayed as a header. */
  rootPath: string;
  files: SliceFile[];
}

/**
 * Slice "Code" tab — file tree on the left, viewer on the right, download
 * ZIP button up top. Reads from the SliceFile[] passed in by a Server
 * Component (which reads `slicePath` from disk at build time).
 */
export function SliceCodeViewer({ slug, rootPath, files }: Props) {
  const tree = React.useMemo(() => buildTree(files), [files]);
  const [selected, setSelected] = React.useState<string | null>(() => {
    // Prefer index.ts, then first file.
    const idx = files.find((f) => f.path === "index.ts" || f.path === "index.tsx");
    return idx?.path ?? files[0]?.path ?? null;
  });

  const selectedFile = files.find((f) => f.path === selected) ?? null;

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const onDownload = async () => {
    // lazy: jszip (~100 kB) only loads when someone actually downloads
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const folder = zip.folder(slug);
    if (!folder) return;
    for (const file of files) {
      folder.file(file.path, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (files.length === 0) {
    return (
      <ShowcaseCard icon={FileCode} label="Code">
        <p className="text-sm text-muted-foreground">
          No files readable at <code className="text-xs">{rootPath}</code>.
        </p>
      </ShowcaseCard>
    );
  }

  return (
    <ShowcaseCard
      icon={FileCode}
      label="Code"
      actions={
        <>
          <span className="text-[11px] text-muted-foreground">
            {files.length} files · {formatBytes(totalBytes)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Download className="size-3" /> Download ZIP
          </Button>
        </>
      }
      variant="iframe"
    >
      <div className="grid h-[70svh] min-h-[420px] grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="overflow-auto border-b bg-muted/10 md:border-b-0 md:border-r">
          <div className="border-b bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
            <code className="font-mono">{rootPath}</code>
          </div>
          <div className="py-1">
            <TreeNodes nodes={tree} selectedPath={selected} onSelect={setSelected} />
          </div>
        </aside>
        <section className="min-h-0 overflow-hidden">
          {selectedFile ? (
            <CodeView path={selectedFile.path} content={selectedFile.content} />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Select a file
            </div>
          )}
        </section>
      </div>
    </ShowcaseCard>
  );
}
