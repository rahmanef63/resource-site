"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TopNavbar } from "./top-navbar";

const BARE_PREFIXES = ["/preview", "/admin", "/admin-login"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const bare = BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (bare) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
