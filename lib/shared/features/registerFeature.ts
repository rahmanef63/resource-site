// registerFeature — convenience helper that bootstraps the registry from a
// list of slice configs. Called once by `registry.generated.ts`.
//
// Most consumer code should NEVER import this directly — it's an internal
// glue between the generator's output and the runtime registry. The public
// API is in `registry.ts`.

import { _bootstrapRegistry, type RegisteredSlice } from "./registry";

export function registerFeatures(slices: RegisteredSlice[]) {
  _bootstrapRegistry(slices);
}
