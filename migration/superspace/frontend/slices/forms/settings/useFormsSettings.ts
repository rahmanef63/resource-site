"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Forms Settings Schema
 */
export interface FormsSettingsSchema {
    // General
    defaultTheme: "light" | "dark" | "system"
    showProgressBar: boolean
    allowSave: boolean
    autoSaveInterval: 30 | 60 | 120 // seconds

    // Appearance
    formWidth: "compact" | "normal" | "wide"
    showRequired: boolean
    labelPosition: "top" | "left" | "inline"
    inputSize: "small" | "medium" | "large"

    // Submissions
    confirmSubmission: boolean
    sendConfirmationEmail: boolean
    allowMultipleSubmissions: boolean
    showSuccessMessage: boolean

    // Privacy
    collectAnalytics: boolean
    storeSubmissions: boolean
    submissionRetention: 30 | 90 | 365 | 0 // days, 0 = forever
}

export const DEFAULT_FORMS_SETTINGS: FormsSettingsSchema = {
    // General
    defaultTheme: "system",
    showProgressBar: true,
    allowSave: true,
    autoSaveInterval: 60,

    // Appearance
    formWidth: "normal",
    showRequired: true,
    labelPosition: "top",
    inputSize: "medium",

    // Submissions
    confirmSubmission: true,
    sendConfirmationEmail: false,
    allowMultipleSubmissions: false,
    showSuccessMessage: true,

    // Privacy
    collectAnalytics: true,
    storeSubmissions: true,
    submissionRetention: 365,
}

export const useFormsSettingsStorage = createFeatureSettingsHook<FormsSettingsSchema>(
    "forms",
    DEFAULT_FORMS_SETTINGS
)
