/**
 * Contacts Feature Initialization
 * Registers contacts settings with the shared settings registry
 *
 * Import this file at app initialization to enable contacts settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Contact } from "lucide-react"
import { ContactSettings } from "./settings"
import { registerContactsAgent } from "./agent"

// ============================================================================
// Register Contacts Settings
// ============================================================================

registerFeatureSettings("contacts", () => [
    {
        id: "contacts-general",
        label: "Contacts",
        icon: Contact,
        order: 500,
        component: ContactSettings,
    },
])

registerContactsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
