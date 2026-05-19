"use client";

import * as React from "react";
import { FileCode, Package, Rocket, Terminal } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { SliceCodeViewer } from "@/components/site/slice-code/code-viewer";
import type { SliceFile } from "@/lib/slice-files";

export function CodeTab({
  slug,
  exampleCode,
  primaryFile,
  files,
  pullPaths,
  dependencies,
  codeFiles,
  codeRootPath,
}: {
  slug: string;
  exampleCode: string;
  primaryFile?: string;
  files?: string[];
  pullPaths?: string[];
  dependencies?: string[];
  codeFiles?: SliceFile[];
  codeRootPath?: string;
}) {
  const owner = "rahmanef63";
  const repo = "resource-site";
  const branch = "main";
  const pulls = pullPaths && pullPaths.length > 0 ? pullPaths : [`cookbook/layouts/${slug}`];
  const initCmd = `npx rahman-resources init my-app\ncd my-app`;
  const cliCmd = `npx rahman-resources add ${slug} my-app`;
  const degitCmd = pulls
    .map((p) => `npx tiged --force ${owner}/${repo}/${p}#${branch} my-app/${p}`)
    .join("\n");
  const sparseCmd = [
    `git clone --filter=blob:none --sparse --branch ${branch} https://github.com/${owner}/${repo}.git _tmp`,
    `cd _tmp && git sparse-checkout init --cone`,
    `git sparse-checkout set ${pulls.join(" ")}`,
    `cd .. && cp -r ${pulls.map((p) => `_tmp/${p}`).join(" ")} my-app/ && rm -rf _tmp`,
  ].join("\n");

  return (
    <div className="h-full space-y-4 overflow-auto p-4">
      <ShowcaseCard
        icon={Rocket}
        label="Fresh project — scaffold first"
        variant="code"
        footer="Skip if you already have a Next 16 project."
      >
        <CodeBlock code={initCmd} language="bash" filename="bootstrap.sh" />
      </ShowcaseCard>

      <ShowcaseCard
        icon={Terminal}
        label="Then drop in this template (auto-pulls deps)"
        variant="code"
      >
        <CodeBlock code={cliCmd} language="bash" filename="install.sh" />
      </ShowcaseCard>

      <details className="overflow-hidden rounded-xl border bg-muted/20">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Alt: degit (manual, {pulls.length} folder{pulls.length === 1 ? "" : "s"})
        </summary>
        <div className="border-t border-border/60 p-2">
          <CodeBlock code={degitCmd} language="bash" filename="degit.sh" />
        </div>
      </details>

      <details className="overflow-hidden rounded-xl border bg-muted/20">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Alt: git sparse-checkout
        </summary>
        <div className="border-t border-border/60 p-2">
          <CodeBlock code={sparseCmd} language="bash" filename="sparse-checkout.sh" />
        </div>
      </details>

      {dependencies && dependencies.length > 0 && (
        <ShowcaseCard
          icon={Package}
          label={`Dependencies (${dependencies.length})`}
          variant="code"
        >
          <CodeBlock
            code={`pnpm add ${dependencies.join(" ")}`}
            language="bash"
            filename="install.sh"
          />
        </ShowcaseCard>
      )}

      {codeFiles && codeFiles.length > 0 ? (
        <SliceCodeViewer
          slug={slug}
          rootPath={codeRootPath ?? pulls[0] ?? ""}
          files={codeFiles}
        />
      ) : files && files.length > 0 ? (
        // Fallback when server-read failed — keep the old static list
        <ShowcaseCard
          icon={FileCode}
          label={`Files in this template (${files.length})`}
          variant="static"
        >
          <ul className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            {files.map((f) => (
              <li key={f} className="truncate">· {f}</li>
            ))}
          </ul>
        </ShowcaseCard>
      ) : null}

      <ShowcaseCard
        icon={FileCode}
        label="Example mount"
        variant="code"
      >
        <CodeBlock code={exampleCode} language="tsx" filename={primaryFile ?? "example.tsx"} />
      </ShowcaseCard>
    </div>
  );
}
