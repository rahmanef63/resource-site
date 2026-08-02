// Tweakcn color-preset types (ported from os-vps lib/appearance/presets,
// adapted to this app's conventions: dark = `.dark` class, persistence via
// the lib/appearance store's `preset` field).
export interface PresetItem {
  name: string;
  title: string;
  type?: string;
  description?: string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

export interface PresetRegistry {
  name: string;
  items: PresetItem[];
}

export interface PresetGroup {
  id: string;
  label: string;
  items: PresetItem[];
}

/** id of the injected <style> tag holding the active preset's CSS vars. */
export const PRESET_STYLE_ID = "os-theme-preset";
