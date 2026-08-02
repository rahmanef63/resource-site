import type { ComponentType } from "react";
import type { IconWeight } from "@phosphor-icons/react";

/**
 * An app / widget / menu icon. Accepts EITHER a `@phosphor-icons/react` icon OR
 * any hand-written SVG React component — the render sites only ever call
 * `<Icon className weight />`, so a custom icon just needs to take those (all
 * optional). Phosphor icons satisfy this out of the box; a plain SVG component
 * does too. Widen `icon: Icon` → `icon: IconType` to let an app ship its own
 * brand mark without giving up the phosphor set.
 */
export type IconType = ComponentType<{
  className?: string;
  weight?: IconWeight;
  size?: number | string;
}>;
