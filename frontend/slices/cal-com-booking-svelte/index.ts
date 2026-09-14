export { default as CalEmbed } from "./components/CalEmbed.svelte";
export { calComBookingConfig } from "./config";
export type { CalComBookingConfig } from "./config";
export {
  DEFAULT_CAL_ORIGIN,
  calEmbedScriptUrl,
  loadCalEmbed,
  mountCalInline,
  normalizeCalLink,
  normalizeCalOrigin,
  type CalEmbedConfig,
  type CalInlineMountOptions,
} from "../cal-com-booking/lib/embed-core";
export { calComBookingTools, type CalComBookingCtx } from "../cal-com-booking/lib/tools";
