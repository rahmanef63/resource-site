// ── Bundled shell features ───────────────────────────────────────────────────
// Each is a defineFeature() contribution mounted via `manifest.features`. They
// live inside this slice (appshell/features/*) so the whole shell installs as
// one unit. Imported here so the core bindings they read are already live.
import { searchFeature } from "./features/search";
import { quickLookFeature } from "./features/quick-look";
import { clipboardFeature } from "./features/clipboard";
import { shareFeature } from "./features/share";
import { shortcutHelpFeature } from "./features/shortcut-help";
import { lockScreenFeature } from "./features/lock-screen";
import { inspectorFeature } from "./features/inspector";
import { notificationsFeature } from "./features/notifications";
import { controlCenterFeature } from "./features/control-center";

// The default system-feature set — generic, brand-free, app-agnostic. Drop all
// five into any consumer's manifest in one line (`features: DEFAULT_FEATURES`).
// Spread + override/trim per project; each entry is independently removable since
// the surfaces are slot-driven (a feature absent from the array just doesn't mount).
export const DEFAULT_FEATURES = [
  searchFeature,
  quickLookFeature,
  clipboardFeature,
  shareFeature,
  shortcutHelpFeature,
  lockScreenFeature,
  inspectorFeature,
  notificationsFeature,
  controlCenterFeature,
];
