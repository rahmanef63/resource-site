"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { CreateWorkspaceDrawer } from "@/frontend/shared/foundation/workspaces/components/CreateWorkspaceDrawer";

interface Workspace {
  name: string;
  logo: React.ElementType;
  plan: string;
  id: Id<"workspaces">;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  onWorkspaceSelect: (workspace: Workspace) => void;
  isLoading?: boolean;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onWorkspaceSelect,
  isLoading = false,
}: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const activeWorkspace =
    currentWorkspace ?? (mounted && workspaces.length > 0 ? workspaces[0] : undefined);
  const activeWorkspaceId = activeWorkspace ? String(activeWorkspace.id) : "";

  const handleWorkspaceValueChange = React.useCallback(
    (value: string) => {
      if (!value || value === activeWorkspaceId) {
        return;
      }
      const next = workspaces.find((workspace) => String(workspace.id) === value);
      if (next) {
        onWorkspaceSelect(next);
      }
    },
    [activeWorkspaceId, onWorkspaceSelect, workspaces],
  );

  // Stable shell before hydration to avoid mismatches
  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Workspace</span>
              <span className="truncate text-xs">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="opacity-75">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading workspaces...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setCreateOpen(true)}
              className="justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                  <Plus className="size-4" />
                </div>
                <div className="grid text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Create workspace</span>
                  <span className="truncate text-xs text-muted-foreground">No workspaces yet</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <CreateWorkspaceDrawer open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeWorkspace && <activeWorkspace.logo className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
                <span className="truncate text-xs">
                  {activeWorkspace?.plan || ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeWorkspaceId}
              onValueChange={handleWorkspaceValueChange}
            >
              {workspaces.map((workspace, index) => {
                const workspaceValue = String(workspace.id);
                return (
                  <DropdownMenuRadioItem
                    key={workspace.id}
                    value={workspaceValue}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <workspace.logo className="size-4 shrink-0" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{workspace.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {workspace.plan}
                      </span>
                    </div>
                    <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => setCreateOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <CreateWorkspaceDrawer open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
