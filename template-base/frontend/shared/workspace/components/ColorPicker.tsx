/**
 * Color Picker Component for Workspace Store
 * 
 * Re-exports from shared UI color picker with workspace-specific defaults.
 * 
 * @module frontend/slices/workspace-store/components/ColorPicker
 */

"use client"

// Re-export shared components from SSOT
export {
  PresetColorPicker as ColorPicker,
  InlineColorPicker,
  type PresetColorPickerProps as ColorPickerProps,
  type InlineColorPickerProps,
} from "@/frontend/shared/ui/color-picker";

// For backward compatibility, also export workspace-specific wrappers
import {
  PresetColorPicker,
  InlineColorPicker as SharedInlineColorPicker,
  type PresetColorPickerProps,
  type InlineColorPickerProps as SharedInlineColorPickerProps,
} from "@/frontend/shared/ui/color-picker";

/**
 * Workspace Color Picker - pre-configured for workspace colors
 */
export function WorkspaceColorPicker(props: Omit<PresetColorPickerProps, "variant">) {
  return <PresetColorPicker {...props} variant="default" />;
}

/**
 * Inline Workspace Color Picker - pre-configured for workspace colors
 */
export function InlineWorkspaceColorPicker(props: Omit<SharedInlineColorPickerProps, never>) {
  return <SharedInlineColorPicker {...props} />;
}
