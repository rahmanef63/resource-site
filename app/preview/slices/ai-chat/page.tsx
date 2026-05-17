"use client";

import * as React from "react";
import {
  History, RefreshCw, GitBranch, Share2, ChevronDown, PanelLeft, Sliders,
} from "lucide-react";
import {
  PreviewPage,
  ChatMessage,
  Composer,
  DEFAULT_MODEL_ID,
  SKILLS,
  useToggleSet,
} from "@/components/site/preview-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DEFAULT_TOOLS, DEFAULT_SKILL, MOCK_MESSAGES } from "./mock-data";
import { LeftPanel, RightPanel } from "./panels";

export default function Page() {
  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState(DEFAULT_MODEL_ID);
  const [skill, setSkill] = React.useState(DEFAULT_SKILL);
  const [temperature, setTemperature] = React.useState(0.7);
  const [topP, setTopP] = React.useState(0.95);
  const [maxTokens, setMaxTokens] = React.useState(4096);
  const tools = useToggleSet<string>(DEFAULT_TOOLS);
  const activeSkill = SKILLS.find((s) => s.slug === skill) ?? SKILLS[0];

  const leftPanel = <LeftPanel toolsSet={tools.set} toolsToggle={tools.toggle} />;
  const rightPanel = (
    <RightPanel
      model={model}
      setModel={setModel}
      skill={skill}
      setSkill={setSkill}
      temperature={temperature}
      setTemperature={setTemperature}
      topP={topP}
      setTopP={setTopP}
      maxTokens={maxTokens}
      setMaxTokens={setMaxTokens}
    />
  );

  return (
    <PreviewPage>
      <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="hidden flex-col border-r border-border/60 bg-muted/20 lg:flex">
          {leftPanel}
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/70 px-4 py-2 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 lg:hidden" aria-label="Chats">
                    <PanelLeft className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-80 flex-col p-0">
                  <SheetTitle className="sr-only">Chats panel</SheetTitle>
                  {leftPanel}
                </SheetContent>
              </Sheet>
              <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                <History className="size-3" /> {activeSkill.name}
              </Badge>
              <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                {activeSkill.systemPrompt}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="hidden h-7 gap-1.5 text-[11px] md:inline-flex">
                <ChevronDown className="size-3" /> System prompt
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 lg:hidden" aria-label="Model + params">
                    <Sliders className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex w-80 flex-col p-0">
                  <SheetTitle className="sr-only">Model + params panel</SheetTitle>
                  {rightPanel}
                </SheetContent>
              </Sheet>
            </div>
          </header>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
              {MOCK_MESSAGES.map((m, i) => (
                <ChatMessage
                  key={i}
                  {...m}
                  actions={
                    <>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <RefreshCw className="size-3" /> Regen
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <GitBranch className="size-3" /> Branch
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <Share2 className="size-3" /> Copy
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur">
            <Composer
              value={draft}
              onValueChange={setDraft}
              onSubmit={() => setDraft("")}
              placeholder="Reply, or ⌘K for commands…"
              attachments={[
                { id: "a1", name: "design-review.pdf", mime: "application/pdf", sizeKb: 1240 },
              ]}
              onAttach={() => {}}
              onVoice={() => {}}
              onRemoveAttachment={() => {}}
              hint={
                <>
                  Using <span className="font-semibold text-foreground">{activeSkill.name}</span> skill ·{" "}
                  <span className="font-mono">{tools.size} tools active</span>
                </>
              }
            />
          </div>
        </div>

        <aside className="hidden flex-col border-l border-border/60 bg-muted/20 lg:flex">
          {rightPanel}
        </aside>
      </div>
    </PreviewPage>
  );
}
