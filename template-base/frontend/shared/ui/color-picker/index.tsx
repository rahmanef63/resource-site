/**
 * Color Picker - SINGLE SOURCE OF TRUTH
 * 
 * Advanced color picker with HSL selection, alpha, eye dropper, and format output.
 * Based on shadcn-io color picker with additional wrappers for simple use cases.
 * 
 * Component Types:
 * - Advanced (Full Controls): ColorPicker compound components
 * - Simple (Full Controls): SimpleColorPicker - compact pre-composed picker  
 * - Preset (Swatches): PresetColorPicker - color swatches
 * - Inline (Popover): InlineColorPicker - popover with swatches
 * 
 * @module frontend/shared/ui/color-picker
 */

"use client";

// Re-export all primitive components from shadcn-io
export {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
  useColorPicker,
  type ColorPickerProps,
  type ColorPickerSelectionProps,
  type ColorPickerHueProps,
  type ColorPickerAlphaProps,
  type ColorPickerEyeDropperProps,
  type ColorPickerOutputProps,
  type ColorPickerFormatProps,
} from "@/components/ui/shadcn-io/color-picker";

// Export simple full-featured picker (pre-composed)
export {
  SimpleColorPicker,
  type SimpleColorPickerProps,
} from "./simple-color-picker";

// Export preset-based pickers with swatches
export {
  PresetColorPicker,
  InlineColorPicker,
  type PresetColorPickerProps,
  type InlineColorPickerProps,
  type ColorPickerVariant,
} from "./preset-color-picker";
