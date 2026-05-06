/**
 * aliases — prop alias resolution table.
 * Re-exports from StudioUISchema.ts (the normative SSOT).
 */
export {
  PROP_ALIAS_MAP,
  TSHIRT_GAP_MAP,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";

/**
 * Prop names that carry CSS length values.
 * In strict mode these must match the CSS_LENGTH_REGEX.
 */
export const CSS_LENGTH_PROPS = new Set([
  "gap", "columnGap", "rowGap",
  "width", "minWidth", "maxWidth",
  "height", "minHeight", "maxHeight",
  "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "paddingX", "paddingY",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight",
  "marginX", "marginY",
]);

/** Regex for valid CSS length values. */
export const CSS_LENGTH_REGEX =
  /^(0|auto|[0-9]+(\.[0-9]+)?(px|rem|em|%|vw|vh|vmin|vmax|dvh|dvw|ch|lh|fr))$/;

/** Regex for bare number strings that are missing a CSS unit. */
export const BARE_NUMBER_REGEX = /^\d+(\.\d+)?$/;
