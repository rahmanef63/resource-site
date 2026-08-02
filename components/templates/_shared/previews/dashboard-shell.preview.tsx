"use client";

/** Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 *  template-base is tsc-excluded; this file imports ONLY site-compiled code
 *  (the slice's real implementation lives at components/templates/_shared/ui,
 *  which all 8 OS templates mount in production). */

import { FileText, Home, Settings, Users } from "lucide-react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import {
  DashboardShell,
  type AdminNavGroup,
  type AdminNavItem,
  type Brand,
  type User,
} from "@/components/templates/_shared";

const BRAND: Brand = {
  brandLetter: "A",
  brandName: "Acme Studio",
  tagline: "Demo workspace",
  description: "Variant-preview demo brand",
  baseUrl: "#",
  twitter: "",
  email: "demo@acme.test",
  defaultLocale: "en-US",
  themeColor: "#888888",
};

const USER: User = { name: "Demo Admin", role: "Owner", initials: "DA" };

const FLAT_NAV: AdminNavItem[] = [
  { id: "home", label: "Overview", href: "#", icon: Home },
  { id: "pages", label: "Pages", href: "#", icon: FileText, count: 4 },
  { id: "members", label: "Members", href: "#", icon: Users },
];

const GROUPED_NAV: AdminNavGroup[] = [
  { id: "pages", label: "Pages", homeAware: true, items: FLAT_NAV },
  {
    id: "settings",
    label: "Settings",
    items: [{ id: "general", label: "General", href: "#", icon: Settings }],
  },
];

function SampleContent() {
  return (
    <div className="space-y-3 p-4">
      <div className="h-20 rounded-lg border border-dashed border-border bg-muted/30" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-14 rounded-lg border border-border bg-card" />
        <div className="h-14 rounded-lg border border-border bg-card" />
        <div className="h-14 rounded-lg border border-border bg-card" />
      </div>
    </div>
  );
}

const preview: SlicePreviewModule = {
  DashboardShell: ({ variant }) => {
    const grouped = variant.scenario === "grouped-nav";
    return (
      <div className="p-4">
        <div className="h-[400px] overflow-hidden rounded-lg border border-border">
          <DashboardShell
            key={variant.scenario}
            brand={BRAND}
            appLabel="Admin"
            homeHref="#"
            primaryNav={grouped ? undefined : FLAT_NAV}
            primaryNavGroups={grouped ? GROUPED_NAV : undefined}
            user={USER}
            searchPlaceholder="Search…"
            notifCount={3}
          >
            <SampleContent />
          </DashboardShell>
        </div>
      </div>
    );
  },
};

export default preview;
