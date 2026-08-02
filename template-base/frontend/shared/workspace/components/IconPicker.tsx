/**
 * Icon Picker Component - Re-export from shared
 * 
 * DEPRECATED: Import from @/frontend/shared/ui/icons instead
 * This file is kept for backward compatibility.
 * 
 * @module frontend/slices/workspace-store/components/IconPicker
 */

"use client"

// Re-export from SSOT at ui/icons
export {
  IconPicker as default,
  IconPicker,
  DynamicIcon,
  getIconComponent,
  getIconStyle,
  type IconPickerProps,
  type IconName,
} from "@/frontend/shared/ui/icons";

// Legacy exports for backward compatibility
export {
  DynamicIcon as WorkspaceIcon,
  getIconComponent as getIconByName,
} from "@/frontend/shared/ui/icons";

