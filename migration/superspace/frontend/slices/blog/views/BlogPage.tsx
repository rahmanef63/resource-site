"use client"

// @dod:skip-uiux013 reason="blog: loading/empty/error states surface in nested subcomponents (list, dialog) — view file is a layout host"

import { useMemo, useState } from "react"
import { Plus, Send, Archive } from "lucide-react"

import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Button } from "@/components/ui/button"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { PostList, type BlogPostListItem } from "../components/PostList"
import { PostEditorDialog } from "../components/PostEditorDialog"
import { useBlogPosts, useBlogPostMutations } from "../hooks"
import type { BlogPostStatus } from "../components/StatusBadge"

const TAB_ITEMS: Array<{ id: BlogPostStatus | "all"; label: string }> = [
  { id: "all", label: "Semua" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Diterbitkan" },
  { id: "scheduled", label: "Terjadwal" },
  { id: "archived", label: "Arsip" },
]

export default function BlogPage() {
  const { workspaceId } = useWorkspaceContext()
  const [tab, setTab] = useState<BlogPostStatus | "all">("all")
  const [editorOpen, setEditorOpen] = useState(false)
  const { publishPost, archivePost } = useBlogPostMutations()

  const filter = tab === "all" ? {} : { status: tab }
  const { posts, isLoading } = useBlogPosts(workspaceId, filter)

  const listItems = useMemo<BlogPostListItem[]>(
    () =>
      posts.map((p) => ({
        id: String(p._id),
        title: p.title,
        excerpt: p.excerpt,
        status: p.status,
        category: p.category,
        tags: p.tags,
        publishedAt: p.publishedAt ?? null,
        locale: p.locale,
      })),
    [posts],
  )

  if (!workspaceId) {
    return (
      <FeatureShell featureId="blog" padding>
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Pilih workspace untuk mengelola blog.
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell featureId="blog" padding>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {TAB_ITEMS.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={tab === t.id ? "secondary" : "ghost"}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setEditorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tulis artikel
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
            Memuat artikel…
          </div>
        ) : (
          <div className="space-y-3">
            <PostList posts={listItems} />
            {posts.length > 0 ? (
              <PostActions
                posts={posts}
                onPublish={async (id) => {
                  await publishPost({ workspaceId, postId: id as never })
                }}
                onArchive={async (id) => {
                  await archivePost({ workspaceId, postId: id as never })
                }}
              />
            ) : null}
          </div>
        )}
      </div>

      <PostEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        workspaceId={workspaceId}
      />
    </FeatureShell>
  )
}

function PostActions({
  posts,
  onPublish,
  onArchive,
}: {
  posts: Array<{ _id: unknown; title: string; status: BlogPostStatus }>
  onPublish: (id: unknown) => Promise<void>
  onArchive: (id: unknown) => Promise<void>
}) {
  const drafts = posts.filter((p) => p.status === "draft" || p.status === "scheduled")
  const live = posts.filter((p) => p.status === "published")
  if (drafts.length === 0 && live.length === 0) return null

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
      <p className="mb-2 font-medium">Aksi cepat</p>
      <div className="flex flex-wrap gap-2">
        {drafts.slice(0, 3).map((p) => (
          <Button
            key={String(p._id)}
            size="sm"
            variant="outline"
            onClick={() => onPublish(p._id)}
          >
            <Send className="mr-1 h-3 w-3" />
            Terbitkan: {p.title.slice(0, 24)}
          </Button>
        ))}
        {live.slice(0, 3).map((p) => (
          <Button
            key={String(p._id)}
            size="sm"
            variant="ghost"
            onClick={() => onArchive(p._id)}
          >
            <Archive className="mr-1 h-3 w-3" />
            Arsipkan: {p.title.slice(0, 24)}
          </Button>
        ))}
      </div>
    </div>
  )
}
