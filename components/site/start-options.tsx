"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, FileText, Layers, Rocket, Wand2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-button";

const NPX = "npx rahman-resources@latest init my-app";

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

export function StartOptions({ prompt }: { prompt: string }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="from-zero"
      className="rounded-lg border bg-card"
    >
      <AccordionItem value="from-zero" className="px-4 sm:px-5">
        <AccordionTrigger>
          <TriggerHead
            icon={Rocket}
            title="Start from zero — or adopt an existing project"
            hint="New app, or bring your own codebase / PRD"
          />
        </AccordionTrigger>
        <AccordionContent className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              From zero
            </h4>
            <p className="text-sm text-muted-foreground">
              Scaffold a fresh Next 16 + React 19 + Tailwind 4 + Convex + shadcn app.
            </p>
            <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs">
              <span className="min-w-0 overflow-x-auto whitespace-nowrap">{NPX}</span>
              <CopyButton value={NPX} className="shrink-0" />
            </div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1 text-xs">
              <Link href="/installation">
                Installation guide <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="min-w-0 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Existing project or PRD
            </h4>
            <p className="text-sm text-muted-foreground">
              Paste your PRD — or just the best-practice prompt — into your AI agent.
              It builds to the same rr rules.
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyPromptButton value={prompt} />
              <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Link href="/best-practice">
                  <FileText className="size-3.5" /> View the prompt
                </Link>
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="builder" className="px-4 sm:px-5">
        <AccordionTrigger>
          <TriggerHead
            icon={Wand2}
            title="Build it with the visual builder"
            hint="Pick template + features + skills → get the npx command"
          />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Compose a bundle in the Bundle Builder — choose a template, add features and
            skills, and it emits the exact{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">npx rahman-resources</code>{" "}
            command to run.
          </p>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/build">
              <Layers className="size-3.5" /> Open the builder
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
