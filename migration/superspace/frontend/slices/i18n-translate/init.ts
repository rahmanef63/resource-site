import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Languages } from "lucide-react"
import { I18nTranslateSettings } from "./settings"
import { registerI18nTranslateAgent } from "./agent"

registerFeatureSettings("i18n-translate", () => [
  {
    id: "i18n-translate-general",
    label: "General",
    icon: Languages,
    order: 999,
    component: I18nTranslateSettings,
  },
])

registerI18nTranslateAgent()
