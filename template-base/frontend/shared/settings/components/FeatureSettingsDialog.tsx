"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { FeatureSettingsPanel } from "./FeatureSettingsPanel"
import { useIsMobile } from "@/hooks/use-mobile"

export interface FeatureSettingsDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Feature slug to filter settings for */
  featureSlug: string
  /** Feature display name */
  featureName?: string
  /** Default category to show */
  defaultCategory?: string
}

export function FeatureSettingsDialog({
  open,
  onOpenChange,
  featureSlug,
  featureName,
  defaultCategory,
}: FeatureSettingsDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{featureName || featureSlug} Settings</DrawerTitle>
            <DrawerDescription>
              Configure settings for {featureName || featureSlug}
            </DrawerDescription>
          </DrawerHeader>
          <FeatureSettingsPanel
            featureSlug={featureSlug}
            featureName={featureName}
            defaultCategory={defaultCategory}
            onClose={() => onOpenChange(false)}
            showBackButton={false}
            className="h-full"
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{featureName || featureSlug} Settings</DialogTitle>
          <DialogDescription>
            Configure settings for {featureName || featureSlug}
          </DialogDescription>
        </DialogHeader>
        <FeatureSettingsPanel
          featureSlug={featureSlug}
          featureName={featureName}
          defaultCategory={defaultCategory}
          onClose={() => onOpenChange(false)}
          showBackButton={false}
          className="h-full"
        />
      </DialogContent>
    </Dialog>
  )
}
