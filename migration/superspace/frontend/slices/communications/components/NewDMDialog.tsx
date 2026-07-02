/**
 * New DM Dialog
 * 
 * Dialog component for starting a new direct message conversation.
 * Provides 3 tabs: Contacts, Members, and AI Chat.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import {
    Contact,
    Users,
    Bot,
    Search,
    MessageCircle,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveDialog } from "@/frontend/shared/ui"

// Communications store
import { useCommunicationsStore } from "../shared"
import { useDirectMessageMutations } from "../hooks/useDirectMessages"
import { useCommunicationWorkspace } from "../hooks/useCommunicationWorkspace"

// Contacts API (formerly Contacts)
import { useContactsApi } from "@/frontend/slices/contacts"

import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceMembers } from "@/frontend/shared/foundation/workspaces/api"
import type { WorkspaceMemberSummary } from "@/frontend/shared/foundation/workspaces/types"

// Helper function to get initials
const getInitials = (name?: string | null, email?: string | null): string => {
    if (name && name.trim()) {
        const words = name.trim().split(" ")
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase()
        }
        return words[0].substring(0, 2).toUpperCase()
    }
    if (email) {
        return email.substring(0, 2).toUpperCase()
    }
    return "U"
}

// AI Bot types for starting AI chat
const AI_BOTS = [
    {
        id: "assistant",
        name: "AI Assistant",
        description: "General purpose assistant",
        icon: "Bot",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        id: "writer",
        name: "Writing Helper",
        description: "Help with writing and content",
        icon: "Sparkles",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        id: "coder",
        name: "Code Assistant",
        description: "Help with coding tasks",
        icon: "Bot",
        gradient: "from-green-500 to-emerald-500"
    },
]

interface NewDMDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NewDMDialog({ open, onOpenChange }: NewDMDialogProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("contacts")

    // Store actions
    const addDirectConversation = useCommunicationsStore(state => state.addDirectConversation)
    const selectDirectConversation = useCommunicationsStore(state => state.selectDirectConversation)
    const setViewMode = useCommunicationsStore(state => state.setViewMode)

    // Backend mutations
    const { createConversation } = useDirectMessageMutations()
    const [isCreating, setIsCreating] = React.useState(false)

    // Get contacts (Contacts)
    const { Contacts } = useContactsApi()

    // Get workspace members from the active communications workspace
    const { activeWorkspaceId } = useCommunicationWorkspace()
    const workspaceMembers = useWorkspaceMembers(activeWorkspaceId)

    // Filter contacts by search
    const filteredContacts = React.useMemo(() => {
        if (!Contacts) return []
        if (!searchQuery.trim()) return Contacts
        const query = searchQuery.toLowerCase()
        return Contacts.filter((f: any) =>
            f.Contact?.name?.toLowerCase().includes(query) ||
            f.Contact?.email?.toLowerCase().includes(query)
        )
    }, [Contacts, searchQuery])

    // Filter members by search
    const filteredMembers = React.useMemo(() => {
        if (!workspaceMembers) return []
        if (!searchQuery.trim()) return workspaceMembers
        const query = searchQuery.toLowerCase()
        return workspaceMembers.filter((m: WorkspaceMemberSummary) =>
            m.name?.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query)
        )
    }, [workspaceMembers, searchQuery])

    // Filter AI bots by search
    const filteredBots = React.useMemo(() => {
        if (!searchQuery.trim()) return AI_BOTS
        const query = searchQuery.toLowerCase()
        return AI_BOTS.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        )
    }, [searchQuery])

    const handleSelectContact = async (contact: any) => {
        if (isCreating) return
        setIsCreating(true)

        try {
            const participantId = contact.Contact?._id || contact._id

            // Call backend to create or get existing conversation
            const conversationId = await createConversation({
                participantIds: [participantId as Id<"users">],
                workspaceId: activeWorkspaceId ?? undefined,
            })

            if (conversationId) {
                selectDirectConversation(String(conversationId))
                setViewMode("dm")
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create conversation:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSelectMember = async (member: any) => {
        if (isCreating) return
        setIsCreating(true)

        try {
            // Call backend to create or get existing conversation
            const conversationId = await createConversation({
                participantIds: [member.userId as Id<"users">],
                workspaceId: activeWorkspaceId ?? undefined,
            })

            if (conversationId) {
                selectDirectConversation(String(conversationId))
                setViewMode("dm")
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create conversation:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSelectAI = (bot: typeof AI_BOTS[0]) => {
        const botId = `ai-${bot.id}`
        // Create AI DM conversation
        const newConversation = {
            id: `dm-ai-${bot.id}-${Date.now()}`,
            type: "direct" as const,
            isAI: true,
            aiModel: bot.id,
            participants: [
                {
                    id: botId,
                    conversationId: `dm-ai-${bot.id}-${Date.now()}`,
                    userId: botId,
                    user: {
                        id: botId,
                        name: bot.name,
                        avatar: undefined,
                        status: "online" as const,
                    },
                    joinedAt: new Date().toISOString(),
                    isBot: true,
                }
            ],
            participantIds: [botId],
            createdBy: "current-user",
            name: bot.name,
            createdAt: new Date().toISOString(),
        }

        addDirectConversation(newConversation)
        selectDirectConversation(newConversation.id)
        setViewMode("dm")
        onOpenChange(false)
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md" contentClassName="sm:max-w-[500px]">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    New Message
                </ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    Start a conversation with a contact, team member, or AI assistant
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="flex flex-col overflow-hidden">
                {/* Search */}
                <div className="px-4 pt-3 pb-2 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full justify-evenly rounded-none border-b bg-transparent px-4">
                        <TabsTrigger
                            value="contacts"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Contact className="h-4 w-4 mr-2" />
                            Contacts
                            {Contacts?.length ? (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                                    {Contacts.length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Members
                            {workspaceMembers?.length ? (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                                    {workspaceMembers.length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Bot className="h-4 w-4 mr-2" />
                            AI Chat
                        </TabsTrigger>
                    </TabsList>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredContacts.length === 0 ? (
                                    <EmptyState
                                        icon={Contact}
                                        title="No contacts found"
                                        description={searchQuery ? "Try a different search" : "Add contacts to message them"}
                                    />
                                ) : (
                                    filteredContacts.map((contact: any) => (
                                        <PersonItem
                                            key={contact._id}
                                            name={contact.Contact?.name}
                                            email={contact.Contact?.email}
                                            image={contact.Contact?.image}
                                            onClick={() => handleSelectContact(contact)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredMembers.length === 0 ? (
                                    <EmptyState
                                        icon={Users}
                                        title="No members found"
                                        description={searchQuery ? "Try a different search" : "No workspace members available"}
                                    />
                                ) : (
                                    filteredMembers.map((member: any) => (
                                        <PersonItem
                                            key={member.userId}
                                            name={member.name}
                                            email={member.email}
                                            image={member.image}
                                            badge={member.role?.name}
                                            onClick={() => handleSelectMember(member)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* AI Chat Tab */}
                    <TabsContent value="ai" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredBots.length === 0 ? (
                                    <EmptyState
                                        icon={Bot}
                                        title="No AI assistants found"
                                        description="Try a different search"
                                    />
                                ) : (
                                    filteredBots.map((bot) => (
                                        <AIBotItem
                                            key={bot.id}
                                            bot={bot}
                                            onClick={() => handleSelectAI(bot)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </ResponsiveDialog.Body>
        </ResponsiveDialog>
    )
}

// ============================================================================
// Sub-components
// ============================================================================

interface PersonItemProps {
    name?: string | null
    email?: string | null
    image?: string | null
    badge?: string
    subtitle?: string
    onClick: () => void
}

function PersonItem({ name, email, image, badge, subtitle, onClick }: PersonItemProps) {
    const trimmedName = name?.trim() || null
    const trimmedEmail = email?.trim() || null
    const displayName = trimmedName || trimmedEmail || "Unknown member"
    const metaLine =
        subtitle ||
        [
            trimmedEmail && trimmedEmail !== displayName ? trimmedEmail : null,
            badge || null,
        ]
            .filter(Boolean)
            .join(" • ") ||
        "Workspace member"

    return (
        <button
            onClick={onClick}
            className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-background/40 px-3 py-3 text-left transition-colors hover:border-border/80 hover:bg-muted/40"
        >
            <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={image || undefined} />
                <AvatarFallback className="font-medium">
                    {getInitials(trimmedName, trimmedEmail)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{displayName}</span>
                    {badge && trimmedName && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">
                            {badge}
                        </Badge>
                    )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{metaLine}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-colors group-hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
            </div>
        </button>
    )
}

interface AIBotItemProps {
    bot: typeof AI_BOTS[0]
    onClick: () => void
}

function AIBotItem({ bot, onClick }: AIBotItemProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-muted/50 transition-colors text-left"
        >
            <div className={cn(
                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center",
                bot.gradient
            )}>
                {bot.icon === "Sparkles" ? (
                    <Sparkles className="h-5 w-5 text-white" />
                ) : (
                    <Bot className="h-5 w-5 text-white" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium">{bot.name}</div>
                <p className="text-xs text-muted-foreground">{bot.description}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </button>
    )
}

interface EmptyStateProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    )
}

export default NewDMDialog
