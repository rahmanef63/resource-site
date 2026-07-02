"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"
import type { BlogPostStatus } from "../components/StatusBadge"

export interface BlogPostDoc {
  _id: Id<"blogPosts">
  workspaceId: Id<"workspaces">
  slug: string
  title: string
  body: string
  excerpt?: string
  locale: string
  status: BlogPostStatus
  category?: string
  tags: string[]
  publishedAt?: number
  scheduledFor?: number
  createdAt: number
  updatedAt: number
}

export function useBlogPosts(
  workspaceId: Id<"workspaces"> | null | undefined,
  filter: { status?: BlogPostStatus; locale?: string } = {},
) {
  const posts = useQuery(
    api.features.blog.queries.listPosts,
    workspaceId ? { workspaceId, ...filter } : "skip",
  ) as BlogPostDoc[] | undefined

  return {
    posts: posts ?? [],
    isLoading: posts === undefined && !!workspaceId,
    isEmpty: posts?.length === 0,
  }
}

export function useBlogCategories(workspaceId: Id<"workspaces"> | null | undefined) {
  const categories = useQuery(
    api.features.blog.queries.listCategories,
    workspaceId ? { workspaceId } : "skip",
  ) as Array<{ _id: Id<"blogCategories">; name: string; slug: string }> | undefined

  return {
    categories: categories ?? [],
    isLoading: categories === undefined && !!workspaceId,
  }
}

export function useBlogPostMutations() {
  const createPost = useMutation(api.features.blog.mutations.createPost)
  const publishPost = useMutation(api.features.blog.mutations.publishPost)
  const archivePost = useMutation(api.features.blog.mutations.archivePost)
  const createCategory = useMutation(api.features.blog.mutations.createCategory)

  return { createPost, publishPost, archivePost, createCategory }
}
