/**
 * Inspector UI constants used by DynamicInspector presentation.
 *
 * NOTE:
 * - Runtime control presets for legacy inspector controls live in
 *   `config/inspectorConfig.ts`.
 * - Keep shared values synchronized to avoid drift between both systems.
 */

import {
    Type,
    Palette,
    Paintbrush,
    Layout,
    Square,
    Eye,
    Layers,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Italic,
    Strikethrough,
    Underline,
    Minus,
    Circle,
} from 'lucide-react';
import React from 'react';

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export type InspectorSectionId =
    | 'content'
    | 'typography'
    | 'color'
    | 'background'
    | 'dimensions'
    | 'layout'
    | 'border'
    | 'appearance'
    | 'shadow'
    | 'properties';

export interface InspectorSectionConfig {
    id: InspectorSectionId;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
}

export const INSPECTOR_SECTIONS: Record<InspectorSectionId, InspectorSectionConfig> = {
    content: { id: 'content', title: 'Content', defaultOpen: true },
    typography: { id: 'typography', title: 'Typography', icon: Type, defaultOpen: true },
    color: { id: 'color', title: 'Color', icon: Palette, defaultOpen: true },
    background: { id: 'background', title: 'Background', icon: Paintbrush, defaultOpen: true },
    dimensions: { id: 'dimensions', title: 'Dimensions', icon: Square, defaultOpen: true },
    layout: { id: 'layout', title: 'Layout', icon: Layout, defaultOpen: true },
    border: { id: 'border', title: 'Border', icon: Square, defaultOpen: false },
    appearance: { id: 'appearance', title: 'Appearance', icon: Eye, defaultOpen: false },
    shadow: { id: 'shadow', title: 'Shadow', icon: Layers, defaultOpen: false },
    properties: { id: 'properties', title: 'Properties', defaultOpen: true },
} as const;

// ============================================================================
// TYPOGRAPHY OPTIONS (SSOT)
// ============================================================================

export const FONT_FAMILIES = [
    'Default', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
] as const;

export const FONT_WEIGHTS = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
] as const;

export const FONT_SIZES = [
    { value: 'Default', label: 'Default' },
    { value: 'xs', label: 'XS (12px)' },
    { value: 'sm', label: 'SM (14px)' },
    { value: 'base', label: 'Base (16px)' },
    { value: 'lg', label: 'LG (18px)' },
    { value: 'xl', label: 'XL (20px)' },
    { value: '2xl', label: '2XL (24px)' },
    { value: '3xl', label: '3XL (30px)' },
    { value: '4xl', label: '4XL (36px)' },
] as const;

export const TEXT_ALIGNMENTS = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
    { value: 'justify', icon: AlignJustify, label: 'Justify' },
] as const;

export const TEXT_DECORATIONS = [
    { value: 'italic', icon: Italic, label: 'Italic' },
    { value: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
    { value: 'underline', icon: Underline, label: 'Underline' },
    { value: 'overline', icon: Minus, label: 'Overline' },
    { value: 'none', icon: Circle, label: 'None' },
] as const;

// ============================================================================
// BORDER OPTIONS (SSOT)
// ============================================================================

export const BORDER_STYLES = [
    'Default', 'none', 'solid', 'dashed', 'dotted', 'double'
] as const;

export const BORDER_COLORS = [
    { value: 'Default', label: 'Default' },
    { value: 'transparent', label: 'Transparent' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' },
    { value: 'primary', label: 'Primary' },
] as const;

export const BORDER_RADII = [
    { value: 'Default', label: 'Default' },
    { value: 'none', label: 'None (0)' },
    { value: 'sm', label: 'Small (2px)' },
    { value: 'md', label: 'Medium (6px)' },
    { value: 'lg', label: 'Large (8px)' },
    { value: 'xl', label: 'XL (12px)' },
    { value: '2xl', label: '2XL (16px)' },
    { value: 'full', label: 'Full (9999px)' },
] as const;

// ============================================================================
// SHADOW OPTIONS (SSOT)
// ============================================================================

export const BOX_SHADOWS = [
    { value: 'Default', label: 'Default' },
    { value: 'none', label: 'None' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: '2XL' },
] as const;

// ============================================================================
// DIMENSION OPTIONS (SSOT)
// ============================================================================

export const SIZE_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'auto'] as const;

export const SIZE_PRESETS = [
    { value: 'auto', label: 'Auto' },
    { value: '100%', label: 'Full (100%)' },
    { value: '50%', label: 'Half (50%)' },
    { value: 'fit-content', label: 'Fit Content' },
    { value: 'min-content', label: 'Min Content' },
    { value: 'max-content', label: 'Max Content' },
] as const;

// ============================================================================
// DISPLAY OPTIONS (SSOT)
// ============================================================================

export const DISPLAY_OPTIONS = [
    { value: 'block', label: 'Block' },
    { value: 'inline', label: 'Inline' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'inline-flex', label: 'Inline Flex' },
    { value: 'grid', label: 'Grid' },
    { value: 'none', label: 'None (Hidden)' },
] as const;

export const FLEX_DIRECTIONS = [
    { value: 'row', label: 'Row →' },
    { value: 'row-reverse', label: 'Row Reverse ←' },
    { value: 'column', label: 'Column ↓' },
    { value: 'column-reverse', label: 'Column Reverse ↑' },
] as const;

export const FLEX_WRAPS = [
    { value: 'nowrap', label: 'No Wrap' },
    { value: 'wrap', label: 'Wrap' },
    { value: 'wrap-reverse', label: 'Wrap Reverse' },
] as const;

export const ALIGN_ITEMS = [
    { value: 'stretch', label: 'Stretch' },
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'baseline', label: 'Baseline' },
] as const;

export const JUSTIFY_CONTENT = [
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' },
    { value: 'space-evenly', label: 'Space Evenly' },
] as const;

export const GAP_OPTIONS = [
    { value: '0', label: 'None' },
    { value: '0.25rem', label: 'XS (4px)' },
    { value: '0.5rem', label: 'SM (8px)' },
    { value: '1rem', label: 'MD (16px)' },
    { value: '1.5rem', label: 'LG (24px)' },
    { value: '2rem', label: 'XL (32px)' },
] as const;

// ============================================================================
// POSITION OPTIONS (SSOT)
// ============================================================================

export const POSITION_OPTIONS = [
    { value: 'static', label: 'Static' },
    { value: 'relative', label: 'Relative' },
    { value: 'absolute', label: 'Absolute' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'sticky', label: 'Sticky' },
] as const;

export const OVERFLOW_OPTIONS = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'scroll', label: 'Scroll' },
    { value: 'auto', label: 'Auto' },
] as const;

// ============================================================================
// SPACING DEFAULTS (SSOT)
// ============================================================================

export const SPACING_DEFAULTS = {
    marginTop: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
} as const;

export const SPACING_ICONS = {
    top: '⊤',
    right: '⊣',
    bottom: '⊥',
    left: '⊢',
} as const;

// ============================================================================
// SUBSECTION COLORS (SSOT)
// ============================================================================

export const SUBSECTION_COLORS = {
    margin: 'orange',
    padding: 'green',
    lineHeight: 'blue',
    letterSpacing: 'blue',
    opacity: 'blue',
} as const;

// ============================================================================
// DEFAULT PROP VALUES (SSOT)
// ============================================================================

export const INSPECTOR_DEFAULTS = {
    fontFamily: 'Default',
    fontWeight: 'Regular',
    fontSize: 'Default',
    lineHeight: '1.75rem',
    letterSpacing: '0em',
    textAlign: '',
    textDecoration: '',
    color: '',
    backgroundColor: '',
    borderStyle: 'Default',
    borderColor: 'Default',
    borderWidth: '0px',
    borderRadius: 'Default',
    opacity: '100',
    boxShadow: 'Default',
    ...SPACING_DEFAULTS,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get display label for a prop value
 */
export function getColorLabel(value: string | undefined, prefix: string): string {
    if (!value) return 'Default';
    return `${prefix}-${value}`;
}

/**
 * Convert options array to select-compatible format
 */
export function toSelectOptions(options: readonly string[]): string[] {
    return [...options];
}

/**
 * Convert labeled options to select-compatible format
 */
export function toLabeledSelectOptions(
    options: readonly { value: string; label: string }[]
): Array<{ value: string; label: string }> {
    return options.map(o => ({ value: o.value, label: o.label }));
}
