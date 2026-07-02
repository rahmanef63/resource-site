/**
 * AI Feature Initialization
 * Registers AI settings with the shared settings registry
 * and initializes the sub-agent system.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Bot, Sliders, Shield, Sparkles, Key } from "lucide-react"
import {
  AIGeneralSettings,
  AIBehaviorSettings,
  AIPrivacySettings,
  AIPersonalizationSettings,
  AIApiKeysSettings,
} from "./settings"

// Initialize sub-agents
import "./init-agents"

registerFeatureSettings("ai", () => [
  {
    id: "ai-general",
    label: "AI Assistant",
    icon: Bot,
    order: 100,
    component: AIGeneralSettings,
  },
  {
    id: "ai-api-keys",
    label: "API Keys",
    icon: Key,
    order: 105,
    component: AIApiKeysSettings,
  },
  {
    id: "ai-behavior",
    label: "Behavior",
    icon: Sliders,
    order: 110,
    component: AIBehaviorSettings,
  },
  {
    id: "ai-privacy",
    label: "Privacy",
    icon: Shield,
    order: 120,
    component: AIPrivacySettings,
  },
  {
    id: "ai-personalization",
    label: "Personalization",
    icon: Sparkles,
    order: 130,
    component: AIPersonalizationSettings,
  },
])
