/**
 * Data Transformer Utility
 * Handles property type conversions with data migration logic
 * Preserves data when possible, handles errors gracefully
 */

import type { DatabaseFieldType } from "@/frontend/slices/database/types";

export interface TransformationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  invalidRows?: number[];
}

export interface PropertyTypeConversion {
  fromType: DatabaseFieldType;
  toType: DatabaseFieldType;
  data: any;
  options?: any;
}

/**
 * Transform Text to Number
 * Extract numeric values, strip non-numeric characters
 * Examples:
 * - "123" → 123
 * - "45.67" → 45.67
 * - "abc123" → 123 (strips letters)
 * - "-123.45" → -123.45
 * - "abc" → null (no numbers)
 */
export function transformTextToNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  
  const str = String(value).trim();
  
  // First try direct parse (for clean numbers like "123")
  const directNum = Number(str);
  if (!isNaN(directNum)) {
    return directNum;
  }
  
  // Extract numeric part: keep digits, decimal point, minus sign
  // Remove all letters and other non-numeric characters
  const numericStr = str.replace(/[^0-9.-]/g, '');
  
  if (numericStr === '' || numericStr === '-' || numericStr === '.') {
    return null;
  }
  
  const num = Number(numericStr);
  
  // Check if valid number after extraction
  if (isNaN(num)) {
    return null;
  }
  
  return num;
}

/**
 * Transform Number to Text
 * Convert to string preserving precision
 */
export function transformNumberToText(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  return String(value);
}

/**
 * Transform Text to Select
 * Split by comma and create select options
 */
export function transformTextToSelect(value: any): string[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }
  
  const str = String(value);
  
  // Split by comma and clean up
  const options = str
    .split(",")
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
  
  return options;
}

/**
 * Transform Select to Text
 * Join selected options with comma
 */
export function transformSelectToText(value: any): string {
  if (!value) {
    return "";
  }
  
  // Handle array of options
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  
  // Handle single option
  return String(value);
}

/**
 * Transform Select to MultiSelect
 * Convert single selection to array
 */
export function transformSelectToMultiSelect(value: any): string[] {
  if (!value) {
    return [];
  }
  
  if (Array.isArray(value)) {
    return value;
  }
  
  return [String(value)];
}

/**
 * Transform MultiSelect to Select
 * Take first option only
 */
export function transformMultiSelectToSelect(value: any): string | null {
  if (!value) {
    return null;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }
  
  return String(value);
}

/**
 * Transform Checkbox to Text
 */
export function transformCheckboxToText(value: any): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

/**
 * Transform Text to Checkbox
 */
export function transformTextToCheckbox(value: any): boolean {
  if (!value) return false;
  
  const str = String(value).toLowerCase().trim();
  const trueValues = ["yes", "true", "1", "checked", "on"];
  
  return trueValues.includes(str);
}

/**
 * Transform Date to Text
 */
export function transformDateToText(value: any): string {
  if (!value) return "";
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return "";
  }
}

/**
 * Transform Text to Date
 */
export function transformTextToDate(value: any): number | null {
  if (!value) return null;
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    
    return date.getTime();
  } catch {
    return null;
  }
}

/**
 * Transform URL to Text
 */
export function transformUrlToText(value: any): string {
  if (!value) return "";
  
  if (typeof value === "object" && value.url) {
    return value.url;
  }
  
  return String(value);
}

/**
 * Transform Text to URL
 */
export function transformTextToUrl(value: any): { url: string; title?: string } | null {
  if (!value) return null;
  
  const str = String(value).trim();
  
  // Basic URL validation
  try {
    new URL(str);
    return { url: str };
  } catch {
    // If not a valid URL, check if it starts with common patterns
    if (str.startsWith("www.")) {
      return { url: `https://${str}` };
    }
    return null;
  }
}

/**
 * Transform Email to Text
 */
export function transformEmailToText(value: any): string {
  if (!value) return "";
  return String(value);
}

/**
 * Transform Text to Email
 */
export function transformTextToEmail(value: any): string | null {
  if (!value) return null;
  
  const str = String(value).trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(str)) {
    return str;
  }
  
  return null;
}

/**
 * Transform Phone to Text
 */
export function transformPhoneToText(value: any): string {
  if (!value) return "";
  return String(value);
}

/**
 * Transform Text to Phone
 */
export function transformTextToPhone(value: any): string {
  if (!value) return "";
  
  // Remove non-digit characters except + and spaces
  const cleaned = String(value).replace(/[^\d+\s()-]/g, "");
  return cleaned;
}

/**
 * Main transformation dispatcher
 * Routes to appropriate conversion function based on type pair
 */
export function transformPropertyValue(
  fromType: DatabaseFieldType,
  toType: DatabaseFieldType,
  value: any
): any {
  // Same type, no transformation needed
  if (fromType === toType) {
    return value;
  }
  
  // Text conversions
  if (fromType === "text") {
    switch (toType) {
      case "number": return transformTextToNumber(value);
      case "select": return transformTextToSelect(value);
      case "multiSelect": return transformTextToSelect(value);
      case "checkbox": return transformTextToCheckbox(value);
      case "date": return transformTextToDate(value);
      case "url": return transformTextToUrl(value);
      case "email": return transformTextToEmail(value);
      case "phone": return transformTextToPhone(value);
      default: return String(value || "");
    }
  }
  
  // Number conversions
  if (fromType === "number") {
    switch (toType) {
      case "text": return transformNumberToText(value);
      case "checkbox": return value > 0;
      default: return transformNumberToText(value);
    }
  }
  
  // Select conversions
  if (fromType === "select") {
    switch (toType) {
      case "text": return transformSelectToText(value);
      case "multiSelect": return transformSelectToMultiSelect(value);
      default: return transformSelectToText(value);
    }
  }
  
  // MultiSelect conversions
  if (fromType === "multiSelect") {
    switch (toType) {
      case "text": return transformSelectToText(value);
      case "select": return transformMultiSelectToSelect(value);
      default: return transformSelectToText(value);
    }
  }
  
  // Checkbox conversions
  if (fromType === "checkbox") {
    switch (toType) {
      case "text": return transformCheckboxToText(value);
      case "number": return value ? 1 : 0;
      default: return transformCheckboxToText(value);
    }
  }
  
  // Date conversions
  if (fromType === "date") {
    switch (toType) {
      case "text": return transformDateToText(value);
      case "number": return value ? new Date(value).getTime() : null;
      default: return transformDateToText(value);
    }
  }
  
  // URL conversions
  if (fromType === "url") {
    switch (toType) {
      case "text": return transformUrlToText(value);
      default: return transformUrlToText(value);
    }
  }
  
  // Email conversions
  if (fromType === "email") {
    switch (toType) {
      case "text": return transformEmailToText(value);
      case "url": return value ? { url: `mailto:${value}` } : null;
      default: return transformEmailToText(value);
    }
  }
  
  // Phone conversions
  if (fromType === "phone") {
    switch (toType) {
      case "text": return transformPhoneToText(value);
      default: return transformPhoneToText(value);
    }
  }
  
  // Default: try to convert to string
  return String(value || "");
}

/**
 * Transform all rows for a property type change
 * Returns result with transformed data and validation info
 */
export function transformPropertyData(
  conversion: PropertyTypeConversion
): TransformationResult<any[]> {
  const { fromType, toType, data } = conversion;
  
  if (!Array.isArray(data)) {
    return {
      success: false,
      error: "Data must be an array of rows",
    };
  }
  
  const transformedData: any[] = [];
  const warnings: string[] = [];
  const invalidRows: number[] = [];
  
  data.forEach((value, index) => {
    try {
      const transformed = transformPropertyValue(fromType, toType, value);
      
      // Track invalid conversions
      if (transformed === null && value !== null && value !== undefined && value !== "") {
        invalidRows.push(index);
        warnings.push(`Row ${index + 1}: Could not convert "${value}" from ${fromType} to ${toType}`);
      }
      
      transformedData.push(transformed);
    } catch (error) {
      invalidRows.push(index);
      warnings.push(`Row ${index + 1}: Error during conversion - ${error}`);
      transformedData.push(null);
    }
  });
  
  // Generate summary warnings
  if (invalidRows.length > 0) {
    warnings.unshift(
      `${invalidRows.length} of ${data.length} values could not be converted and will be set to empty.`
    );
  }
  
  return {
    success: true,
    data: transformedData,
    warnings: warnings.length > 0 ? warnings : undefined,
    invalidRows: invalidRows.length > 0 ? invalidRows : undefined,
  };
}

/**
 * Check if conversion is potentially lossy
 */
export function isLossyConversion(
  fromType: DatabaseFieldType,
  toType: DatabaseFieldType
): boolean {
  const lossyConversions: [DatabaseFieldType, DatabaseFieldType][] = [
    ["number", "text"], // Precision might be lost
    ["multiSelect", "select"], // Multiple values to single
    ["date", "text"], // Lose date object structure
    ["url", "text"], // Lose URL validation
    ["email", "text"], // Lose email validation
  ];
  
  return lossyConversions.some(
    ([from, to]) => from === fromType && to === toType
  );
}

/**
 * Get human-readable description of transformation
 */
export function getTransformationDescription(
  fromType: DatabaseFieldType,
  toType: DatabaseFieldType
): string {
  if (fromType === toType) {
    return "No transformation needed";
  }
  
  const descriptions: Record<string, string> = {
    "text-number": "Parse numeric values (e.g., '123' → 123). Non-numeric text will be empty.",
    "number-text": "Convert numbers to text (e.g., 123 → '123')",
    "text-select": "Split by comma to create options (e.g., 'red, blue' → ['red', 'blue'])",
    "select-text": "Join options with comma (e.g., ['red', 'blue'] → 'red, blue')",
    "text-multiSelect": "Split by comma to create multiple options",
    "multiSelect-text": "Join all selected options with comma",
    "select-multiSelect": "Convert single selection to array",
    "multiSelect-select": "Keep only first selected option (others will be lost)",
    "checkbox-text": "Convert to 'Yes' or 'No'",
    "text-checkbox": "Convert 'yes', 'true', '1' to checked",
    "date-text": "Format as YYYY-MM-DD",
    "text-date": "Parse date string (e.g., '2024-01-15')",
    "url-text": "Extract URL as text",
    "text-url": "Validate and create URL (invalid URLs will be empty)",
    "email-text": "Extract email as text",
    "text-email": "Validate email format (invalid emails will be empty)",
  };
  
  const key = `${fromType}-${toType}`;
  return descriptions[key] || `Convert from ${fromType} to ${toType}`;
}
