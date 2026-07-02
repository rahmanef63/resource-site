"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Marketing Settings Schema
 */
export interface MarketingSettingsSchema {
    // General
    defaultView: "campaigns" | "analytics" | "audience"
    timezone: "local" | "utc"
    currency: "USD" | "EUR" | "GBP" | "custom"

    // Campaigns
    defaultCampaignStatus: "draft" | "scheduled" | "active"
    requireApproval: boolean
    trackOpens: boolean
    trackClicks: boolean

    // Email
    defaultSender: string
    replyToAddress: string
    unsubscribeLink: boolean
    footerText: boolean

    // Analytics
    showROI: boolean
    compareToAverage: boolean
    realTimeUpdates: boolean
}

export const DEFAULT_MARKETING_SETTINGS: MarketingSettingsSchema = {
    // General
    defaultView: "campaigns",
    timezone: "local",
    currency: "USD",

    // Campaigns
    defaultCampaignStatus: "draft",
    requireApproval: false,
    trackOpens: true,
    trackClicks: true,

    // Email
    defaultSender: "",
    replyToAddress: "",
    unsubscribeLink: true,
    footerText: true,

    // Analytics
    showROI: true,
    compareToAverage: true,
    realTimeUpdates: false,
}

export const useMarketingSettingsStorage = createFeatureSettingsHook<MarketingSettingsSchema>(
    "marketing",
    DEFAULT_MARKETING_SETTINGS
)
