/**
 * Status Feature Initialization
 * Registers status settings with the shared settings registry
 *
 * Import this file at app initialization to enable status settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Camera, Eye, Lock, Image as ImageIcon } from "lucide-react"
import {
  StatusGeneralSettings,
  StatusPrivacySettings,
  StatusVisibilitySettings,
  StatusMediaSettings,
} from "./settings/StatusSettings"
import { registerStatusAgent } from "./agent"

// ============================================================================
// Register Status Settings
// ============================================================================

registerFeatureSettings("status", () => [
  {
    id: "status-general",
    label: "Status",
    icon: Camera,
    order: 300,
    component: StatusGeneralSettings,
  },
  {
    id: "status-privacy",
    label: "Privacy",
    icon: Lock,
    order: 310,
    component: StatusPrivacySettings,
  },
  {
    id: "status-visibility",
    label: "Visibility",
    icon: Eye,
    order: 320,
    component: StatusVisibilitySettings,
  },
  {
    id: "status-media",
    label: "Media",
    icon: ImageIcon,
    order: 330,
    component: StatusMediaSettings,
  },
])

registerStatusAgent()
