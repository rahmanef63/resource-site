import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Lightbulb } from "lucide-react"
import { ExampleSettings } from "./settings"
import { registerExampleAgent } from "./agent"

registerFeatureSettings("example", () => [
  {
    id: "example-general",
    label: "General",
    icon: Lightbulb,
    order: 999,
    component: ExampleSettings,
  },
])

registerExampleAgent()
