// glass-desktop — the widget registry (Build Plan §5.2 "registry, not switch").
// A family-composed map of WidgetDef keyed by widget id. Adding a widget =
// one component + one registry entry + one seed row. Populated in T9–T13.
import type { WidgetRegistry } from "../types";

export const widgetRegistry: WidgetRegistry = {};
