"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { PreviewPage, PreviewHeader } from "@/components/site/preview-kit";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TAB_LIST } from "./mock-data";
import {
  ProvidersTab,
  ModelsTab,
  InstructionsTab,
  SkillsTab,
} from "./tabs-catalog";
import { ToolsTab, AgentsTab, BudgetsTab, AuditTab } from "./tabs-ops";

export default function Page() {
  return (
    <PreviewPage>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <PreviewHeader
          icon={ShieldCheck}
          title="AI Admin"
          subtitle="Manage providers, models, skills, tools, and agents. Single console for the whole AI stack."
          actions={
            <Badge variant="outline" className="border-info/40 bg-info/10 text-info">
              SUPERADMIN
            </Badge>
          }
        />

        <Tabs defaultValue="providers" className="gap-5">
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/30 p-1">
            {TAB_LIST.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="h-8 gap-1.5 px-3 text-xs">
                  <Icon className="size-3" /> {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="providers"><ProvidersTab /></TabsContent>
          <TabsContent value="models"><ModelsTab /></TabsContent>
          <TabsContent value="instructions"><InstructionsTab /></TabsContent>
          <TabsContent value="skills"><SkillsTab /></TabsContent>
          <TabsContent value="tools"><ToolsTab /></TabsContent>
          <TabsContent value="agents"><AgentsTab /></TabsContent>
          <TabsContent value="budgets"><BudgetsTab /></TabsContent>
          <TabsContent value="audit"><AuditTab /></TabsContent>
        </Tabs>
      </div>
    </PreviewPage>
  );
}
