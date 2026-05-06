"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, Search, MessageSquare, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface StarredViewProps {
  workspaceId?: Id<"workspaces"> | null
}

interface StarredItem {
  id: string
  type: "message" | "document"
  content?: string
  title?: string
  preview?: string
  author: string
  timestamp: Date
  channel?: string
}

export function StarredView({ workspaceId }: StarredViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "messages" | "documents">("all")

  // TODO: Query starred items from Convex
  // const starredMessages = useQuery(api.features.chat.queries.getStarredMessages,
  //   workspaceId ? { workspaceId } : "skip")
  // const starredDocuments = useQuery(api.features.docs.queries.getStarredDocuments,
  //   workspaceId ? { workspaceId } : "skip")

  // Mock data for now - will be replaced when backend is ready
  const starredItems: StarredItem[] = [
    {
      id: "1",
      type: "message",
      content: "Great work on the presentation! The client loved it.",
      author: "John Doe",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      channel: "#general",
    },
    {
      id: "2",
      type: "document",
      title: "Q4 Planning Document",
      preview: "Strategic planning for the upcoming quarter...",
      author: "Jane Smith",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "message",
      content: "Don't forget the deadline is tomorrow!",
      author: "Mike Johnson",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      channel: "Project Alpha",
    },
    {
      id: "4",
      type: "document",
      title: "API Documentation",
      preview: "Complete API reference and usage examples...",
      author: "Sarah Wilson",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]

  const filteredItems = starredItems.filter((item: StarredItem) => {
    const matchesSearch =
      searchQuery === "" ||
      (item.type === "message" && item.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === "document" &&
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.preview?.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesFilter =
      filterType === "all" ||
      (filterType === "messages" && item.type === "message") ||
      (filterType === "documents" && item.type === "document")

    return matchesSearch && matchesFilter
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return MessageSquare
      case "document":
        return FileText
      default:
        return Star
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              Starred Items
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Important messages and documents you've starred
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search starred items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "messages" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("messages")}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Messages
            </Button>
            <Button
              variant={filterType === "documents" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("documents")}
            >
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </Button>
          </div>
        </div>
      </div>

      {/* Starred Items List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery || filterType !== "all"
                  ? "No items found"
                  : "No starred items yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Star messages and documents to find them here later"}
              </p>
            </div>
          ) : (
            filteredItems.map((item: StarredItem) => {
              const Icon = getIcon(item.type)
              return (
                <Card key={item.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      {item.type === "message" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.author}</span>
                              {item.channel && (
                                <span className="text-xs text-muted-foreground">
                                  in {item.channel}
                                </span>
                              )}
                            </div>
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <p className="text-sm">{item.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{item.title}</h3>
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <p className="text-sm text-muted-foreground">{item.preview}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>by {item.author}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
