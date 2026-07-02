"use client"

import * as React from "react"
import { BookOpen, FileText, User, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface KnowledgeStats {
  articles: number
  documents: number
  profileEntries?: number
  workspaceContexts?: number
}

export interface KnowledgeStatsCardsProps {
  stats: KnowledgeStats
}

const TILES: Array<{
  key: keyof KnowledgeStats
  label: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
}> = [
  { key: "articles",          label: "Articles",          icon: BookOpen,    tone: "text-blue-500"   },
  { key: "documents",         label: "Documents",         icon: FileText,    tone: "text-emerald-500"},
  { key: "profileEntries",    label: "Profile entries",   icon: User,        tone: "text-purple-500" },
  { key: "workspaceContexts", label: "Workspace context", icon: Building2,   tone: "text-amber-500"  },
]

export function KnowledgeStatsCards({ stats }: KnowledgeStatsCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {TILES.map(({ key, label, icon: Icon, tone }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium">{label}</CardTitle>
            <Icon className={`h-4 w-4 ${tone}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats[key] ?? 0}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
