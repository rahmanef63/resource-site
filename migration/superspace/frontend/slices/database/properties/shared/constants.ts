/**
 * Shared constants for property editors
 * 
 * Re-exports from SSOT: frontend/shared/constants/colors.ts
 */

// Import from SSOT
import { 
  NOTION_COLORS, 
  getRandomNotionColor 
} from "@/frontend/shared/constants/colors";

/**
 * Standard color palette for Select/Multi-Select options
 * Re-exported from SSOT for backward compatibility
 */
export const COLOR_PALETTE = NOTION_COLORS.map(c => c.value) as readonly string[];

/**
 * Color palette with names for display purposes
 * Re-exported from SSOT for backward compatibility
 */
export const COLOR_PALETTE_WITH_NAMES = NOTION_COLORS;

/**
 * Get a random color from the palette
 * Re-exported from SSOT for backward compatibility
 */
export const getRandomColor = getRandomNotionColor;
