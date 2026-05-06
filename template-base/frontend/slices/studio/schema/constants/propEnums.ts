/**
 * propEnums — canonical enum values for validated props.
 * Re-exports Zod-inferred types from StudioUISchema.ts.
 */
export {
  DisplayEnum,
  FlexDirectionEnum,
  JustifyContentEnum,
  AlignItemsEnum,
  FlexWrapEnum,
  GridColumnsEnum,
  CSSLengthSchema,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";

export type {
  Display,
  FlexDirection,
  JustifyContent,
  AlignItems,
  FlexWrap,
  GridColumns,
} from "@/frontend/slices/studio/ui/types/StudioUISchema";

/** Valid flex-direction values. */
export const FLEX_DIRECTION_VALUES = new Set(["row", "column", "row-reverse", "column-reverse"]);

/** Valid display values for layout containers. */
export const DISPLAY_VALUES = new Set(["block", "flex", "grid", "inline-flex", "inline-block", "inline", "none"]);

/** Layout container widget types that should never use display:"block". */
export const LAYOUT_CONTAINER_TYPES = new Set([
  "div", "section", "flex", "grid", "twoColumn", "threeColumn",
  "card", "formGroup", "buttonGroup", "navGroup", "scrollArea",
  "row", "column", "container", // deprecated but still renderable
]);
