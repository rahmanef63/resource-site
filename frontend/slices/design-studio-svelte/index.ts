export { default as MediaStudio } from "./components/MediaStudio.svelte";
export { default as CanvasStage } from "./components/CanvasStage.svelte";
export { default as SidePanel } from "./components/SidePanel.svelte";
export { createStudioStore } from "@/features/design-studio/lib/studio-core";
export { createSceneStore } from "@/features/design-studio/lib/scene-core";
export { configureMediaStudio } from "@/features/design-studio/lib/host-core";
export { parseDoc, buildHTML, importFile } from "@/features/design-studio/lib/serialize";
export * from "@/features/design-studio/lib/model-core";
