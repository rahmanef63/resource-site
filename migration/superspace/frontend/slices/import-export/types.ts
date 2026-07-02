export interface TransferJob {
    id: string;
    type: 'import' | 'export';
    entity: string; // e.g., 'contacts', 'products'
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    startedAt: string;
    completedAt?: string;
    recordCount: number;
    fileName: string;
}

export interface ImportExportStats {
    totalExports: number;
    totalImports: number;
    failedJobs: number;
    activeJobs: number;
}

export interface ImportExportData {
    stats: ImportExportStats;
    recentJobs: TransferJob[];
    isLoading: boolean;
}

// ─── Bulk Migration Types ────────────────────────────────────────────────────

export interface WorkspaceMigrationEntry {
    localId: string;
    parentLocalId?: string;
    workspace: {
        name: string;
        slug?: string;
        type?: string;
        description?: string;
        timezone?: string;
        language?: string;
        icon?: string;
        color?: string;
        themePreset?: string;
        settings?: Record<string, unknown>;
    };
    roles?: Array<{
        name: string;
        slug: string;
        description?: string;
        permissions: string[];
        color?: string;
        level?: number;
        isSystemRole?: boolean;
    }>;
    members?: Array<{
        email: string;
        roleSlug: string;
        additionalPermissions?: string[];
    }>;
    enabledFeatures?: string[];
}

export interface WorkspaceMigrationManifest {
    version: '2.0';
    createdAt?: number;
    meta: {
        name: string;
        description?: string;
        author?: string;
        tags?: string[];
    };
    workspaces: WorkspaceMigrationEntry[];
}

export interface MigrationWorkspaceResult {
    localId: string;
    workspaceId?: string;
    name: string;
    status: 'created' | 'failed' | 'skipped' | 'rolled_back';
    error?: string;
}

export interface BulkMigrationResult {
    migrationId: string;
    status: 'completed' | 'partial' | 'failed';
    totalWorkspaces: number;
    createdWorkspaces: number;
    failedWorkspaces: number;
    results: MigrationWorkspaceResult[];
}

export interface MigrationValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    preview: {
        migrationName: string;
        totalWorkspaces: number;
        rootWorkspaces: number;
        totalRoles: number;
        totalMembers: number;
        hierarchy: Array<{
            localId: string;
            name: string;
            type: string;
            parentLocalId: string | null;
            rolesCount: number;
            membersCount: number;
            featuresCount: number;
        }>;
    } | null;
}

export interface MigrationOptions {
    autoResolveSlugConflicts?: boolean;
    importMembers?: boolean;
    dryRun?: boolean;
}
