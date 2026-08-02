// callsInWindow is intentionally internal (see queries.ts) and exported via
// internal.slices.seo.callsInWindow for action-only consumption.
export { callsInWindow } from "./query";
export { applyGenerated, _logGeneratorCall } from "./mutation";
export { generate, generateAndApply } from "./action";
