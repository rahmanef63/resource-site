"use client";

import * as React from "react";
import { Search, Plus, RefreshCw, Globe, FileText, Database, MessageSquare } from "lucide-react";
import { PreviewPage, PreviewContainer, PreviewHeader, StatGrid, ParamSlider } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const SOURCES = [
  { name: "kitab.dev", kind: "Website", icon: Globe, docs: 184, lastCrawl: "2h ago", weight: 1.0 },
  { name: "docs.convex.dev", kind: "Website", icon: Globe, docs: 412, lastCrawl: "1d ago", weight: 0.9 },
  { name: "Acme Notion", kind: "Notion", icon: FileText, docs: 98, lastCrawl: "30m ago", weight: 1.2 },
  { name: "#support", kind: "MessageSquare", icon: MessageSquare, docs: 1240, lastCrawl: "15m ago", weight: 0.6 },
  { name: "Knowledge base", kind: "Files", icon: Database, docs: 56, lastCrawl: "4h ago", weight: 1.5 },
];

export default function Page() {
  const [topK, setTopK] = React.useState(8);
  const [rerankThreshold, setRerankThreshold] = React.useState(0.7);
  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Search}
          title="AI Search · Admin"
          subtitle="Corpus sources, crawl schedule, retrieval tuning."
          actions={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> Add source</Button>}
        />
        <div className="mb-6">
          <StatGrid
            items={[
              { label: "Sources", value: SOURCES.length.toString() },
              { label: "Documents", value: "1,990" },
              { label: "Avg recall", value: "0.84" },
              { label: "Cost / query", value: "$0.012" },
            ]}
            cols={4}
          />
        </div>
        <Tabs defaultValue="sources" className="gap-5">
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="sources" className="h-8 gap-1.5 px-3 text-xs"><Database className="size-3" /> Sources</TabsTrigger>
            <TabsTrigger value="tuning" className="h-8 gap-1.5 px-3 text-xs"><RefreshCw className="size-3" /> Retrieval tuning</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-3">
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Source</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Docs</TableHead>
                    <TableHead>Last crawl</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SOURCES.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <s.icon className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{s.kind}</Badge></TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{s.docs.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{s.lastCrawl}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.weight * 50} className="h-1 w-16" />
                          <span className="font-mono text-[10px]">{s.weight}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-7"><RefreshCw className="size-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="tuning" className="space-y-3">
            <Card className="gap-4 p-5">
              <ParamSlider
                label="Top-K retrieved"
                value={topK}
                onValueChange={setTopK}
                min={1} max={32} step={1}
                format={(v) => v.toString()}
                hint="How many chunks reach the reranker."
              />
              <ParamSlider
                label="Reranker threshold"
                value={rerankThreshold}
                onValueChange={setRerankThreshold}
                min={0} max={1} step={0.01}
                format={(v) => v.toFixed(2)}
                hint="Drop chunks below this score."
              />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reranker</p>
                <Badge variant="secondary" className="font-mono">cohere/rerank-3.5</Badge>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewContainer>
    </PreviewPage>
  );
}
