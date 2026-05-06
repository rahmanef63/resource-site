"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  getMenuForWorkspace,
  getAllWorkspacesFlat,
  MOCK_SYSTEM_FEATURES,
  type MockWorkspace,
  type MockMenuItem,
} from "@/frontend/shared/mock-data";
import { DEFAULT_ACTIVE_THEME, useThemeConfig } from "@/frontend/shared/theme";

// Mock workspace type matching the real one
export type MockWorkspaceDoc = {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  ownerId: string;
  type?: string;
  icon?: string;
  color?: string;
  themePreset?: string;
  description?: string;
  settings?: any;
  isMainWorkspace?: boolean;
  parentWorkspaceId?: string | null;
  membership?: any;
  role?: any;
  isLinked?: boolean;
};

// Guest user mock
export const GUEST_USER = {
  id: "guest_user_001",
  name: "Guest User",
  email: "guest@superspace.demo",
  imageUrl: "",
  initials: "GU",
};

/**
 * Convert new MockWorkspace to legacy MockWorkspaceDoc format
 */
function convertToWorkspaceDoc(ws: MockWorkspace, isMain = false): MockWorkspaceDoc {
  return {
    _id: ws.id,
    _creationTime: Date.now(),
    name: ws.name,
    slug: ws.slug,
    ownerId: GUEST_USER.id,
    icon: ws.icon,
    color: ws.color,
    themePreset: ws.themePreset,
    description: ws.description,
    isMainWorkspace: isMain,
    parentWorkspaceId: ws.parentId ?? null,
  };
}

// Build flat list of workspaces from configs
function buildMockWorkspaces(): MockWorkspaceDoc[] {
  return getAllWorkspacesFlat().map((workspace, index) =>
    convertToWorkspaceDoc(workspace, index === 0)
  );
}

// Mock workspaces data - built from new structure
export const MOCK_WORKSPACES: MockWorkspaceDoc[] = buildMockWorkspaces();

// Re-export for backward compatibility
export { MOCK_SYSTEM_FEATURES };

export type GuestMenuItemRecord = {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  type: "page" | "group";
  order: number;
  isVisible: boolean;
  badge?: string | number;
  parentId?: string;
  path?: string;
  component?: string;
  metadata?: Record<string, unknown>;
};

// Legacy menu items (fallback)
export const MOCK_MENU_ITEMS: GuestMenuItemRecord[] = [
  { _id: "guest-overview", slug: "overview", name: "Overview", icon: "LayoutDashboard", type: "page", order: 0, isVisible: true },
  { _id: "guest-tasks", slug: "tasks", name: "Tasks", icon: "CheckSquare", type: "page", order: 1, isVisible: true },
  { _id: "guest-documents", slug: "documents", name: "Documents", icon: "FileText", type: "page", order: 2, isVisible: true },
  { _id: "guest-crm", slug: "crm", name: "CRM", icon: "Users", type: "page", order: 3, isVisible: true },
  { _id: "guest-analytics", slug: "analytics", name: "Analytics", icon: "BarChart3", type: "page", order: 4, isVisible: true },
  { _id: "guest-communications", slug: "communications", name: "Communications", icon: "MessageSquare", type: "page", order: 5, isVisible: true },
  { _id: "guest-inventory", slug: "inventory", name: "Inventory", icon: "Package", type: "page", order: 6, isVisible: true },
  { _id: "guest-calendar", slug: "calendar", name: "Calendar", icon: "Calendar", type: "page", order: 7, isVisible: true },
];

// Convert new MockMenuItem format to legacy format
function convertMenuItems(items: MockMenuItem[]): GuestMenuItemRecord[] {
  return items.map((item, index) => ({
    _id: item.id,
    slug: item.slug,
    name: item.label,
    icon: item.icon,
    type: item.children && item.children.length > 0 ? "group" : "page",
    order: index,
    isVisible: !item.disabled,
    badge: item.badge,
    parentId: undefined,
  }));
}

interface GuestWorkspaceContextValue {
  // Current workspace selection
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;

  // All workspaces (flat list)
  workspaces: MockWorkspaceDoc[];

  // Current workspace details
  currentWorkspace: MockWorkspaceDoc | null;

  // Main workspace
  mainWorkspace: MockWorkspaceDoc | null;
  isMainWorkspace: boolean;

  // Parent workspace
  parentWorkspace: MockWorkspaceDoc | null;

  // Children of current workspace
  childWorkspaces: MockWorkspaceDoc[];

  // Siblings
  siblingWorkspaces: MockWorkspaceDoc[];

  // Breadcrumb path
  workspacePath: MockWorkspaceDoc[];

  // Menu items for current workspace
  currentMenuItems: GuestMenuItemRecord[];

  // Guest theme state
  currentThemePreset: string;
  hasCurrentWorkspaceThemeOverride: boolean;
  setCurrentWorkspaceThemePreset: (themePreset: string | null) => void;

  // Guest mode indicator
  isGuestMode: true;
  guestUser: typeof GUEST_USER;

  // Loading state (always false for guest)
  isLoading: boolean;
}

const GuestWorkspaceContext = createContext<GuestWorkspaceContextValue | null>(null);
const GUEST_LAST_WORKSPACE_STORAGE_KEY = "superspace:guestLastWorkspaceId";
const GUEST_WORKSPACE_THEME_STORAGE_KEY = "superspace:guestWorkspaceThemePresets";

function readGuestThemeOverrides() {
  if (typeof window === "undefined") {
    return {} as Record<string, string>;
  }

  const stored = window.localStorage.getItem(GUEST_WORKSPACE_THEME_STORAGE_KEY);
  if (!stored) {
    return {} as Record<string, string>;
  }

  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    const validWorkspaceIds = new Set(MOCK_WORKSPACES.map((workspace) => workspace._id));

    return Object.entries(parsed).reduce<Record<string, string>>((accumulator, [workspaceId, themePreset]) => {
      if (
        validWorkspaceIds.has(workspaceId)
        && typeof themePreset === "string"
        && themePreset.trim().length > 0
      ) {
        accumulator[workspaceId] = themePreset;
      }

      return accumulator;
    }, {});
  } catch {
    return {} as Record<string, string>;
  }
}

function persistGuestThemeOverrides(themePresetsByWorkspace: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = Object.entries(themePresetsByWorkspace);
  if (entries.length === 0) {
    window.localStorage.removeItem(GUEST_WORKSPACE_THEME_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    GUEST_WORKSPACE_THEME_STORAGE_KEY,
    JSON.stringify(themePresetsByWorkspace),
  );
}

function GuestWorkspaceThemeSync() {
  const { currentThemePreset } = useGuestWorkspaceContext();
  const { setActiveTheme } = useThemeConfig();

  useEffect(() => {
    setActiveTheme(currentThemePreset);
  }, [currentThemePreset, setActiveTheme]);

  return null;
}

export function GuestWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(MOCK_WORKSPACES[0]._id);
  const [themePresetsByWorkspace, setThemePresetsByWorkspace] = useState<Record<string, string>>({});

  const setWorkspaceId = useCallback((id: string | null) => {
    setWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        window.localStorage.setItem(GUEST_LAST_WORKSPACE_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(GUEST_LAST_WORKSPACE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(GUEST_LAST_WORKSPACE_STORAGE_KEY);
    if (!stored) return;
    const exists = MOCK_WORKSPACES.some((ws) => ws._id === stored);
    if (exists) {
      setWorkspaceIdState(stored);
    }
  }, []);

  useEffect(() => {
    setThemePresetsByWorkspace(readGuestThemeOverrides());
  }, []);

  const setCurrentWorkspaceThemePreset = useCallback((themePreset: string | null) => {
    if (!workspaceId) {
      return;
    }

    setThemePresetsByWorkspace((previousState) => {
      const nextState = { ...previousState };

      if (themePreset && themePreset.trim().length > 0) {
        nextState[workspaceId] = themePreset;
      } else {
        delete nextState[workspaceId];
      }

      persistGuestThemeOverrides(nextState);
      return nextState;
    });
  }, [workspaceId]);

  const contextValue = useMemo<GuestWorkspaceContextValue>(() => {
    const currentWorkspace = workspaceId
      ? MOCK_WORKSPACES.find((ws) => ws._id === workspaceId) ?? null
      : null;

    const mainWorkspace = MOCK_WORKSPACES.find((ws) => ws.isMainWorkspace) ?? null;
    const isMainWorkspace = Boolean(currentWorkspace?.isMainWorkspace);

    // Parent workspace
    const parentWorkspace = currentWorkspace?.parentWorkspaceId
      ? MOCK_WORKSPACES.find((ws) => ws._id === currentWorkspace.parentWorkspaceId) ?? null
      : null;

    // Child workspaces
    const childWorkspaces = MOCK_WORKSPACES.filter(
      (ws) => ws.parentWorkspaceId === workspaceId
    );

    // Sibling workspaces (same parent)
    const siblingWorkspaces = currentWorkspace?.parentWorkspaceId
      ? MOCK_WORKSPACES.filter(
        (ws) => ws.parentWorkspaceId === currentWorkspace.parentWorkspaceId && ws._id !== workspaceId
      )
      : MOCK_WORKSPACES.filter((ws) => !ws.parentWorkspaceId && ws._id !== workspaceId);

    // Build workspace path
    const workspacePath: MockWorkspaceDoc[] = [];
    let current = currentWorkspace;
    while (current) {
      workspacePath.unshift(current);
      current = current.parentWorkspaceId
        ? MOCK_WORKSPACES.find((ws) => ws._id === current!.parentWorkspaceId) ?? null
        : null;
    }

    // Get menu items for current workspace
    const menuItems = workspaceId ? getMenuForWorkspace(workspaceId) : [];
    const currentMenuItems = menuItems.length > 0
      ? convertMenuItems(menuItems)
      : MOCK_MENU_ITEMS;
    const workspaceDefaultThemePreset = currentWorkspace?.themePreset ?? DEFAULT_ACTIVE_THEME;
    const workspaceThemeOverride = workspaceId
      ? themePresetsByWorkspace[workspaceId] ?? null
      : null;
    const currentThemePreset = workspaceThemeOverride ?? workspaceDefaultThemePreset;
    const hasCurrentWorkspaceThemeOverride = Boolean(workspaceThemeOverride);

    return {
      workspaceId,
      setWorkspaceId,
      workspaces: MOCK_WORKSPACES,
      currentWorkspace,
      mainWorkspace,
      isMainWorkspace,
      parentWorkspace,
      childWorkspaces,
      siblingWorkspaces,
      workspacePath,
      currentMenuItems,
      currentThemePreset,
      hasCurrentWorkspaceThemeOverride,
      setCurrentWorkspaceThemePreset,
      isGuestMode: true,
      guestUser: GUEST_USER,
      isLoading: false,
    };
  }, [themePresetsByWorkspace, workspaceId, setCurrentWorkspaceThemePreset, setWorkspaceId]);

  return (
    <GuestWorkspaceContext.Provider value={contextValue}>
      <GuestWorkspaceThemeSync />
      {children}
    </GuestWorkspaceContext.Provider>
  );
}

export function useGuestWorkspaceContext() {
  const context = useContext(GuestWorkspaceContext);
  if (!context) {
    throw new Error("useGuestWorkspaceContext must be used within GuestWorkspaceProvider");
  }
  return context;
}

export function useGuestWorkspaceContextOptional() {
  return useContext(GuestWorkspaceContext);
}

/**
 * Check if we're in guest mode
 */
export function useIsGuestMode() {
  const context = useContext(GuestWorkspaceContext);
  return context !== null;
}
