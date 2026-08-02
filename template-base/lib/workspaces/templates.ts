import { getAllBundles } from "@/frontend/shared/foundation/workspaces/constants/bundles"

export interface WorkspaceTemplate {
  id: string
  bundleId: string
  name: string
  description: string
  features: string[]
  category: string
  recommendedFor: string[]
}

export function getAvailableWorkspaceTemplates(): WorkspaceTemplate[] {
  return getAllBundles()
    .filter((bundle) => bundle.id !== "custom")
    .map((bundle) => ({
      id: bundle.id,
      bundleId: bundle.id,
      name: bundle.name,
      description: bundle.description,
      features: [...bundle.features.core, ...bundle.features.recommended],
      category: bundle.category,
      recommendedFor: bundle.recommendedFor,
    }))
}
