import type { ComponentType } from "react";
import type { WidgetDescriptor, WidgetProps } from "./types";

export interface WidgetDef extends WidgetDescriptor {
  component: ComponentType<WidgetProps>;
}

export type WidgetRegistry = Record<string, WidgetDef>;
