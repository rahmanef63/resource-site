"use client"

import React, { useState } from "react"
import { Store, Package, Blocks } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemFeaturesContent } from "./SystemFeaturesContent"
import { CustomFeaturesContent } from "./CustomFeaturesContent"
import { BundleCategoriesTable } from "../../components/BundleCategoriesTable"

type FeatureTab = "system" | "bundles" | "custom"

interface FeaturesContentProps {
  features: any[]
  onItemSelect: (item: any) => void
  selectedItemId?: string
}

/**
 * FeaturesContent — Tabbed Menu Store panel
 * Consolidates System Features, Bundle Categories, and Custom Features
 * into a single section with three tabs.
 */
export function FeaturesContent({
  features,
  onItemSelect,
  selectedItemId,
}: FeaturesContentProps) {
  const [activeTab, setActiveTab] = useState<FeatureTab>("system")

  return (
    <div className="flex flex-col h-full min-h-0">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as FeatureTab)}
        className="flex flex-col h-full min-h-0"
      >
        <div className="flex-shrink-0 border-b bg-muted/20 px-4 pt-3">
          <TabsList className="flex w-full justify-evenly h-9 gap-1 bg-transparent p-0">
            <TabsTrigger
              value="system"
              className="flex items-center gap-1.5 h-8 px-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-md"
            >
              <Store className="h-3.5 w-3.5" />
              System Features
            </TabsTrigger>
            <TabsTrigger
              value="bundles"
              className="flex items-center gap-1.5 h-8 px-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-md"
            >
              <Package className="h-3.5 w-3.5" />
              Bundles
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="flex items-center gap-1.5 h-8 px-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-md"
            >
              <Blocks className="h-3.5 w-3.5" />
              Custom
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="system" className="flex-1 min-h-0 mt-0 overflow-hidden">
          <SystemFeaturesContent
            onItemSelect={onItemSelect}
            selectedItemId={selectedItemId}
          />
        </TabsContent>

        <TabsContent value="bundles" className="flex-1 min-h-0 mt-0 overflow-auto">
          <div className="p-4">
            <BundleCategoriesTable
              onItemSelect={onItemSelect}
              selectedItemId={selectedItemId}
            />
          </div>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 min-h-0 mt-0 overflow-auto">
          <CustomFeaturesContent
            features={features}
            onItemSelect={onItemSelect}
            selectedItemId={selectedItemId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
