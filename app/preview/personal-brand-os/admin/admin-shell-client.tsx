"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/templates/_shared/ui/admin-shell";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/personal-brand/shared/site-config";
import {
  ADMIN_BASE,
  ADMIN_SETTINGS_NAV,
  OWNER_USER,
  buildAdminPrimaryNav,
} from "@/components/templates/personal-brand/shared/nav-config";

export function AdminShellClient({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const primaryNav = buildAdminPrimaryNav(state);
  return (
    <AdminShell
      brand={DEFAULT_SITE_CONFIG}
      appLabel="admin"
      homeHref={ADMIN_BASE}
      primaryNav={primaryNav}
      settingsNav={ADMIN_SETTINGS_NAV}
      user={OWNER_USER}
      searchPlaceholder="Search posts, leads, contacts…"
    >
      {children}
    </AdminShell>
  );
}
