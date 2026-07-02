"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * CRM Settings Schema
 */
export interface CRMSettingsSchema {
    // General
    defaultPipelineView: "kanban" | "list" | "table"
    autoRefreshInterval: 0 | 30 | 60 | 300 // seconds, 0 = disabled
    showDealValues: boolean
    currencyDisplay: "symbol" | "code" | "none"

    // Display
    cardStyle: "compact" | "detailed" | "expanded"
    showContactPhotos: boolean
    showCompanyLogos: boolean
    colorCodeByStage: boolean

    // Notifications
    notifyDealUpdates: boolean
    notifyStageChanges: boolean
    notifyNewLeads: boolean
    notifyTaskDue: boolean

    // Automation
    autoAssignLeads: boolean
    autoCreateTasks: boolean
    autoFollowUp: boolean
    followUpDays: number
}

export const DEFAULT_CRM_SETTINGS: CRMSettingsSchema = {
    // General
    defaultPipelineView: "kanban",
    autoRefreshInterval: 60,
    showDealValues: true,
    currencyDisplay: "symbol",

    // Display
    cardStyle: "detailed",
    showContactPhotos: true,
    showCompanyLogos: true,
    colorCodeByStage: true,

    // Notifications
    notifyDealUpdates: true,
    notifyStageChanges: true,
    notifyNewLeads: true,
    notifyTaskDue: true,

    // Automation
    autoAssignLeads: false,
    autoCreateTasks: false,
    autoFollowUp: false,
    followUpDays: 3,
}

export const useCRMSettingsStorage = createFeatureSettingsHook<CRMSettingsSchema>(
    "crm",
    DEFAULT_CRM_SETTINGS
)
