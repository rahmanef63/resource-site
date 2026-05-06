/**
 * Three Column Layout Presets
 *
 * These presets capture the most common sizing + responsive patterns
 * so feature pages can stay DRY while keeping behavior consistent.
 */

import type { ThreeColumnPresetConfig, ThreeColumnPresetName } from "./types"

export const THREE_COLUMN_PRESETS: Record<ThreeColumnPresetName, ThreeColumnPresetConfig> = {
  feature: {
    leftWidth: 280,
    rightWidth: 380,
    centerMinWidth: 400,
    minSideWidth: 200,
    maxSideWidth: 600,
    collapsedWidth: 44,
    spaceDistribution: "center-priority",
    collapseRightAt: 1024,
    collapseLeftAt: 640,
    stackAt: 480,
    resizable: true,
    showCollapseButtons: true,
  },
  store: {
    leftWidth: 280,
    rightWidth: 500,
    centerMinWidth: 200,
    minSideWidth: 180,
    maxSideWidth: 1200,
    collapsedWidth: 44,
    spaceDistribution: "right-priority",
    collapseRightAt: 1024,
    collapseLeftAt: 640,
    stackAt: 480,
    resizable: true,
    showCollapseButtons: true,
  },
  admin: {
    leftWidth: 240,
    rightWidth: 380,
    centerMinWidth: 400,
    minSideWidth: 200,
    maxSideWidth: 500,
    collapsedWidth: 44,
    spaceDistribution: "center-priority",
    collapseRightAt: 1200,
    collapseLeftAt: 768,
    stackAt: 640,
    resizable: true,
    showCollapseButtons: true,
  },
  ide: {
    leftWidth: 280,
    rightWidth: 360,
    centerMinWidth: 400,
    minSideWidth: 220,
    maxSideWidth: 480,
    collapsedWidth: 44,
    spaceDistribution: "center-priority",
    collapseRightAt: 1024,
    collapseLeftAt: 768,
    stackAt: 480,
    resizable: true,
    showCollapseButtons: true,
  },
}

export function resolveThreeColumnPreset(
  preset?: ThreeColumnPresetName | ThreeColumnPresetConfig
): ThreeColumnPresetConfig {
  if (!preset) return {}
  if (typeof preset === "string") {
    return THREE_COLUMN_PRESETS[preset] ?? {}
  }
  return preset
}

