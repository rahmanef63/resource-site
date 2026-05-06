/**
 * Mock Data for Guest Dashboard
 * Provides structured workspace configs with unique menus per workspace
 */

export * from "./types";
export * from "./workspaces";

import type { WorkspaceConfig, MockWorkspace, MockMenuItem, MockSystemFeature } from "./types";
import {
    corporateConfig,
    creativeAgencyConfig,
    academicConfig,
    healthcareConfig,
    ngoConfig,
    governmentConfig,
    retailConfig,
    constructionConfig,
    personalConfig,
    communityConfig,
} from "./workspaces";

/**
 * All workspace configurations
 */
export const ALL_WORKSPACE_CONFIGS: WorkspaceConfig[] = [
    corporateConfig,
    creativeAgencyConfig,
    academicConfig,
    healthcareConfig,
    ngoConfig,
    governmentConfig,
    retailConfig,
    constructionConfig,
    personalConfig,
    communityConfig,
];

function findWorkspaceInTree(workspace: MockWorkspace, workspaceId: string): MockWorkspace | undefined {
    if (workspace.id === workspaceId) {
        return workspace;
    }

    for (const child of workspace.children ?? []) {
        const nestedMatch = findWorkspaceInTree(child, workspaceId);
        if (nestedMatch) {
            return nestedMatch;
        }
    }

    return undefined;
}

function flattenWorkspaceTree(workspace: MockWorkspace): MockWorkspace[] {
    return [
        workspace,
        ...(workspace.children?.flatMap((child) => flattenWorkspaceTree(child)) ?? []),
    ];
}

/**
 * Get workspace config by ID
 */
export function getWorkspaceConfig(workspaceId: string): WorkspaceConfig | undefined {
    for (const config of ALL_WORKSPACE_CONFIGS) {
        if (findWorkspaceInTree(config.workspace, workspaceId)) {
            return config;
        }
    }

    return undefined;
}

/**
 * Get exact workspace node by ID
 */
export function getWorkspaceById(workspaceId: string): MockWorkspace | undefined {
    for (const config of ALL_WORKSPACE_CONFIGS) {
        const workspace = findWorkspaceInTree(config.workspace, workspaceId);
        if (workspace) {
            return workspace;
        }
    }

    return undefined;
}

/**
 * Get menu items for a workspace
 */
export function getMenuForWorkspace(workspaceId: string): MockMenuItem[] {
    return getWorkspaceById(workspaceId)?.menuItems ?? [];
}

/**
 * Get enabled feature IDs for a workspace
 */
export function getEnabledFeaturesForWorkspace(workspaceId: string): string[] {
    return getWorkspaceById(workspaceId)?.enabledFeatures ?? [];
}

/**
 * Get all workspaces as flat list (for workspace switcher)
 */
export function getAllWorkspacesFlat(): MockWorkspace[] {
    return ALL_WORKSPACE_CONFIGS.flatMap((config) => flattenWorkspaceTree(config.workspace));
}

/**
 * Get child workspaces of a parent
 */
export function getChildWorkspaces(parentId: string): MockWorkspace[] {
    return getWorkspaceById(parentId)?.children ?? [];
}

/**
 * Mock system features for feature store
 */
export const MOCK_SYSTEM_FEATURES: MockSystemFeature[] = [
    { featureId: "overview", name: "Overview", description: "Dashboard overview", icon: "LayoutDashboard", category: "core", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "tasks", name: "Tasks", description: "Task management", icon: "CheckSquare", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "calendar", name: "Calendar", description: "Event scheduling", icon: "Calendar", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "documents", name: "Documents", description: "Document management", icon: "FileText", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "projects", name: "Projects", description: "Project tracking", icon: "FolderKanban", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "crm", name: "CRM", description: "Customer management", icon: "Users", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "analytics", name: "Analytics", description: "Data insights", icon: "BarChart3", category: "insights", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "ai", name: "AI Assistant", description: "AI-powered help", icon: "Sparkles", category: "ai", isInstalled: true, isPremium: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "inventory", name: "Inventory", description: "Stock management", icon: "Package", category: "operations", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "sales", name: "Sales", description: "Sales tracking", icon: "Receipt", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "communications", name: "Communications", description: "Messaging", icon: "MessageCircle", category: "communication", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "automation", name: "Automation", description: "Workflow automation", icon: "Workflow", category: "operations", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "support", name: "Support", description: "Customer support", icon: "HeadphonesIcon", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "reports", name: "Reports", description: "Report generation", icon: "FileBarChart", category: "insights", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "contact", name: "Contacts", description: "Contact management", icon: "Contact", category: "communication", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "knowledge", name: "Knowledge Base", description: "Documentation", icon: "BookOpen", category: "content", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
];
