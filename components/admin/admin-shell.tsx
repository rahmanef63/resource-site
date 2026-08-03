"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Box,
  FileCode,
  GaugeCircle,
  GitBranch,
  Layout,
  LayoutGrid,
  PackageSearch,
  Settings,
  Sparkles,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardShell, type NavGroup } from "@/features/dashboard-shell";
import { NavUser } from "@/components/admin/nav-user";

// rr operator nav — the SSOT for the desktop rail AND the mobile dock.
const NAV: NavGroup[] = [
  {
    id: "edit",
    label: "Edit",
    items: [
      { id: "overview", label: "Overview", href: "/admin", icon: Sparkles, exact: true, dock: true },
      { id: "site", label: "Site", href: "/admin/site", icon: Settings },
      { id: "layouts", label: "Layouts", href: "/admin/layouts", icon: Layout, dock: true },
      { id: "sources", label: "Sources", href: "/admin/sources", icon: Box },
      { id: "export", label: "Export", href: "/admin/export", icon: FileCode },
    ],
  },
  {
    id: "inspect",
    label: "Inspect",
    items: [
      { id: "lineage", label: "Lineage", href: "/admin/lineage", icon: GitBranch },
      { id: "quality", label: "Quality", href: "/admin/quality", icon: GaugeCircle },
      { id: "registry", label: "Registry", href: "/admin/registry", icon: PackageSearch, dock: true },
    ],
  },
];

// Map known paths → breadcrumb label. Falls back to titlecased segment.
const LABELS: Record<string, string> = {
  admin: "Admin",
  site: "Site",
  layouts: "Layouts",
  sources: "Sources",
  export: "Export",
  lineage: "Lineage",
  quality: "Quality",
  registry: "Registry",
};

function labelFor(seg: string): string {
  return LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

function BreadcrumbTrail({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  // Drop leading "admin" segment — root crumb is fixed.
  const rest = segments[0] === "admin" ? segments.slice(1) : segments;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* On mobile the parent crumbs are hidden — but at /admin itself the
            root crumb IS the title, so keep it visible when it's alone. */}
        <BreadcrumbItem className={rest.length ? "hidden md:block" : undefined}>
          <BreadcrumbLink asChild>
            <Link href="/admin">Operator</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {rest.map((seg, i) => {
          const href = "/admin/" + rest.slice(0, i + 1).join("/");
          const isLast = i === rest.length - 1;
          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{labelFor(seg)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{labelFor(seg)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** rr's operator panel — mounts the dashboard-shell slice we ship, so /admin
 *  dogfoods the one dashboard: rail + ⌘B on desktop, sheet sidebar + bottom
 *  dock on mobile. */
export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <DashboardShell
      brand={{
        name: "Operator",
        caption: "rr control room",
        href: "/admin",
        logo: (
          <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutGrid className="size-4" />
          </span>
        ),
      }}
      nav={NAV}
      title={<BreadcrumbTrail pathname={pathname} />}
      sidebarFooter={<NavUser email={email} onLogout={logout} />}
      contentClassName="flex flex-col gap-4 p-4 sm:p-6"
    >
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertTriangle className="size-3.5 text-amber-500" />
        <AlertDescription className="text-[11px] leading-relaxed">
          Local edits live in your browser.{" "}
          <Link href="/admin/export" className="underline">
            Export
          </Link>{" "}
          to commit. Inspect tabs are read-only.
        </AlertDescription>
      </Alert>
      {children}
    </DashboardShell>
  );
}
