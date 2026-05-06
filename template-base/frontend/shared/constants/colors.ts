/**
 * Centralized Color Constants - SINGLE SOURCE OF TRUTH
 * 
 * All color palettes should be imported from this file.
 * DO NOT create new color definitions elsewhere!
 * 
 * @module frontend/shared/constants/colors
 */

// ============================================================================
// Types
// ============================================================================

export interface ColorOption {
  value: string
  label: string
  group?: string
}

export interface WorkspaceColorOption {
  name: string
  value: string
  category: "primary" | "warm" | "cool" | "neutral"
}

export interface NotionColorOption {
  name: string
  value: string
  light: string
}

// ============================================================================
// Theme Colors (CSS Variables)
// ============================================================================

export const THEME_COLORS: ColorOption[] = [
  { value: "default", label: "Default", group: "Theme" },
  { value: "primary", label: "Primary", group: "Theme" },
  { value: "secondary", label: "Secondary", group: "Theme" },
  { value: "accent", label: "Accent", group: "Theme" },
  { value: "muted", label: "Muted", group: "Theme" },
  { value: "destructive", label: "Destructive", group: "Theme" },
]

// ============================================================================
// Base Color Palette (Tailwind-like)
// ============================================================================

export const BASE_COLORS = {
  // Reds
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },
  // Oranges
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },
  // Yellows
  yellow: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
    950: "#422006",
  },
  // Greens
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  // Blues
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  // Purples
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
    800: "#6b21a8",
    900: "#581c87",
    950: "#3b0764",
  },
  // Pinks
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
    950: "#500724",
  },
  // Grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
} as const

// ============================================================================
// Workspace Colors (for hierarchy sidebar)
// ============================================================================

export const WORKSPACE_COLORS: WorkspaceColorOption[] = [
  // Primary
  { name: "Indigo", value: "#6366f1", category: "primary" },
  { name: "Purple", value: "#8b5cf6", category: "primary" },
  { name: "Violet", value: "#a855f7", category: "primary" },
  { name: "Fuchsia", value: "#d946ef", category: "primary" },
  { name: "Pink", value: "#ec4899", category: "primary" },

  // Warm
  { name: "Rose", value: "#f43f5e", category: "warm" },
  { name: "Red", value: "#ef4444", category: "warm" },
  { name: "Orange", value: "#f97316", category: "warm" },
  { name: "Amber", value: "#f59e0b", category: "warm" },
  { name: "Yellow", value: "#eab308", category: "warm" },

  // Cool
  { name: "Lime", value: "#84cc16", category: "cool" },
  { name: "Green", value: "#22c55e", category: "cool" },
  { name: "Emerald", value: "#10b981", category: "cool" },
  { name: "Teal", value: "#14b8a6", category: "cool" },
  { name: "Cyan", value: "#06b6d4", category: "cool" },
  { name: "Sky", value: "#0ea5e9", category: "cool" },
  { name: "Blue", value: "#3b82f6", category: "cool" },

  // Neutral
  { name: "Slate", value: "#64748b", category: "neutral" },
  { name: "Gray", value: "#6b7280", category: "neutral" },
  { name: "Zinc", value: "#71717a", category: "neutral" },
]

export const DEFAULT_WORKSPACE_COLOR = "#6366f1"

// ============================================================================
// Notion-style Colors (for select/multi-select options)
// ============================================================================

export const NOTION_COLORS: NotionColorOption[] = [
  { name: "Gray", value: "#6b7280", light: "#f3f4f6" },
  { name: "Brown", value: "#92400e", light: "#fef3c7" },
  { name: "Orange", value: "#ea580c", light: "#fed7aa" },
  { name: "Yellow", value: "#ca8a04", light: "#fef08a" },
  { name: "Green", value: "#16a34a", light: "#bbf7d0" },
  { name: "Blue", value: "#2563eb", light: "#bfdbfe" },
  { name: "Purple", value: "#9333ea", light: "#e9d5ff" },
  { name: "Pink", value: "#db2777", light: "#fbcfe8" },
  { name: "Red", value: "#dc2626", light: "#fecaca" },
]

// Legacy alias
export const COLOR_PALETTE = NOTION_COLORS

// ============================================================================
// Icon Color Presets
// ============================================================================

export const ICON_COLOR_PRESETS: ColorOption[] = [
  // Theme colors
  ...THEME_COLORS,

  // Basic colors
  { value: "#ef4444", label: "Red", group: "Basic" },
  { value: "#f97316", label: "Orange", group: "Basic" },
  { value: "#f59e0b", label: "Amber", group: "Basic" },
  { value: "#eab308", label: "Yellow", group: "Basic" },
  { value: "#84cc16", label: "Lime", group: "Basic" },
  { value: "#22c55e", label: "Green", group: "Basic" },
  { value: "#10b981", label: "Emerald", group: "Basic" },
  { value: "#14b8a6", label: "Teal", group: "Basic" },
  { value: "#06b6d4", label: "Cyan", group: "Basic" },
  { value: "#0ea5e9", label: "Sky", group: "Basic" },
  { value: "#3b82f6", label: "Blue", group: "Basic" },
  { value: "#6366f1", label: "Indigo", group: "Basic" },
  { value: "#8b5cf6", label: "Violet", group: "Basic" },
  { value: "#a855f7", label: "Purple", group: "Basic" },
  { value: "#d946ef", label: "Fuchsia", group: "Basic" },
  { value: "#ec4899", label: "Pink", group: "Basic" },
  { value: "#f43f5e", label: "Rose", group: "Basic" },

  // Neutrals
  { value: "#000000", label: "Black", group: "Neutral" },
  { value: "#ffffff", label: "White", group: "Neutral" },
  { value: "#374151", label: "Dark Gray", group: "Neutral" },
  { value: "#6b7280", label: "Gray", group: "Neutral" },
  { value: "#9ca3af", label: "Light Gray", group: "Neutral" },
]

// ============================================================================
// Background Color Presets
// ============================================================================

export const BACKGROUND_COLOR_PRESETS: ColorOption[] = [
  { value: "transparent", label: "None", group: "Special" },
  { value: "inherit", label: "Inherit", group: "Special" },

  // Light backgrounds
  { value: "#fef2f2", label: "Red", group: "Light" },
  { value: "#fff7ed", label: "Orange", group: "Light" },
  { value: "#fffbeb", label: "Yellow", group: "Light" },
  { value: "#fefce8", label: "Lime", group: "Light" },
  { value: "#f0fdf4", label: "Green", group: "Light" },
  { value: "#ecfeff", label: "Cyan", group: "Light" },
  { value: "#eff6ff", label: "Blue", group: "Light" },
  { value: "#eef2ff", label: "Indigo", group: "Light" },
  { value: "#faf5ff", label: "Purple", group: "Light" },
  { value: "#fdf4ff", label: "Fuchsia", group: "Light" },
  { value: "#fdf2f8", label: "Pink", group: "Light" },
  { value: "#f9fafb", label: "Gray", group: "Light" },

  // Dark backgrounds
  { value: "#450a0a", label: "Dark Red", group: "Dark" },
  { value: "#431407", label: "Dark Orange", group: "Dark" },
  { value: "#422006", label: "Dark Yellow", group: "Dark" },
  { value: "#14532d", label: "Dark Green", group: "Dark" },
  { value: "#083344", label: "Dark Cyan", group: "Dark" },
  { value: "#172554", label: "Dark Blue", group: "Dark" },
  { value: "#3b0764", label: "Dark Purple", group: "Dark" },
  { value: "#500724", label: "Dark Pink", group: "Dark" },
  { value: "#171717", label: "Dark Gray", group: "Dark" },
]

// ============================================================================
// Role Colors (for team composition)
// ============================================================================

/**
 * Color classes for workspace member roles.
 * Used in team composition displays and member lists.
 */
export const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-500",
  admin: "bg-blue-500",
  editor: "bg-green-500",
  viewer: "bg-gray-500",
  member: "bg-primary",
  guest: "bg-orange-500",
}

/**
 * Get role color class with fallback
 */
export function getRoleColor(role: string): string {
  return ROLE_COLORS[role.toLowerCase()] ?? "bg-primary"
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a random color from the Notion palette
 */
export function getRandomNotionColor(): string {
  const randomIndex = Math.floor(Math.random() * NOTION_COLORS.length)
  return NOTION_COLORS[randomIndex].value
}

/**
 * Get a random workspace color
 */
export function getRandomWorkspaceColor(): string {
  const randomIndex = Math.floor(Math.random() * WORKSPACE_COLORS.length)
  return WORKSPACE_COLORS[randomIndex].value
}

/**
 * Get color option by value
 */
export function getColorByValue(value: string, colors: ColorOption[]): ColorOption | undefined {
  return colors.find(c => c.value === value)
}

/**
 * Group colors by their group property
 */
export function groupColorsByGroup<T extends { group?: string }>(colors: T[]): Record<string, T[]> {
  return colors.reduce((acc, color) => {
    const group = color.group || "Other"
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(color)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Check if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * Ensure color has # prefix
 */
export function ensureHexPrefix(color: string): string {
  if (!color) return color
  return color.startsWith("#") ? color : `#${color}`
}

// ============================================================================
// Legacy Aliases (for backward compatibility - deprecate over time)
// ============================================================================

/** @deprecated Use NOTION_COLORS instead */
export const COLOR_PALETTE_WITH_NAMES = NOTION_COLORS

/** @deprecated Use ICON_COLOR_PRESETS instead */
export const COLOR_PRESETS = ICON_COLOR_PRESETS

/** @deprecated Use BACKGROUND_COLOR_PRESETS instead */
export const BACKGROUND_PRESETS = BACKGROUND_COLOR_PRESETS

/** @deprecated Use getRandomNotionColor instead */
export const getRandomColor = getRandomNotionColor
