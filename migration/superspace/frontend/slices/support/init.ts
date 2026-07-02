/**
 * Support Feature Initialization
 * Registers support-related settings with the settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Ticket, MessageSquare, Clock, Bell } from "lucide-react"
import {
  SupportTicketSettings,
  SupportResponseSettings,
  SupportSLASettings,
  SupportNotificationSettings,
} from "./settings"
import { registerSupportAgent } from "./agent"

// Register support feature settings
registerFeatureSettings("support", () => [
  {
    id: "support-tickets",
    label: "Tickets",
    icon: Ticket,
    order: 100,
    component: SupportTicketSettings,
  },
  {
    id: "support-responses",
    label: "Responses",
    icon: MessageSquare,
    order: 110,
    component: SupportResponseSettings,
  },
  {
    id: "support-sla",
    label: "SLA",
    icon: Clock,
    order: 120,
    component: SupportSLASettings,
  },
  {
    id: "support-notifications",
    label: "Notifications",
    icon: Bell,
    order: 130,
    component: SupportNotificationSettings,
  },
])

registerSupportAgent()
