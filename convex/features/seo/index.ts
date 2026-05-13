// callsInWindow is intentionally internal (see queries.ts) and exported via
// internal.slices.seo.callsInWindow for action-only consumption.
export { callsInWindow } from "./queries";
export { applyGenerated, _logGeneratorCall } from "./mutations";
export { generate, generateAndApply } from "./actions";
