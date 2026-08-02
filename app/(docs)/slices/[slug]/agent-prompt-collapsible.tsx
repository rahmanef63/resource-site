"use client";

import Link from "next/link";
import { Bot, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import { CodeBlock } from "@/components/site/code-block";

export function AgentPromptCollapsible({
  slug, recipe, prompt,
}: {
  slug: string;
  recipe: string;
  prompt: string;
}) {
  return (
    <Collapsible>
      <ShowcaseCard
        icon={Bot}
        label="AI install prompt"
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <Link href={`/agents/${slug}`}>Dedicated page</Link>
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 [&[data-state=open]>svg]:rotate-180">
                <ChevronDown className="size-3.5 transition-transform" />
              </Button>
            </CollapsibleTrigger>
          </>
        }
      >
        <div className="px-3 py-2 text-xs text-muted-foreground">{recipe}</div>
        <CollapsibleContent>
          <ScrollArea className="h-80 border-t">
            <div className="p-3">
              <CodeBlock code={prompt} language="markdown" filename={`${slug}.prompt.md`} />
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </ShowcaseCard>
    </Collapsible>
  );
}
