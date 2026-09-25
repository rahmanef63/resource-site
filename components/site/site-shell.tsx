"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TopNavbar } from "./top-navbar";
import { SiteFooter } from "./site-footer";

const BARE_PREFIXES = ["/preview", "/admin", "/admin-login"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const bare = BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (bare) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="fixed left-4 top-2 z-[100] -translate-y-16 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-lg ring-1 ring-border transition-transform focus:translate-y-0 focus:outline-none focus:ring-[3px] focus:ring-ring/50"
      >
        Skip to content
      </a>
      <TopNavbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {/* Project authorship belongs on this owned site's landing page, not exported templates. */}
      {pathname === "/" ? <SiteFooter /> : null}
    </div>
  );
}
