// Svelte 5/SvelteKit distribution for the start-here slice.
export { default as StartHere } from "./components/StartHere.svelte";
export {
  configureStartHere,
  startHereApi,
  type StartHereAdapter,
  type StartHereApi,
  type StartHereApp,
  type StartHereStage,
} from "./lib/host";
export {
  resolveStartHereStages,
  type ResolvedStartHereStage,
} from "./lib/journey";
