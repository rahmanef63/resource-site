"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";

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
        <BreadcrumbItem className="hidden md:block">
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
    <SidebarProvider>
      <AppSidebar email={email} onLogout={logout} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/60 px-3 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <BreadcrumbTrail pathname={pathname} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
