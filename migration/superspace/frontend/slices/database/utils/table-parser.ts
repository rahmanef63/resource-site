/**
 * Table data parsing utilities
 * Handles parsing of table name and icon that might be stored as JSON
 */

export interface ParsedTableIcon {
  iconName: string;
  iconColor: string;
}

export interface ParsedTableData {
  name: string;
  icon: ParsedTableIcon;
}

/**
 * Parse table name that might be stored as JSON
 * 
 * @example
 * // Legacy format
 * parseTableName("My Database") // "My Database"
 * 
 * // New JSON format
 * parseTableName('{"name":"My Database","color":"default"}') // "My Database"
 */
export function parseTableName(name: unknown): string {
  if (typeof name !== "string") {
    return "Untitled Database";
  }

  try {
    const parsed = JSON.parse(name);
    if (parsed && typeof parsed === "object" && "name" in parsed) {
      return parsed.name || "Untitled Database";
    }
  } catch {
    // Not JSON, use as-is
    return name;
  }

  return name;
}

/**
 * Parse table icon that might be stored as JSON with color
 * 
 * @example
 * // New JSON format (preferred)
 * parseTableIcon('{"name":"Database","color":"blue"}')
 * // { iconName: "Database", iconColor: "blue" }
 * 
 * // Legacy icon name
 * parseTableIcon("Folder")
 * // { iconName: "Folder", iconColor: "default" }
 * 
 * // Legacy emoji (fallback to Database icon)
 * parseTableIcon("📚")
 * // { iconName: "Database", iconColor: "default" }
 */
export function parseTableIcon(icon: unknown): ParsedTableIcon {
  const defaultIcon: ParsedTableIcon = {
    iconName: "Database",
    iconColor: "default",
  };

  if (!icon || typeof icon !== "string") {
    return defaultIcon;
  }

  try {
    const parsed = JSON.parse(icon);
    if (parsed && typeof parsed === "object") {
      return {
        iconName: parsed.name || "Database",
        iconColor: parsed.color || "default",
      };
    }
  } catch {
    // Not JSON, handle legacy formats
    // If it's a single/double character (emoji), use default Database icon
    if (icon.length <= 2) {
      return defaultIcon;
    }
    
    // Otherwise, treat as lucide icon name
    return {
      iconName: icon,
      iconColor: "default",
    };
  }

  return defaultIcon;
}

/**
 * Parse complete table data (name and icon)
 * Convenience function that combines parseTableName and parseTableIcon
 * 
 * @example
 * const table = { name: '{"name":"Tasks"}', icon: '{"name":"CheckSquare","color":"green"}' };
 * const parsed = parseTableData(table);
 * // { name: "Tasks", icon: { iconName: "CheckSquare", iconColor: "green" } }
 */
export function parseTableData(table: {
  name?: unknown;
  icon?: unknown;
}): ParsedTableData {
  return {
    name: parseTableName(table.name),
    icon: parseTableIcon(table.icon),
  };
}
