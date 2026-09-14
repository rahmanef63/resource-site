export { default as DynamicIcon } from "./components/DynamicIcon.svelte";
export { default as IconPicker } from "./components/IconPicker.svelte";
export { default as IconPickerInline } from "./components/IconPickerInline.svelte";
export { default as PickerSkeleton } from "./components/PickerSkeleton.svelte";
export { iconPickerFeature } from "./config";

export {
  parseIconValue,
  isLucideValue,
  isPhosphorValue,
  lucideValue,
  phosphorValue,
  withColor,
  LUCIDE_PREFIX,
  PHOSPHOR_PREFIX,
  type IconValue,
} from "@/features/icon-picker/lib/parse";
export { ICON_COLORS, type IconColor } from "@/features/icon-picker/lib/colors";
export { EMOJI_GROUPS, ALL_EMOJIS } from "@/features/icon-picker/lib/emoji-catalog";
export { LUCIDE_GROUPS, ALL_LUCIDE } from "@/features/icon-picker/lib/lucide-catalog";
export { PHOSPHOR_GROUPS, ALL_PHOSPHOR } from "@/features/icon-picker/lib/phosphor-catalog";
export { ICON_FILL_RATIO, renderSizeFor, type IconRenderKind } from "@/features/icon-picker/lib/icon-render-config";
export { clearRecents, pushRecent, getRecentIconsSnapshot, subscribeRecentIcons } from "@/features/icon-picker/lib/recents-core";
export { DEFAULT_ICON_STYLE, readIconStyle, setIconStyle, subscribeIconStyle, type Style as IconStyle } from "@/features/icon-picker/lib/style-core";
export { twemojiUrl } from "@/features/icon-picker/lib/twemoji";
export { DEFAULT_PAGE_ICON, DEFAULT_DATABASE_ICON, DEFAULT_ROW_ICON } from "@/features/icon-picker/lib/defaults";
export { iconPickerTools, type IconPickerCtx } from "@/features/icon-picker/lib/tools";
