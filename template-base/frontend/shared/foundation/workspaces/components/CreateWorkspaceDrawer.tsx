"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import type { Id } from "@convex/_generated/dataModel"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { RobustOnboardingFlow } from "./RobustOnboardingFlow"
import {
  ImportAndJoinTabTriggers,
  ImportAndJoinTabContents,
  IMPORT_TAB_VALUE,
  JOIN_TAB_VALUE,
} from "./ImportAndJoinTabs"
import type { AvailableFeatureId } from "../constants"
import type { WorkspaceType } from "../types"

const WIZARD_TAB_VALUE = "wizard"
type DrawerTab = typeof WIZARD_TAB_VALUE | typeof IMPORT_TAB_VALUE | typeof JOIN_TAB_VALUE

export interface CreateWorkspaceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: WorkspaceType
  onCreated?: (workspaceId: Id<"workspaces">, enabledFeatures: AvailableFeatureId[]) => void
}

export function CreateWorkspaceDrawer({
  open,
  onOpenChange,
  initialType,
  onCreated,
}: CreateWorkspaceDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<DrawerTab>(WIZARD_TAB_VALUE)

  React.useEffect(() => {
    if (open) setActiveTab(WIZARD_TAB_VALUE)
  }, [open])

  const handleComplete = React.useCallback(
    (workspaceId: Id<"workspaces">, enabledFeatures: AvailableFeatureId[]) => {
      onCreated?.(workspaceId, enabledFeatures)
      onOpenChange(false)
    },
    [onCreated, onOpenChange],
  )

  const handleImportOrJoinDone = React.useCallback(
    (workspaceId?: Id<"workspaces">) => {
      if (workspaceId) onCreated?.(workspaceId, [])
      onOpenChange(false)
    },
    [onCreated, onOpenChange],
  )

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="modal"
      size="xl"
      mobileVariant="drawer-bottom"
      contentClassName="sm:max-w-3xl"
    >
      <ResponsiveDialog.Header className="sr-only border-b-0 p-0">
        <ResponsiveDialog.Title>Create workspace</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Create, import, or join a workspace.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="flex flex-col overflow-hidden p-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DrawerTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-4 pt-3 sm:px-6 sm:pt-4 shrink-0">
            <TabsList className="flex w-full justify-evenly gap-1 sm:max-w-[520px]">
              <TabsTrigger value={WIZARD_TAB_VALUE} className="min-w-0">
                <Sparkles className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">Create Wizard</span>
              </TabsTrigger>
              <ImportAndJoinTabTriggers />
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 relative mt-4">
            <TabsContent
              value={WIZARD_TAB_VALUE}
              className={cn(
                "absolute inset-0 overflow-hidden m-0",
                "data-[state=active]:flex flex-col",
              )}
            >
              <RobustOnboardingFlow
                variant="dialog"
                initialType={initialType}
                onComplete={handleComplete}
              />
            </TabsContent>

            <ImportAndJoinTabContents
              contentClassName="absolute inset-0 overflow-hidden px-4 pb-4 sm:px-6"
              onDone={handleImportOrJoinDone}
            />
          </div>
        </Tabs>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}
