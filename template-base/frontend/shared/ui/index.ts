/**
 * Minimal UI barrel — exports just the bits the studio extraction needs.
 * Extend as more callers land. Mirrors the shape of
 * superspace/frontend/shared/ui/index.ts but only re-exports what exists here.
 */

export { ResponsiveDialog } from "./components/ResponsiveDialog";
export { SharedCanvas } from "./components/canvas/SharedCanvas";
export { CMSPreview } from "./components/preview/CMSPreview";
export { AutomationPreview } from "./components/preview/AutomationPreview";
