"use client"

import { ResponsiveDialog } from "@/frontend/shared/ui"
import { SettingsView } from "./SettingsView"

interface SettingsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: string
}

export function SettingsPopup({
  open,
  onOpenChange,
  defaultCategory,
}: SettingsPopupProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="full" contentClassName="sm:max-w-6xl">
      <ResponsiveDialog.Header className="sr-only">
        <ResponsiveDialog.Title>Settings</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Configure workspace, account, and feature preferences.</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body className="p-0">
        <SettingsView defaultCategory={defaultCategory} />
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}
