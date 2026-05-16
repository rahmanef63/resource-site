"use client";

import * as React from "react";
import { Sparkles, Plus, Pencil, Zap, FileText, GitPullRequest, Mail, type LucideIcon } from "lucide-react";
import { PreviewPage, PreviewContainer, PreviewHeader } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Trigger = { entity: string; icon: LucideIcon; suggestions: string[]; enabled: boolean };

const TRIGGERS: Trigger[] = [
  { entity: "Pull Request", icon: GitPullRequest, suggestions: ["Summarize", "Generate tests", "Spot regressions"], enabled: true },
  { entity: "Document", icon: FileText, suggestions: ["Summarize", "Tone polish", "Suggest sections"], enabled: true },
  { entity: "Email draft", icon: Mail, suggestions: ["Rewrite formal", "Shorten", "Translate"], enabled: false },
  { entity: "Code file", icon: Sparkles, suggestions: ["Explain", "Refactor", "Add types"], enabled: true },
];

export default function Page() {
  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Zap}
          title="Copilot · Admin"
          subtitle="Per-entity trigger rules, personas, and rollout."
        />
        <Tabs defaultValue="triggers" className="gap-5">
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="triggers" className="h-8 gap-1.5 px-3 text-xs"><Zap className="size-3" /> Triggers</TabsTrigger>
            <TabsTrigger value="persona" className="h-8 gap-1.5 px-3 text-xs"><Sparkles className="size-3" /> Persona</TabsTrigger>
            <TabsTrigger value="rollout" className="h-8 gap-1.5 px-3 text-xs"><Plus className="size-3" /> Rollout</TabsTrigger>
          </TabsList>

          <TabsContent value="triggers" className="space-y-3">
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Entity</TableHead>
                    <TableHead>Suggestions</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRIGGERS.map((t) => (
                    <TableRow key={t.entity}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <t.icon className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{t.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {t.suggestions.map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><Switch defaultChecked={t.enabled} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <Button size="sm" variant="outline" className="w-full gap-1.5"><Plus className="size-3" /> Add entity trigger</Button>
          </TabsContent>

          <TabsContent value="persona" className="space-y-3">
            <Card className="gap-3 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Copilot system prompt</Label>
                <Textarea
                  rows={6}
                  defaultValue={`You are a senior engineer pair-programming. Short answers. Code snippets must be production-ready. Cite repo paths when relevant. Default to "what would you want to ship?" rather than "what's possible?".`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {["technical", "friendly", "terse", "playful"].map((t) => (
                    <Badge key={t} variant={t === "technical" ? "default" : "outline"} className="cursor-pointer">{t}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rollout" className="space-y-3">
            <Card className="gap-3 p-5">
              {[
                { label: "Owners", on: true },
                { label: "Admins", on: true },
                { label: "Editors", on: true },
                { label: "Members", on: false },
                { label: "Viewers", on: false },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                  <p className="text-sm">{r.label}</p>
                  <Switch defaultChecked={r.on} />
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">Defaults inherited from rbac-roles. Override per workspace if needed.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewContainer>
    </PreviewPage>
  );
}
