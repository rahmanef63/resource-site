/**
 * Store Feature Initialization — host for workspace-store + menu-store tabs.
 *
 * Child slices (workspace-store, menus) still register their own settings +
 * agents via their init.ts files (auto-imported by initFeatureSettings.ts).
 * Store registers a minimal settings + agent surface of its own to satisfy
 * the mandatory slice scaffold; child slice surfaces remain canonical.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Store } from "lucide-react"
import { StoreSettings } from "./settings"
import { registerStoreAgent } from "./agent"

registerFeatureSettings("store", () => [
  {
    id: "store-general",
    label: "General",
    icon: Store,
    order: 999,
    component: StoreSettings,
  },
])

registerStoreAgent()
