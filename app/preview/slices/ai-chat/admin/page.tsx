"use client";

import * as React from "react";
import { Bot, Shield, MessageSquare, AlertTriangle, Sparkles } from "lucide-react";
import {
  PreviewPage, PreviewContainer, PreviewHeader, StatGrid, ModelPicker,
  PROVIDER_GROUPS, DEFAULT_MODEL_ID,
} from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const BLOCKED_WORDS = ["spam-link", "free-money", "click-here-now", "guaranteed"];

const STATS = [
  { label: "Threads (30d)", value: "1,842" },
  { label: "Avg msgs/thread", value: "12.4" },
  { label: "Avg latency", value: "1.8s" },
  { label: "Cost (30d)", value: "$182.40", trend: "up" as const, delta: "+12%" },
];

export default function Page() {
  const [model, setModel] = React.useState(DEFAULT_MODEL_ID);
  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Shield}
          title="Chatbot · Admin"
          subtitle="Bot persona, guardrails, fallbacks, and conversation analytics."
          actions={<Badge variant="outline" className="border-info/40 bg-info/10 text-info">SUPERADMIN</Badge>}
        />
        <div className="mb-6"><StatGrid items={STATS} cols={4} /></div>
        <Tabs defaultValue="persona" className="gap-5">
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/30 p-1">
            <TabsTrigger value="persona" className="h-8 gap-1.5 px-3 text-xs"><Bot className="size-3" /> Persona</TabsTrigger>
            <TabsTrigger value="guardrails" className="h-8 gap-1.5 px-3 text-xs"><AlertTriangle className="size-3" /> Guardrails</TabsTrigger>
            <TabsTrigger value="fallback" className="h-8 gap-1.5 px-3 text-xs"><MessageSquare className="size-3" /> Fallback</TabsTrigger>
            <TabsTrigger value="suggest" className="h-8 gap-1.5 px-3 text-xs"><Sparkles className="size-3" /> Suggestions</TabsTrigger>
          </TabsList>
          <TabsContent value="persona" className="space-y-4">
            <Card className="gap-3 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Bot name</Label>
                <Input defaultValue="Nara" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Greeting</Label>
                <Input defaultValue="Hai! Aku Nara — tanya apa saja soal produk kami." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">System prompt</Label>
                <Textarea rows={6} defaultValue={`You are Nara, a friendly product expert. Reply in the user's language. Cite docs when relevant. Refuse anything off-topic from our product.`} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default model</Label>
                <ModelPicker value={model} onValueChange={setModel} groups={PROVIDER_GROUPS} />
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="guardrails" className="space-y-3">
            <Card className="gap-3 p-5">
              {[
                { label: "Block off-topic", hint: "Refuse questions outside product scope", on: true },
                { label: "Block PII collection", hint: "Mask emails/phones in responses", on: true },
                { label: "Block hostile language", hint: "Soft-refuse insults", on: false },
                { label: "Enforce citations", hint: "Require source for factual claims", on: true },
              ].map((g) => (
                <div key={g.label} className="flex items-start justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.hint}</p>
                  </div>
                  <Switch defaultChecked={g.on} />
                </div>
              ))}
            </Card>
            <Card className="gap-2 p-5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Blocked words</Label>
              <div className="flex flex-wrap gap-1.5">
                {BLOCKED_WORDS.map((w) => (
                  <Badge key={w} variant="secondary" className="font-mono text-[10px]">{w}</Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">+ Add</Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="fallback" className="space-y-3">
            <Card className="gap-3 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">"I don't know" template</Label>
                <Textarea rows={3} defaultValue={`Maaf, aku belum punya jawaban itu. Coba tanya tim kami via tombol di pojok kanan, atau cek halaman docs.`} />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Handoff trigger</Label>
                <p className="text-xs text-muted-foreground">When confidence &lt; 0.6 OR user types "talk to human" → notify Slack #support.</p>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="suggest" className="space-y-3">
            <Card className="gap-2 p-5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Starter chips (shown on first open)</Label>
              {["What can you do?", "Show me pricing", "How do I get started?", "Talk to a human"].map((s) => (
                <div key={s} className="flex items-center justify-between gap-2 rounded-md border border-border/40 px-3 py-2 text-sm">
                  <span>{s}</span>
                  <Button variant="ghost" size="icon" className="size-6"><AlertTriangle className="size-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 w-full">+ Add starter</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewContainer>
    </PreviewPage>
  );
}
