// Slice config (rr: frontend.configExport = "reelEditorConfig"). Cosmetic
// defaults only — composition state lives in the editor's draft/history.
export type ReelEditorConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** Default seconds an imported still image occupies on the timeline. */
  imageDurationSec: number;
  /** Auto-save the working draft to localStorage. */
  autosave: boolean;
  /** Default base folder the quick-import files pane opens in. */
  projectDir: string;
};

export const reelEditorConfig: ReelEditorConfig = {
  slug: "reel-editor",
  title: "Reel — video timeline editor",
  category: "os",
  imageDurationSec: 3,
  autosave: true,
  projectDir: "~/reel-projects/session",
};

export default reelEditorConfig;
