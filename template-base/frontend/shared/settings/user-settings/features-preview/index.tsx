"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { UserSettingsPresenter, type UserSettingsFormData } from "../components/UserSettings"

const INITIAL: UserSettingsFormData = {
  name:  "Rahman",
  email: "rahman@superspace.dev",
  bio:   "Full-stack engineer · building modular SaaS platforms · F&B and retail focus.",
}

function UserSettingsPreview({ compact }: FeaturePreviewProps) {
  const [formData, setFormData] = React.useState<UserSettingsFormData>(INITIAL)
  const [isLoading, setIsLoading] = React.useState(false)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">User Settings</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Profile · email · bio
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <UserSettingsPresenter
        formData={formData}
        onFormDataChange={setFormData}
        onSave={async () => {
          setIsLoading(true)
          await new Promise((r) => setTimeout(r, 300))
          setIsLoading(false)
        }}
        isLoading={isLoading}
      />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "user-settings",
  name: "User Settings",
  description: "Personal profile, account, notifications, security, theme, and language preferences.",
  component: UserSettingsPreview,
  category: "profile",
  tags: ["profile", "settings", "account", "preferences"],
  mockDataSets: [
    {
      id: "default",
      name: "Profile editor",
      description: "Real UserSettingsPresenter with editable mock profile.",
      data: { profile: INITIAL },
    },
  ],
})
