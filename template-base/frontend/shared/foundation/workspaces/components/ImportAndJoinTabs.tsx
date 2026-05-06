"use client"

import * as React from "react"
import { KeyRound, Upload } from "lucide-react"

import type { Id } from "@convex/_generated/dataModel"
import { TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { ImportWorkspacePanel } from "./ImportWorkspacePanel"
import { JoinWorkspacePanel } from "./JoinWorkspacePanel"

/**
 * SSOT for the "Import Workspace" and "Workspace ID" tabs used by every
 * create-workspace surface (workspace store dialog + sidebar switcher drawer).
 *
 * Keep the tab values in sync across consumers via the exported constants.
 */
export const IMPORT_TAB_VALUE = "import"
export const JOIN_TAB_VALUE = "join"

export const IMPORT_TAB_LABEL = "Import Workspace"
export const JOIN_TAB_LABEL = "Workspace ID"

export interface ImportAndJoinTabTriggersProps {
    triggerClassName?: string
}

/**
 * Renders the two `<TabsTrigger>` entries. Must be rendered inside a
 * shadcn `<Tabs>` + `<TabsList>` parent.
 */
export function ImportAndJoinTabTriggers({ triggerClassName }: ImportAndJoinTabTriggersProps) {
    return (
        <>
            <TabsTrigger value={IMPORT_TAB_VALUE} className={cn("min-w-0", triggerClassName)}>
                <Upload className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">{IMPORT_TAB_LABEL}</span>
            </TabsTrigger>
            <TabsTrigger value={JOIN_TAB_VALUE} className={cn("min-w-0", triggerClassName)}>
                <KeyRound className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">{JOIN_TAB_LABEL}</span>
            </TabsTrigger>
        </>
    )
}

export interface ImportAndJoinTabContentsProps {
    /** Called after a successful import or join; typically closes the dialog. */
    onDone: (workspaceId?: Id<"workspaces">) => void
    contentClassName?: string
    scrollClassName?: string
    importActionLabel?: string
    joinActionLabel?: string
}

/**
 * Renders the two `<TabsContent>` panels. Must be rendered inside a
 * shadcn `<Tabs>` parent (outside `<TabsList>`).
 */
export function ImportAndJoinTabContents({
    onDone,
    contentClassName,
    scrollClassName,
    importActionLabel = "Import Workspace",
    joinActionLabel = "Join Workspace",
}: ImportAndJoinTabContentsProps) {
    return (
        <>
            <TabsContent
                value={IMPORT_TAB_VALUE}
                className={cn("data-[state=active]:flex flex-col m-0", contentClassName)}
            >
                <ScrollArea className={cn("flex-1 min-h-0", scrollClassName)}>
                    <div className="pr-2 pt-2">
                        <ImportWorkspacePanel
                            actionLabel={importActionLabel}
                            onImported={(workspaceId) => onDone(workspaceId)}
                        />
                    </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent
                value={JOIN_TAB_VALUE}
                className={cn("data-[state=active]:flex flex-col m-0", contentClassName)}
            >
                <ScrollArea className={cn("flex-1 min-h-0", scrollClassName)}>
                    <div className="pr-2 pt-2">
                        <JoinWorkspacePanel
                            actionLabel={joinActionLabel}
                            onJoined={(workspaceId) => onDone(workspaceId)}
                        />
                    </div>
                </ScrollArea>
            </TabsContent>
        </>
    )
}
