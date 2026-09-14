// Slice public barrel — re-exports only.
export { default as CalEmbed, type CalEmbedProps } from "./components/embed";
export {
  DEFAULT_CAL_ORIGIN,
  calEmbedScriptUrl,
  loadCalEmbed,
  mountCalInline,
  normalizeCalLink,
  normalizeCalOrigin,
  type CalEmbedConfig,
  type CalInlineMountOptions,
} from "./lib/embed-core";
export { calComBookingTools, type CalComBookingCtx } from "./lib/tools";
