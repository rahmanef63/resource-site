"use client"

import { StatusBadge, type BlogPostStatus } from "./StatusBadge"

export interface BlogPostListItem {
  id: string
  title: string
  excerpt?: string
  status: BlogPostStatus
  category?: string
  tags: string[]
  publishedAt: number | null
  locale: string
}

export function PostList({ posts }: { posts: BlogPostListItem[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada artikel. Klik "Tulis artikel" untuk membuat yang pertama.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-md border">
      {posts.map((p) => (
        <li key={p.id} className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium truncate">{p.title}</h3>
              <StatusBadge status={p.status} />
            </div>
            {p.excerpt ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{p.excerpt}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {p.category ? (
                <span className="rounded bg-muted px-1.5 py-0.5">{p.category}</span>
              ) : null}
              {p.tags.map((t) => (
                <span key={t} className="text-muted-foreground/80">#{t}</span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
