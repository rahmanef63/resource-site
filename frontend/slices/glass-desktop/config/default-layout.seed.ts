// glass-desktop — default placement seed (Build Plan §7, LOC-exempt seed).
// Empty until the T9–T13 widget batches land; the canvas renders nothing
// until instances are seeded.
import type { LayoutStateV1 } from "../types";

export const defaultLayout: LayoutStateV1 = {
  version: 1,
  instances: [],
};
