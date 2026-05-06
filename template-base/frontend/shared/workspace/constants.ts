/**
 * Workspace Store Constants
 * 
 * NOTE: Colors and WorkspaceType are imported from SSOT:
 * - frontend/shared/constants/colors.ts
 * - frontend/shared/constants/workspace-types.ts
 */

// Re-export from SSOT for backward compatibility
export {
  WORKSPACE_TYPES,
  WORKSPACE_TYPE_OPTIONS,
  WORKSPACE_TYPE_LABELS,
  WORKSPACE_TYPE_ICONS,
  type WorkspaceType,
} from "@/frontend/shared/constants/workspace-types"

export {
  WORKSPACE_COLORS,
  DEFAULT_WORKSPACE_COLOR,
  getRandomWorkspaceColor,
} from "@/frontend/shared/constants/colors"

// Store configuration
export const WORKSPACE_STORE_CONFIG = {
  maxDepth: 6,
  maxChildren: 50,
  defaultColor: "#6366f1",
  defaultIcon: "Folder",
}

// ============================================================================
// Icon Categories (workspace-specific, not color-related)
// ============================================================================

export const WORKSPACE_ICON_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "business", label: "Business" },
  { id: "development", label: "Development" },
  { id: "communication", label: "Communication" },
  { id: "files", label: "Files & Folders" },
  { id: "media", label: "Media" },
  { id: "tools", label: "Tools" },
  { id: "nature", label: "Nature" },
]

// Common icons for workspaces
export const WORKSPACE_ICONS = [
  // General
  { name: "Home", category: "general", keywords: ["house", "home", "main"] },
  { name: "Building2", category: "general", keywords: ["office", "building", "company"] },
  { name: "Users", category: "general", keywords: ["team", "group", "people"] },
  { name: "Heart", category: "general", keywords: ["family", "love", "favorite"] },
  { name: "Star", category: "general", keywords: ["favorite", "important", "starred"] },
  { name: "Briefcase", category: "general", keywords: ["work", "job", "business"] },
  
  // Business
  { name: "Building", category: "business", keywords: ["company", "office"] },
  { name: "Store", category: "business", keywords: ["shop", "retail", "store"] },
  { name: "Landmark", category: "business", keywords: ["bank", "institution", "government"] },
  { name: "Factory", category: "business", keywords: ["manufacturing", "production"] },
  { name: "Warehouse", category: "business", keywords: ["storage", "inventory"] },
  { name: "ShoppingCart", category: "business", keywords: ["ecommerce", "shop", "cart"] },
  
  // Development
  { name: "Code", category: "development", keywords: ["code", "programming", "dev"] },
  { name: "Terminal", category: "development", keywords: ["command", "terminal", "cli"] },
  { name: "GitBranch", category: "development", keywords: ["git", "version", "branch"] },
  { name: "Database", category: "development", keywords: ["database", "data", "storage"] },
  { name: "Server", category: "development", keywords: ["server", "hosting", "backend"] },
  { name: "Cpu", category: "development", keywords: ["processor", "hardware", "tech"] },
  
  // Communication
  { name: "MessageSquare", category: "communication", keywords: ["chat", "message", "talk"] },
  { name: "Mail", category: "communication", keywords: ["email", "mail", "inbox"] },
  { name: "Phone", category: "communication", keywords: ["call", "phone", "contact"] },
  { name: "Video", category: "communication", keywords: ["video", "meeting", "call"] },
  { name: "Bell", category: "communication", keywords: ["notification", "alert", "bell"] },
  
  // Files
  { name: "Folder", category: "files", keywords: ["folder", "directory", "files"] },
  { name: "FileText", category: "files", keywords: ["document", "file", "text"] },
  { name: "Image", category: "files", keywords: ["image", "photo", "picture"] },
  { name: "Archive", category: "files", keywords: ["archive", "zip", "compress"] },
  { name: "Download", category: "files", keywords: ["download", "save"] },
  
  // Media
  { name: "Music", category: "media", keywords: ["music", "audio", "sound"] },
  { name: "Film", category: "media", keywords: ["video", "movie", "film"] },
  { name: "Camera", category: "media", keywords: ["photo", "camera", "picture"] },
  { name: "Mic", category: "media", keywords: ["microphone", "audio", "record"] },
  
  // Tools
  { name: "Settings", category: "tools", keywords: ["settings", "config", "gear"] },
  { name: "Wrench", category: "tools", keywords: ["tools", "repair", "fix"] },
  { name: "Hammer", category: "tools", keywords: ["build", "construct", "create"] },
  { name: "Palette", category: "tools", keywords: ["design", "art", "color"] },
  { name: "Scissors", category: "tools", keywords: ["cut", "edit", "trim"] },
  
  // Nature
  { name: "Sun", category: "nature", keywords: ["sun", "day", "light"] },
  { name: "Moon", category: "nature", keywords: ["moon", "night", "dark"] },
  { name: "Cloud", category: "nature", keywords: ["cloud", "weather", "sky"] },
  { name: "Leaf", category: "nature", keywords: ["nature", "plant", "eco"] },
  { name: "Mountain", category: "nature", keywords: ["mountain", "outdoor", "nature"] },
]

// ============================================================================
// Hierarchy Limits
// ============================================================================

export const MAX_WORKSPACE_DEPTH = 6
export const MAX_CHILDREN_PER_WORKSPACE = 50

// Hierarchy level names (for display)
export const HIERARCHY_LEVEL_NAMES: Record<number, string> = {
  0: "Root",
  1: "Level 1",
  2: "Level 2", 
  3: "Level 3",
  4: "Level 4",
  5: "Level 5",
  6: "Level 6",
}

// ============================================================================
// DnD Configuration
// ============================================================================

export const DND_TYPES = {
  WORKSPACE: "workspace",
  WORKSPACE_TREE_ITEM: "workspace-tree-item",
}

export const DND_ACCEPT_TYPES = [DND_TYPES.WORKSPACE, DND_TYPES.WORKSPACE_TREE_ITEM]
