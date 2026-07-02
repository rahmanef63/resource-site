/**
 * Content Feature Initialization
 * Registers content settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Library } from "lucide-react"
import { ContentSettings } from "./settings"
import { registerContentAgent } from "./agent"

registerFeatureSettings("content", () => [
  {
    id: "content-general",
    label: "Content",
    icon: Library,
    order: 100,
    component: ContentSettings,
  },
])

registerContentAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
