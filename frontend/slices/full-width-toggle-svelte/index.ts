// Svelte 5/SvelteKit distribution for the full-width-toggle slice.
export { default as FullWidthToggle } from "./components/FullWidthToggle.svelte";
export { default as WidthContainer } from "./components/WidthContainer.svelte";
export {
  DEFAULT_WIDTH_MODE,
  WIDTH_MODE_STORAGE_KEY,
  WIDTH_MODES,
  isWidthMode,
  nextWidthMode,
  normalizeWidthMode,
  readWidthMode,
  widthClass,
  writeWidthMode,
  type WidthMode,
} from "./lib/width-mode";
