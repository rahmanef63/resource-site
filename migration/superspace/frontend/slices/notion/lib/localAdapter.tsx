"use client"

/**
 * Local-first data adapter for the notion block editor.
 *
 * The vendored editor reads/writes pages through the `EditorDataAdapter` seam
 * (block + page CRUD). Persistence is a whole-page blob, so all block-tree
 * manipulation is in-memory here — backed by React state + localStorage
 * (per-browser, per-workspace). No backend, no cross-tenant surface.
 *
 * ponytail: local-only. Swap this hook for a convex-backed adapter (reuse the
 * vendored _blockOps + a workspace-scoped notion_docs table) when real
 * multi-user persistence is needed.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Block, BlockType, Page } from "@notion/shared/types"
import type { EditorAdapter, EditorDataAdapter, UserProfile } from "@notion/slices/editor"
import { uid } from "@notion/shared/lib/uid"

export const HOME_PAGE_ID = "home"
export const LOCAL_USER: UserProfile = {
  id: "local", name: "You", email: "", icon: "", color: "", bio: "",
}

const STORAGE_PREFIX = "ss:notion:"

// ---- pure block-array ops (unit-tested in localAdapter.test.ts) ----

export function _insertBlock(blocks: Block[], afterIndex: number, block: Block): Block[] {
  const next = [...blocks]
  next.splice(afterIndex + 1, 0, block)
  return next
}

export function _duplicate(blocks: Block[], blockId: string, newId: string): Block[] {
  const idx = blocks.findIndex((b) => b.id === blockId)
  if (idx === -1) return blocks
  const next = [...blocks]
  next.splice(idx + 1, 0, { ...blocks[idx], id: newId })
  return next
}

export function _reorder(blocks: Block[], orderedIds: string[]): Block[] {
  const byId = new Map(blocks.map((b) => [b.id, b]))
  const seen = new Set(orderedIds)
  const out = orderedIds.map((id) => byId.get(id)).filter(Boolean) as Block[]
  // ponytail: O(n) safety net — append any block the caller forgot to order.
  for (const b of blocks) if (!seen.has(b.id)) out.push(b)
  return out
}

// ---- factories ----

function blankPage(id: string, title: string): Page {
  const now = Date.now()
  return {
    id,
    parentId: null,
    title,
    icon: "",
    blocks: [{ id: uid(), type: "paragraph", text: "" }],
    favorite: false,
    trashed: false,
    createdAt: now,
    updatedAt: now,
  }
}

function loadPages(key: string): Page[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as Page[]
  } catch {
    /* corrupt / unavailable — fall through to seed */
  }
  return []
}

function seed(): Page[] {
  return [blankPage(HOME_PAGE_ID, "Getting Started")]
}

// ---- hook ----

export function useLocalNotionAdapter(workspaceId: string, user: UserProfile = LOCAL_USER): EditorAdapter {
  const storageKey = STORAGE_PREFIX + workspaceId
  const [pages, setPages] = useState<Page[]>(seed)

  // Load on mount / workspace change.
  useEffect(() => {
    const loaded = loadPages(storageKey)
    setPages(loaded.length ? loaded : seed())
  }, [storageKey])

  // Persist on change.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(pages))
    } catch {
      /* quota — ignore, edits stay in memory */
    }
  }, [storageKey, pages])

  const patchPage = useCallback((pageId: string, fn: (p: Page) => Page) => {
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...fn(p), updatedAt: Date.now() } : p)))
  }, [])

  const data: EditorDataAdapter = useMemo(
    () => ({
      user,
      pages,
      workspaceId,
      getPage: (id) => pages.find((p) => p.id === id),
      childrenOf: (parentId) => pages.filter((p) => p.parentId === parentId && !p.trashed),

      addBlock: async (pageId, afterIndex, type: BlockType = "paragraph", init) => {
        const id = uid()
        const block = { id, type, text: "", ...(init ?? {}) } as Block
        patchPage(pageId, (p) => ({ ...p, blocks: _insertBlock(p.blocks, afterIndex, block) }))
        return id
      },
      updateBlock: async (pageId, blockId, patch) => {
        patchPage(pageId, (p) => ({
          ...p,
          blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
        }))
      },
      deleteBlock: async (pageId, blockId) => {
        patchPage(pageId, (p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== blockId) }))
      },
      duplicateBlock: async (pageId, blockId) => {
        const newId = uid()
        patchPage(pageId, (p) => ({ ...p, blocks: _duplicate(p.blocks, blockId, newId) }))
        return newId
      },
      reorderBlocks: async (pageId, orderedIds) => {
        patchPage(pageId, (p) => ({ ...p, blocks: _reorder(p.blocks, orderedIds) }))
      },
      setBlockType: async (pageId, blockId, type) => {
        patchPage(pageId, (p) => ({
          ...p,
          blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, type } : b)),
        }))
      },
      replaceBlock: async (pageId, blockId, nextBlock) => {
        patchPage(pageId, (p) => ({
          ...p,
          blocks: p.blocks.map((b) => (b.id === blockId ? nextBlock : b)),
        }))
      },

      createPage: async (parentId = null, opts) => {
        const id = uid()
        const page: Page = { ...blankPage(id, opts?.title ?? "Untitled"), ...opts, id, parentId }
        setPages((prev) => [...prev, page])
        return { id }
      },
      updatePage: async (pageId, patch) => {
        patchPage(pageId, (p) => ({ ...p, ...patch }))
      },
      deletePage: async (id) => {
        setPages((prev) => prev.filter((p) => p.id !== id))
      },
      duplicatePage: async (id) => {
        const src = pages.find((p) => p.id === id)
        if (!src) return null
        const newId = uid()
        setPages((prev) => [...prev, { ...src, id: newId, title: `${src.title} (copy)` }])
        return { id: newId }
      },
    }),
    [pages, patchPage, user, workspaceId],
  )

  return useMemo<EditorAdapter>(
    () => ({
      data,
      page: { getPage: (id: string) => pages.find((p) => p.id === id) },
      onChange: (pageId, blocks) => patchPage(pageId, (p) => ({ ...p, blocks })),
    }),
    [data, pages, patchPage],
  )
}
