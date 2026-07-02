/**
 * Forms Feature Initialization
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { FileText, Palette, Send, Shield } from "lucide-react"
import {
    FormsGeneralSettings,
    FormsAppearanceSettings,
    FormsSubmissionSettings,
    FormsPrivacySettings,
} from "./settings"
import { registerFormsAgent } from "./agent"

registerFeatureSettings("forms", () => [
    {
        id: "forms-general",
        label: "General",
        icon: FileText,
        order: 100,
        component: FormsGeneralSettings,
    },
    {
        id: "forms-appearance",
        label: "Appearance",
        icon: Palette,
        order: 110,
        component: FormsAppearanceSettings,
    },
    {
        id: "forms-submissions",
        label: "Submissions",
        icon: Send,
        order: 120,
        component: FormsSubmissionSettings,
    },
    {
        id: "forms-privacy",
        label: "Privacy",
        icon: Shield,
        order: 130,
        component: FormsPrivacySettings,
    },
])

registerFormsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
