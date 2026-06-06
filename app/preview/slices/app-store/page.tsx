"use client";

import { AppStore } from "@/features/app-store";

// Live preview: the storefront — install/uninstall catalog apps, toggle
// built-ins. Pairs with <CreateApp /> writing the same localStorage
// registry; useInstalledApps() feeds an appshell-style launcher.

export default function AppStorePreview() {
  return (
    <div className="h-dvh w-full">
      <AppStore />
    </div>
  );
}
