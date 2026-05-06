import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TwoColumnLayout } from "../../../container/two-column";
import { SecondarySidebarHeader, type SecondarySidebarHeaderProps } from "./SecondarySidebarHeader";
import { SecondarySidebar, type SecondarySidebarProps } from "./SecondarySidebar";

export interface SecondarySidebarLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  bodyClassName?: string;
  headerProps?: SecondarySidebarHeaderProps;
  sidebarProps?: SecondarySidebarProps;
}

function SecondarySidebarLayoutBase({
  header,
  sidebar,
  children,
  className,
  headerClassName,
  sidebarClassName,
  contentClassName,
  bodyClassName,
  headerProps,
  sidebarProps,
}: SecondarySidebarLayoutProps) {
  const resolvedHeader = header ?? (headerProps ? <SecondarySidebarHeader {...headerProps} /> : null);
  const resolvedSidebar = sidebar ?? (sidebarProps ? <SecondarySidebar {...sidebarProps} /> : null);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {resolvedHeader ? (
        <header className={cn("shrink-0", headerClassName)}>
          {resolvedHeader}
        </header>
      ) : null}

      <div className={cn("flex min-h-0 flex-1", bodyClassName)}>
        {resolvedSidebar ? (
          <TwoColumnLayout
            main={
              <div className={cn("h-full overflow-y-auto", contentClassName)}>
                {children}
              </div>
            }
            sidebar={
              <div className={cn("h-full overflow-y-auto bg-muted/30", sidebarClassName)}>
                {resolvedSidebar}
              </div>
            }
            sidebarWidth={320}
            sidebarPosition="left"
            storageKey="secondary-sidebar-layout"
            persistState={true}
          />
        ) : (
          <main className={cn("flex-1 min-h-0 overflow-y-auto", contentClassName)}>
            {children}
          </main>
        )}
      </div>
    </div>
  );
}

type SecondarySidebarLayoutComponent = ((
  props: SecondarySidebarLayoutProps
) => ReactElement) & {
  Header: typeof SecondarySidebarHeader;
  Sidebar: typeof SecondarySidebar;
};

export const SecondarySidebarLayout = Object.assign(SecondarySidebarLayoutBase, {
  Header: SecondarySidebarHeader,
  Sidebar: SecondarySidebar,
}) as SecondarySidebarLayoutComponent;

// Re-export types and components
export type {
  SecondarySidebarHeaderProps,
  SecondaryHeaderAction,
} from "./SecondarySidebarHeader";

export type {
  SecondarySidebarProps,
  SecondarySidebarSectionProps,
  SecondarySidebarItem,
} from "./SecondarySidebar";

export { SecondarySidebarHeader } from "./SecondarySidebarHeader";
export { SecondarySidebar } from "./SecondarySidebar";
