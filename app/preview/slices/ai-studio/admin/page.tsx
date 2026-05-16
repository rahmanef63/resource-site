"use client";

import * as React from "react";
import { Sparkles, Plus, Pencil, ShieldCheck, FileText } from "lucide-react";
import { PreviewPage, PreviewContainer, PreviewHeader, StatGrid } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const TEMPLATES = [
  { slug: "logo-mini", name: "Logo (minimal)", kind: "image", uses: 412 },
  { slug: "hero-card", name: "Hero card (3:2)", kind: "image", uses: 304 },
  { slug: "blog-draft", name: "Blog draft (700w)", kind: "text", uses: 197 },
  { slug: "tweet-thread", name: "Tweet thread", kind: "text", uses: 142 },
  { slug: "react-component", name: "React component", kind: "code", uses: 88 },
];

const SHOTS = [
  { input: "isometric tropical island", output: "✓ vibrant low-poly render" },
  { input: "noir Tokyo street", output: "✓ desaturated cinematic" },
  { input: "minimalist mountain logo", output: "✓ 2-color flat" },
];

export default function Page() {
  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Sparkles}
          title="Studio · Admin"
          subtitle="Templates, few-shot library, output moderation rules."
        />
        <div className="mb-6">
          <StatGrid items={[
            { label: "Generations (30d)", value: "12,418" },
            { label: "Active templates", value: TEMPLATES.length.toString() },
            { label: "Avg cost / gen", value: "$0.018" },
            { label: "Flagged outputs", value: "23", trend: "down", delta: "-31%" },
          ]} cols={4} />
        </div>
        <Tabs defaultValue="templates" className="gap-5">
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="templates" className="h-8 gap-1.5 px-3 text-xs"><FileText className="size-3" /> Templates</TabsTrigger>
            <TabsTrigger value="few-shot" className="h-8 gap-1.5 px-3 text-xs"><Sparkles className="size-3" /> Few-shot</TabsTrigger>
            <TabsTrigger value="moderation" className="h-8 gap-1.5 px-3 text-xs"><ShieldCheck className="size-3" /> Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{TEMPLATES.length} templates active</p>
              <Button size="sm" className="gap-1.5"><Plus className="size-3" /> New template</Button>
            </div>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Template</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Uses (30d)</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TEMPLATES.map((t) => (
                    <TableRow key={t.slug}>
                      <TableCell>
                        <p className="text-xs font-medium">{t.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{t.slug}</p>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{t.kind}</Badge></TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{t.uses.toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="few-shot" className="space-y-3">
            <p className="text-xs text-muted-foreground">Example pairs steer model toward house style.</p>
            <div className="space-y-2">
              {SHOTS.map((s, i) => (
                <Card key={i} className="grid gap-2 p-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Input</Label>
                    <p className="mt-1 text-xs">{s.input}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected output</Label>
                    <p className="mt-1 text-xs">{s.output}</p>
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full">+ Add few-shot pair</Button>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-3">
            <Card className="gap-3 p-5">
              {[
                { label: "Block NSFW", on: true },
                { label: "Block trademarks", on: true },
                { label: "Block deepfakes (public figures)", on: true },
                { label: "Watermark output", on: false },
              ].map((g) => (
                <div key={g.label} className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
                  <p className="text-sm">{g.label}</p>
                  <Switch defaultChecked={g.on} />
                </div>
              ))}
            </Card>
            <Card className="gap-2 p-5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Custom block list (regex)</Label>
              <Textarea
                rows={3}
                defaultValue={`/\\b(competitor-x|brandname-y)\\b/i`}
                className="font-mono text-xs"
              />
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewContainer>
    </PreviewPage>
  );
}
