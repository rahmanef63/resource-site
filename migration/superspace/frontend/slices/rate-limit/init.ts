/**
 * rate-limit slice init — backend-only infra slice. Registers a minimal
 * agent + settings stub for surface parity; the real work is the Convex
 * `consume` internalMutation + 5-min prune cron.
 */
import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Gauge } from "lucide-react"
import { RateLimitSettings } from "./settings"
import { registerRateLimitAgent } from "./agent"

registerFeatureSettings("rate-limit", () => [
  {
    id: "rate-limit-general",
    label: "General",
    icon: Gauge,
    order: 999,
    component: RateLimitSettings,
  },
])

registerRateLimitAgent()
