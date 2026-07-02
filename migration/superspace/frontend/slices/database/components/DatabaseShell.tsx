"use client";

import type { ReactNode } from "react";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";

export interface DatabaseShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function DatabaseShell({ header, sidebar, children }: DatabaseShellProps) {
  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      header={header}
      sidebar={sidebar}
      contentClassName="flex h-full flex-col"
    >
      {children}
    </SecondarySidebarLayout>
  );
}
