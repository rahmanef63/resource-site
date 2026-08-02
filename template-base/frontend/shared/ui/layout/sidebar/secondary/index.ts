// Secondary Sidebar Components
export * from "./components/SecondarySidebarLayout";
export * from "./components/SecondarySidebarHeader";
export * from "./components/SecondarySidebar";
export * from "./components/SecondarySidebarTools";

// Secondary Sidebar Utilities
export * from "./utils";

// Secondary List Component (NEW - Registry-based)
export { SecondaryList } from "./components/SecondaryList";
export type { SecondaryListProps } from "./components/SecondaryList";

// Variant Registry System (NEW)
export {
  itemVariantRegistry,
  createVariant,
  itemVariant,
  asVariantId,
} from "./lib/variant-registry";

export type {
  VariantId,
  ItemBase,
  RenderUtils,
  RenderCtx,
  VariantDef,
  SecondaryItem,
} from "./lib/variant-registry";

// Built-in Variants (NEW)
export { registerBuiltInVariants } from "./lib/built-in-variants";

// Barrel export for easier access
import { SecondarySidebarLayout } from "./components/SecondarySidebarLayout";
import { SecondarySidebarHeader } from "./components/SecondarySidebarHeader";
import { SecondarySidebar } from "./components/SecondarySidebar";
import { SecondarySidebarTools } from "./components/SecondarySidebarTools";
import { SecondaryList } from "./components/SecondaryList";

export const SecondarySidebarLayoutNamespace = SecondarySidebarLayout;

export default {
  Layout: SecondarySidebarLayout,
  Header: SecondarySidebarHeader,
  Sidebar: SecondarySidebar,
  Tools: SecondarySidebarTools,
  List: SecondaryList,
};
