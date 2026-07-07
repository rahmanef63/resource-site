import { defineFeature } from "@/features/appshell";

// Widgets — the OLD slot-based widget feature (iOS Today page + desktop
// wallpaper stack). Upstream (rahmanef-com) replaced it with the registry-based
// widget system (registry/widgets + app-descriptor `widgets`) and dropped the
// `today`/`desktopWidgets` slot regions. ponytail: neutered to a no-op feature
// so the slice's catalog/preview keep compiling; the widget COMPONENTS are kept
// as files (./components/*) — rewire a slot here if this slice ever needs them.
export const widgetsFeature = defineFeature({
  id: "widgets",
});
