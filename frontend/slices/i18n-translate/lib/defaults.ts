import type { Lang } from "./types";

export const DEFAULT_LANGUAGES: Lang[] = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "中文 (简)" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ไทย" },
  { code: "nl", label: "Nederlands" },
  { code: "it", label: "Italiano" },
];

export const SCRIPT_ID = "__google_translate_script";
export const STYLE_ID = "__google_translate_style";

// Plain Tailwind defaults (no project-specific utilities). Consumers can
// override any of these via the corresponding *ClassName prop.
export const DEFAULT_TRIGGER_CLASS =
  "inline-flex items-center gap-1 h-9 px-2 border-2 rounded-md bg-background text-foreground text-[10px] uppercase tracking-wider font-bold hover:bg-foreground hover:text-background transition-colors";
export const DEFAULT_MENU_CLASS =
  "absolute right-0 top-full mt-1 z-50 max-h-80 overflow-y-auto w-44 border-2 rounded-md bg-background shadow-lg";
export const DEFAULT_ITEM_CLASS =
  "w-full text-left px-3 py-2 text-xs hover:bg-foreground hover:text-background transition-colors";
export const DEFAULT_ACTIVE_ITEM_CLASS = "bg-muted font-semibold";
