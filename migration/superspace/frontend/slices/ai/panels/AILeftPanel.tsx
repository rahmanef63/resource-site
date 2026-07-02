"use client"

/**
 * AI Left Panel - Sessions List
 * 
 * Left column panel for the AI feature.
 * Displays the list of AI chat sessions with search, filtering, and CRUD operations.
 */

import { useState, useCallback } from "react"
import { Plus, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { SearchBar } from "@/frontend/shared/ui"
import { useAIStore, type AISession } from "../stores"
import { useAIActions } from "../hooks"
import { GlobalModeToggle } from "@/frontend/shared/ui/components/controls"
import { AIChatListCard } from "../components/AIChatListCard"
import { RenameSessionDialog, DeleteSessionDialog, ArchiveSessionDialog } from "../components/AIDialogs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

// ============================================================================
// Types
// ============================================================================

export interface AILeftPanelProps {
  /** Currently selected session ID */
  selectedSessionId?: string | null
  /** Callback when a session is selected */
  onSessionSelect?: (sessionId: string) => void
  /** Optional className for styling */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function AILeftPanel({
  selectedSessionId: externalSelectedId,
  onSessionSelect,
  className,
}: AILeftPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Store state
  const sessions = useAIStore((s) => s.sessions)
  const isLoading = useAIStore((s) => s.isLoading)
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId)
  const globalMode = useAIStore((s) => s.globalMode)
  const setGlobalMode = useAIStore((s) => s.setGlobalMode)
  const pinSession = useAIStore((s) => s.pinSession)
  const favoriteSession = useAIStore((s) => s.favoriteSession)
  const archiveSession = useAIStore((s) => s.archiveSession)
  const renameSession = useAIStore((s) => s.renameSession)
  const removeSession = useAIStore((s) => s.removeSession)
  const { createSession, selectSession } = useAIActions()

  // CRUD Dialog states
  const [renamingSession, setRenamingSession] = useState<AISession | null>(null)
  const [deletingSession, setDeletingSession] = useState<AISession | null>(null)
  const [archivingSession, setArchivingSession] = useState<AISession | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Convex mutations
  const updateSessionMutation = useMutation(api.features.ai.mutations.updateChatSession)
  const deleteSessionMutation = useMutation(api.features.ai.mutations.deleteChatSession)

  // Use external or store selectedSessionId
  const selectedSessionId = externalSelectedId ?? storeSelectedSessionId

  const hasRealData = sessions.length > 0

  // Filter sessions
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.messages[session.messages.length - 1]?.content ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ============================================================================
  // CRUD Handlers
  // ============================================================================

  const handleRename = useCallback((session: AISession) => {
    setRenamingSession(session)
  }, [])

  const handleSaveRename = useCallback(async (sessionId: string, data: { name?: string; description?: string }) => {
    setIsUpdating(true)
    try {
      await updateSessionMutation({
        sessionId: sessionId as Id<"aiChatSessions">,
        title: data.name,
      })
      renameSession(sessionId as Id<"aiChatSessions">, data.name || "Untitled", data.description)
      toast.success("Session renamed")
    } catch (e) {
      console.error("Failed to rename session:", e)
      toast.error("Failed to rename session")
    } finally {
      setIsUpdating(false)
      setRenamingSession(null)
    }
  }, [updateSessionMutation, renameSession])

  const handlePin = useCallback(async (sessionId: string, isPinned: boolean) => {
    try {
      await updateSessionMutation({
        sessionId: sessionId as Id<"aiChatSessions">,
        status: isPinned ? "pinned" : "active",
      })
      pinSession(sessionId as Id<"aiChatSessions">, isPinned)
    } catch (e) {
      console.error("Failed to pin session:", e)
      toast.error("Failed to update session")
    }
  }, [updateSessionMutation, pinSession])

  const handleFavorite = useCallback(async (sessionId: string, isFavorite: boolean) => {
    try {
      await updateSessionMutation({
        sessionId: sessionId as Id<"aiChatSessions">,
        status: isFavorite ? "favorite" : "active",
      })
      favoriteSession(sessionId as Id<"aiChatSessions">, isFavorite)
    } catch (e) {
      console.error("Failed to favorite session:", e)
      toast.error("Failed to update session")
    }
  }, [updateSessionMutation, favoriteSession])

  const handleArchive = useCallback((sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId)
    if (session) {
      setArchivingSession(session)
    }
  }, [sessions])

  const handleConfirmArchive = useCallback(async (sessionId: string, isArchived: boolean) => {
    setIsUpdating(true)
    try {
      await updateSessionMutation({
        sessionId: sessionId as Id<"aiChatSessions">,
        status: isArchived ? "archived" : "active",
      })
      archiveSession(sessionId as Id<"aiChatSessions">, isArchived)
      toast.success(isArchived ? "Session archived" : "Session unarchived")
    } catch (e) {
      console.error("Failed to archive session:", e)
      toast.error("Failed to archive session")
    } finally {
      setIsUpdating(false)
      setArchivingSession(null)
    }
  }, [updateSessionMutation, archiveSession])

  const handleDelete = useCallback((sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId)
    if (session) {
      setDeletingSession(session)
    }
  }, [sessions])

  const handleConfirmDelete = useCallback(async (sessionId: string) => {
    setIsUpdating(true)
    try {
      await deleteSessionMutation({
        sessionId: sessionId as Id<"aiChatSessions">,
      })
      removeSession(sessionId as Id<"aiChatSessions">)
      toast.success("Session deleted")
    } catch (e) {
      console.error("Failed to delete session:", e)
      toast.error("Failed to delete session")
    } finally {
      setIsUpdating(false)
      setDeletingSession(null)
    }
  }, [deleteSessionMutation, removeSession])

  const handleDuplicate = useCallback(async (session: AISession) => {
    setIsCreating(true)
    try {
      const newSession = await createSession(`${session.title} (Copy)`)
      if (newSession) {
        toast.success("Session duplicated")
      }
    } catch (e) {
      console.error("Failed to duplicate session:", e)
      toast.error("Failed to duplicate session")
    } finally {
      setIsCreating(false)
    }
  }, [createSession])

  const handleExport = useCallback((session: AISession) => {
    try {
      const exportData = {
        title: session.title,
        topic: session.topic,
        messages: session.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).toISOString(),
        })),
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${session.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-export.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Session exported")
    } catch (e) {
      console.error("Failed to export session:", e)
      toast.error("Failed to export session")
    }
  }, [])

  const handleNewChat = async () => {
    setIsCreating(true)
    try {
      const session = await createSession("New Chat")
      if (session && onSessionSelect) {
        onSessionSelect(session._id)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    selectSession(sessionId as any)
    onSessionSelect?.(sessionId)
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <PanelSection label="AI sessions" className={cn(className)}>
      <PanelSection.Header className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Sessions</h2>
          </div>
          <div className="flex items-center gap-2">
            <GlobalModeToggle
              isGlobal={globalMode}
              onToggle={setGlobalMode}
              label="Global"
              size="sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNewChat}
              disabled={isCreating}
              title="New Chat"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <SearchBar
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </PanelSection.Header>

      <PanelSection.Items>
        <ScrollArea className="h-full">
        <div className="p-2 space-y-1">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading sessions...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasRealData && !searchQuery && (
            <div className="p-6 text-center">
              <div className="h-14 w-14 mx-auto mb-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {globalMode
                  ? "Personal AI chats not tied to any workspace."
                  : "Get help with writing, coding, and more."}
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleNewChat}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New Chat
              </Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery && filteredSessions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No sessions found
            </div>
          )}

          {/* Session Cards */}
          {!isLoading && hasRealData && (
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <AIChatListCard
                  key={session._id}
                  session={session}
                  isActive={session._id === selectedSessionId}
                  onClick={() => handleSessionSelect(session._id)}
                  onRename={handleRename}
                  onPin={handlePin}
                  onFavorite={handleFavorite}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </div>
        </ScrollArea>
      </PanelSection.Items>

      {/* CRUD Dialogs */}
      <RenameSessionDialog
        session={renamingSession}
        isOpen={!!renamingSession}
        onClose={() => setRenamingSession(null)}
        onSave={handleSaveRename}
        isLoading={isUpdating}
      />
      <DeleteSessionDialog
        session={deletingSession}
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isUpdating}
      />
      <ArchiveSessionDialog
        session={archivingSession}
        isOpen={!!archivingSession}
        onClose={() => setArchivingSession(null)}
        onConfirm={handleConfirmArchive}
        isLoading={isUpdating}
      />
    </PanelSection>
  )
}
