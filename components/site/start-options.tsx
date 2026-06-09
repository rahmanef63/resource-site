"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Check, Copy, FileText, Layers, Rocket } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./code-block";
import { InstallWithAgent } from "./install-with-agent";
import { RepoLink } from "./repo-link";

const CLI = `# Fresh Next 16 + React 19 + Tailwind 4 + Convex + shadcn app
npx rahman-resources@latest init my-app

# …pre-bake every shadcn primitive:
npx rahman-resources@latest init my-app --with-shadcn-all

# …or pre-load a full-app template:
npx rahman-resources@latest init my-app --template personal-brand-os

cd my-app
cp .env.example .env.local      # fill NEXT_PUBLIC_CONVEX_URL
npx convex dev --once           # generate convex/_generated
npm run dev                     # http://localhost:3000`;

function TriggerHead({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ElementType;
  title: string;
  hint: string;
}) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs font-normal text-muted-foreground">{hint}</span>
      </span>
    </span>
  );
}

function CopyPromptButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silent fail */
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy best-practice prompt"}
    </Button>
  );
}

const ITEM_CLS = "px-4 sm:px-5";
const CTA_ROW = "flex flex-wrap items-center gap-2 pt-1";
const GHOST_LINK = "h-8 gap-1 text-xs";

export function StartOptions({
  agentPrompt,
  bestPracticePrompt,
}: {
  agentPrompt: string;
  bestPracticePrompt: string;
}) {
  return (
    <Accordion type="single" collapsible defaultValue="zero" className="rounded-lg border bg-card">
      <AccordionItem value="zero" className={ITEM_CLS}>
        <AccordionTrigger>
          <TriggerHead icon={Rocket} title="Start from zero" hint="Scaffold a fresh stack with the CLI" />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Roll your own — copy from the repo, adjust imports, ship.
          </p>
          <CodeBlock code={CLI} language="bash" filename="terminal" />
          <div className={CTA_ROW}>
            <RepoLink>Open repo</RepoLink>
            <Button asChild variant="ghost" size="sm" className={GHOST_LINK}>
              <Link href="/installation">
                Installation guide <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="agent" className={ITEM_CLS}>
        <AccordionTrigger>
          <TriggerHead icon={Bot} title="Hand it to an AI agent" hint="Bootstrap prompt for Claude Code, Cursor, any agent" />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste the prompt — the agent fetches the knowledge base + repo and bootstraps
            the project for you.
          </p>
          <div className={CTA_ROW}>
            <InstallWithAgent prompt={agentPrompt} size="sm" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="existing" className={ITEM_CLS}>
        <AccordionTrigger>
          <TriggerHead icon={FileText} title="Existing project or PRD" hint="Make your agent follow the rr rules" />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste your PRD — or just the best-practice prompt — into your AI agent. It
            builds to the same rr rules.
          </p>
          <div className={CTA_ROW}>
            <CopyPromptButton value={bestPracticePrompt} />
            <Button asChild variant="ghost" size="sm" className={GHOST_LINK}>
              <Link href="/best-practice">
                <FileText className="size-3.5" /> View the prompt
              </Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="builder" className={ITEM_CLS}>
        <AccordionTrigger>
          <TriggerHead icon={Layers} title="Build with the visual builder" hint="Pick template + features + skills → npx command" />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Compose a bundle in the Bundle Builder — choose a template, add features and
            skills, and it emits the exact{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">npx rahman-resources</code>{" "}
            command.
          </p>
          <div className={CTA_ROW}>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/build">
                <Layers className="size-3.5" /> Open the builder
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
