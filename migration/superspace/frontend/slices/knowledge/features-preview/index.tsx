"use client"

import * as React from "react"
import { Brain, Sparkles, BookOpen, FileText, User, Building2, Clock, Globe, Lock } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { KnowledgeStatsCards, type KnowledgeStats } from "../components"

const MOCK_STATS: KnowledgeStats = {
  articles: 24,
  documents: 41,
  profileEntries: 6,
  workspaceContexts: 3,
}

const MOCK_ARTICLES = [
  { id: "a_1", title: "Onboarding Playbook 2026",        category: "ops",      isPublic: true,  updatedAt: "2 days ago" },
  { id: "a_2", title: "RBAC Permission Matrix",           category: "security", isPublic: false, updatedAt: "5 days ago" },
  { id: "a_3", title: "Customer Tier Migration Guide",    category: "growth",   isPublic: false, updatedAt: "1 week ago" },
  { id: "a_4", title: "Brand Voice & Tone Reference",     category: "design",   isPublic: true,  updatedAt: "2 weeks ago" },
]

function KnowledgePreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Knowledge Base</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_STATS.articles} articles · {MOCK_STATS.documents} docs · AI context
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Knowledge Base</h3>
            <p className="text-xs text-muted-foreground">Articles, documents, and AI context</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> AI Context
        </Badge>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <KnowledgeStatsCards stats={MOCK_STATS} />

        <Tabs defaultValue="articles">
          <TabsList className="flex w-full justify-evenly">
            <TabsTrigger value="articles" className="gap-2"><BookOpen className="h-4 w-4" /> Articles</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
            <TabsTrigger value="profile"  className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="workspace" className="gap-2"><Building2 className="h-4 w-4" /> Workspace</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-3 space-y-2">
            {MOCK_ARTICLES.map((a) => (
              <Card key={a.id} className="cursor-pointer hover:bg-accent/30">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{a.title}</CardTitle>
                    {a.isPublic ? (
                      <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                    <span className={cn("flex items-center gap-1")}>
                      <Clock className="h-3 w-3" /> {a.updatedAt}
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "knowledge",
  name: "Knowledge Base",
  description: "Articles, documents, profile facts, and workspace context — all AI-searchable.",
  component: KnowledgePreview,
  category: "content",
  tags: ["knowledge", "articles", "documents", "ai", "context"],
  mockDataSets: [
    {
      id: "default",
      name: "Knowledge dashboard",
      description: "Stats + 4 mock articles via real KnowledgeStatsCards.",
      data: { stats: MOCK_STATS, articles: MOCK_ARTICLES },
    },
  ],
})
