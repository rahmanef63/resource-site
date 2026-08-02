"use client";

import * as React from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { useFeatureContext } from "@/components/site/feature-context";

export function PromptTab({
  fallback,
  kind,
  slug,
  title,
}: {
  fallback: string;
  kind: string;
  slug: string;
  title: string;
}) {
  const { manifest, selections } = useFeatureContext();
  const composed = manifest?.composePrompt ? manifest.composePrompt(selections) : fallback;
  return (
    <div className="h-full overflow-auto p-4">
      <ShowcaseCard
        icon={Wand2}
        label="Agent prompt"
        badge={
          <span className="text-[10px] text-muted-foreground">
            {manifest?.composePrompt ? "↻ updates with selection" : "static"}
          </span>
        }
        actions={
          <>
            <InstallWithAgent prompt={composed} size="sm" />
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <a
                href={`/api/knowledge?${kind}=${slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Knowledge JSON →
              </a>
            </Button>
          </>
        }
        variant="code"
        footer={title}
      >
        <CodeBlock code={composed} language="markdown" filename="agent-prompt.md" />
      </ShowcaseCard>
    </div>
  );
}
