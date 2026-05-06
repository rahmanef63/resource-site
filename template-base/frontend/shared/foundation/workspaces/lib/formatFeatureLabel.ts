"use client"

import { featureModules, type FeatureModule } from "@/frontend/slices/industry-templates/hooks/useIndustryTemplates"
import { generateWorkspaceFeatureLabel } from "@/lib/workspaces/featureLabels"

export function formatWorkspaceFeatureLabel(featureId: string, workspaceName?: string) {
  const directMatch = featureModules[featureId as FeatureModule]
  return generateWorkspaceFeatureLabel(featureId, {
    workspaceName,
    fallbackName: directMatch?.name,
  })
}
