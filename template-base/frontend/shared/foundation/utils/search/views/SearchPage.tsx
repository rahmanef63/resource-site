"use client"

import React, { useState } from "react"
import { Search, Clock, Star, Filter, X, Settings, History, Trash2 } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useSearch, useGlobalSearch } from "../hooks/useSearch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface SearchPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Search Page Component
 *
 * Global search interface with recent and saved searches
 */
export default function SearchPage({ workspaceId }: SearchPageProps) {
  const [query, setQuery] = useState("")
  const { isLoading, recentSearches, savedSearches } = useSearch(workspaceId)
  const { results, isLoading: isSearching } = useGlobalSearch(query, workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use search
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6 gap-6">
      <FeatureHeader
        title="Search"
        subtitle="Search across your workspace"
        primaryAction={{
          label: "Filters",
          icon: Filter,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "history",
            label: "History",
            icon: History,
            onClick: () => {},
          },
          {
            id: "clear-history",
            label: "Clear History",
            icon: Trash2,
            onClick: () => {},
          },
        ]}
      />

      {/* Search Input */}
      <div className="rounded-lg border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {query.length >= 2 ? (
          // Search Results
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isSearching ? "Searching..." : `${results.length} results for "${query}"`}
            </h3>
            {results.map((result: any, index: number) => (
              <Card key={index} className="cursor-pointer hover:bg-accent">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{result.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </div>
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Recent & Saved Searches
          <Tabs defaultValue="recent">
            <TabsList className="flex w-full justify-evenly">
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Star className="h-4 w-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : recentSearches?.length === 0 ? (
                  <p className="text-muted-foreground">No recent searches</p>
                ) : (
                  recentSearches?.map((search: any) => (
                    <div
                      key={search._id}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-accent cursor-pointer"
                      onClick={() => setQuery(search.query)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{search.query}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-4">
              <div className="space-y-2">
                {savedSearches?.length === 0 ? (
                  <p className="text-muted-foreground">No saved searches</p>
                ) : (
                  savedSearches?.map((search: any) => (
                    <div
                      key={search._id}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-accent cursor-pointer"
                      onClick={() => setQuery(search.query)}
                    >
                      <div className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{search.name || search.query}</span>
                      </div>
                      <Badge variant="secondary">{search.resultCount} results</Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
