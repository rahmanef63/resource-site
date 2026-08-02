# Icon System Migration Guide

## Overview

This is the unified icon system for the application. It provides:
- Dynamic icon rendering without static imports
- Searchable icon picker with category tabs
- Color picker with theme and custom colors
- Utility functions for icon and color manipulation

## Location

All icon utilities are located at: `frontend/shared/ui/icons/`

## Quick Start

### Basic Icon Usage

Instead of importing icons statically:

```tsx
// ❌ Old way - static imports
import { Home, Settings, User } from "lucide-react";

function MyComponent() {
  return <Home className="h-4 w-4" />;
}
```

Use the `DynamicIcon` component:

```tsx
// ✅ New way - dynamic rendering
import { DynamicIcon } from "@/frontend/shared/ui/icons";

function MyComponent() {
  return <DynamicIcon name="Home" className="h-4 w-4" />;
}
```

### Icon Picker

```tsx
import { IconPicker } from "@/frontend/shared/ui/icons";

function MyComponent() {
  const [icon, setIcon] = useState("Star");

  return (
    <IconPicker
      icon={icon}
      onIconChange={setIcon}
    />
  );
}
```

### Icon Picker with Colors

```tsx
import { IconPicker } from "@/frontend/shared/ui/icons";

function MyComponent() {
  const [icon, setIcon] = useState("Star");
  const [color, setColor] = useState("#3b82f6");
  const [bgColor, setBgColor] = useState("#eff6ff");

  return (
    <IconPicker
      icon={icon}
      color={color}
      backgroundColor={bgColor}
      onIconChange={setIcon}
      onColorChange={setColor}
      onBackgroundChange={setBgColor}
      showColor
      showBackground
    />
  );
}
```

### Color Picker Only

```tsx
import { ColorPicker } from "@/frontend/shared/ui/icons";

function MyComponent() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      type="icon" // or "background"
    />
  );
}
```

### Icon Grid (for custom implementations)

```tsx
import { IconGrid } from "@/frontend/shared/ui/icons";

function MyComponent() {
  const [selectedIcon, setSelectedIcon] = useState("Star");

  return (
    <IconGrid
      selectedIcon={selectedIcon}
      onSelectIcon={setSelectedIcon}
      showSearch
      showCategories
      columns={8}
      height={400}
    />
  );
}
```

## Feature & Category Icons

For domain-specific icons:

```tsx
import { FeatureIcon, CategoryIcon } from "@/frontend/shared/ui/icons";

// Renders the icon mapped to the "cms" feature
<FeatureIcon feature="cms" className="h-5 w-5" />

// Renders the icon mapped to the "layout" category
<CategoryIcon category="layout" className="h-5 w-5" />
```

## Utility Functions

### Icon Utilities

```tsx
import {
  iconExists,
  getAllIconNames,
  searchIcons,
  getIconsByCategory,
  getIconCategory,
} from "@/frontend/shared/ui/icons";

// Check if icon exists
iconExists("Home"); // true

// Get all icon names
const allIcons = getAllIconNames(); // ["Home", "Settings", ...]

// Search icons
const results = searchIcons("chart"); // ["BarChart", "LineChart", ...]

// Get icons by category
const designIcons = getIconsByCategory("design");

// Get icon's category
const category = getIconCategory("Palette"); // "design"
```

### Color Utilities

```tsx
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  lightenColor,
  darkenColor,
  getContrastColor,
  isValidHexColor,
} from "@/frontend/shared/ui/icons";

// Convert colors
hexToRgb("#3b82f6"); // { r: 59, g: 130, b: 246 }
rgbToHex(59, 130, 246); // "#3b82f6"

// Modify colors
lightenColor("#3b82f6", 20); // Lighter blue
darkenColor("#3b82f6", 20); // Darker blue

// Get contrast color for text
getContrastColor("#3b82f6"); // "#ffffff" (white)
getContrastColor("#fef08a"); // "#000000" (black)

// Validate colors
isValidHexColor("#3b82f6"); // true
isValidHexColor("blue"); // false
```

## Icon Categories

The system organizes 200+ icons into the following categories:

- **common**: Frequently used icons (Home, Star, Settings, etc.)
- **files**: File and folder icons
- **arrows**: Directional and navigation arrows
- **communication**: Messaging, email, and social icons
- **media**: Audio, video, and image icons
- **design**: Design and editing tools
- **development**: Code, terminal, and dev tools
- **business**: Business and analytics icons
- **social**: Social media and interaction icons
- **navigation**: UI navigation elements
- **actions**: CRUD and action icons
- **status**: Status indicators and feedback
- **shapes**: Geometric shapes

## Adding Custom Icons

To add custom icon mappings for features or categories, edit the constants file:

```tsx
// frontend/shared/ui/icons/constants.ts

export const FEATURE_ICONS: Record<string, string> = {
  // Add your feature mappings
  myFeature: "IconName",
};

export const CATEGORY_ICONS: Record<string, string> = {
  // Add your category mappings
  myCategory: "IconName",
};
```

## TypeScript Types

```tsx
import type {
  IconName,
  IconCategory,
  IconData,
  ColorOption,
  DynamicIconProps,
  IconPickerProps,
  ColorPickerProps,
  IconGridProps,
} from "@/frontend/shared/ui/icons";
```

## Best Practices

1. **Use DynamicIcon for user-configurable icons**: When icons are stored in database or configuration.

2. **Use static imports for fixed UI icons**: For icons that never change (like in buttons), static imports are slightly more performant.

3. **Use FeatureIcon/CategoryIcon for consistency**: When displaying icons for features or categories, use these components for consistent mapping.

4. **Leverage search utilities**: For icon selection UIs, use the provided search functions rather than implementing your own.

5. **Use color presets**: The color presets are designed to work well with the app's design system.
