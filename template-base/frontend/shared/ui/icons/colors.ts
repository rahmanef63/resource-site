import type { ColorOption } from "./types";
import { COLOR_PRESETS, BACKGROUND_PRESETS } from "./constants";

/**
 * Get color value from preset or return as-is if hex
 */
export function getColorValue(color: string): string {
  // Check if it's a theme color
  if (isThemeColor(color)) {
    return `hsl(var(--${color}))`;
  }

  // Check if it's in presets
  const preset = [...COLOR_PRESETS, ...BACKGROUND_PRESETS].find(
    (p) => p.value === color
  );

  if (preset) {
    return preset.value;
  }

  // Return as-is (assume it's a valid CSS color)
  return color;
}

/**
 * Check if a color is a theme color (e.g., "primary", "destructive")
 */
export function isThemeColor(color: string): boolean {
  const themeColors = [
    "default",
    "primary",
    "secondary",
    "accent",
    "muted",
    "destructive",
    "foreground",
    "background",
    "card",
    "popover",
    "border",
    "input",
    "ring",
  ];
  return themeColors.includes(color);
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(
  hex: string
): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newL = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newL = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Get colors by group
 */
export function getColorsByGroup(
  presets: ColorOption[]
): Record<string, ColorOption[]> {
  return presets.reduce(
    (acc, color) => {
      const group = color.group || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(color);
      return acc;
    },
    {} as Record<string, ColorOption[]>
  );
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Ensure hex color starts with #
 */
export function ensureHexPrefix(color: string): string {
  if (!color) return "";
  return color.startsWith("#") ? color : `#${color}`;
}
