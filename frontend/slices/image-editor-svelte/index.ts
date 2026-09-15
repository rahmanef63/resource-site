export { default as ImageEditor } from "./components/ImageEditor.svelte";
export { imageEditorConfig, type ImageEditorSvelteConfig } from "./config";
export { createBrowserEditor, type BrowserEditorCore, type EditorSnapshot } from "@/features/image-editor/lib/editor-core";
export { imageEditorTools, EDITOR_COMMANDS, EDITOR_TOOLS } from "@/features/image-editor/commands/registry";
export { invokeEditorCommand, type ToolInvocation, type ToolOutcome } from "@/features/image-editor/commands/invoke";
export type { ImageEditorAssistantRunner, ImageEditorAssistantRequest, ImageEditorMessage } from "@/features/image-editor/lib/assistant-core";
export { downloadProject, parseProject, loadAutosave, saveAutosave, type Project } from "@/features/image-editor/lib/project-core";
