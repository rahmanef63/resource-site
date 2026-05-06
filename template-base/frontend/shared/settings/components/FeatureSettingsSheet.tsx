"use client"

/**
 * Feature Settings Sheet
 *
 * A slide-over sheet that displays feature-specific settings.
 * Opens from the right side of the screen.
 */

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { FeatureSettingsPanel } from "./FeatureSettingsPanel"
import { useIsMobile } from "@/hooks/use-mobile"

export interface FeatureSettingsSheetProps {
  /** Whether the sheet is open */
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

/**
 * Sheet wrapper for feature settings
 *
 * @example
 * ```tsx
 * <FeatureSettingsSheet
 *   open={settingsOpen}
 *   onOpenChange={setSettingsOpen}
 *   featureSlug="chat"
 *   featureName="Chat"
 * />
 * ```
 */
export function FeatureSettingsSheet({
  open,
  onOpenChange,
  featureSlug,
  featureName,
  defaultCategory,
}: FeatureSettingsSheetProps) {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{featureName || featureSlug} Settings</SheetTitle>
          <SheetDescription>
            Configure settings for {featureName || featureSlug}
          </SheetDescription>
        </SheetHeader>
        <FeatureSettingsPanel
          featureSlug={featureSlug}
          featureName={featureName}
          defaultCategory={defaultCategory}
          onClose={() => onOpenChange(false)}
          showBackButton={false}
          className="h-full"
        />
      </SheetContent>
    </Sheet>
  )
}
