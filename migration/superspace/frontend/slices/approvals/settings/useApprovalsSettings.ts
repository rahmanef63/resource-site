"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ApprovalsSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
    approvalMode: "sequential" | "parallel" | "any"
    requiredApprovers: number
    autoApproveBelow: number
    escalationTimeoutHours: number
    notifyOnApproval: boolean
    notifyOnRejection: boolean
    notifyOnEscalation: boolean
    allowSelfApproval: boolean
    requireComment: boolean
}

export const DEFAULT_APPROVALS_SETTINGS: ApprovalsSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true,
    approvalMode: "sequential",
    requiredApprovers: 1,
    autoApproveBelow: 0,
    escalationTimeoutHours: 48,
    notifyOnApproval: true,
    notifyOnRejection: true,
    notifyOnEscalation: true,
    allowSelfApproval: false,
    requireComment: false,
}

export const useApprovalsSettingsStorage = createFeatureSettingsHook<ApprovalsSettingsSchema>(
    "approvals",
    DEFAULT_APPROVALS_SETTINGS
)
