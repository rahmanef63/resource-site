/**
 * Universal Data Transfer Types
 * 
 * Comprehensive type definitions for the universal data transfer system
 * that supports dialog, sheet, and panel display modes.
 * 
 * This file contains NEW types specific to the Universal component.
 * Engine types are re-exported from the data-export-types module.
 */

import type React from "react";
import type { LucideIcon } from "lucide-react";
import type {
    ExportFormat,
    ExportProperty,
    ImportResult,
    ImportError,
    ImportWarning,
} from "./data-export-types";

// Note: Engine types (ExportFormat, ExportProperty, etc) are exported from data-export-types.ts

// ============================================================================
// Display Mode Types
// ============================================================================

/**
 * Display Mode:
 * - 'dialog' (DEFAULT): Modal centered, for features without 3-column layout
 * - 'sheet': Slide-out panel, optional for better mobile experience
 * - 'panel': Embeddable in FeatureThreeColumnLayout right panel,
 *            alternates with inspector dynamically
 */
export type DisplayMode = "dialog" | "sheet" | "panel";

// ============================================================================
// Entity Configuration Types
// ============================================================================

/**
 * Configuration for an entity type that can be exported/imported
 */
export interface EntityTypeConfig {
    /** Unique identifier for this entity type */
    id: string;
    /** Display label */
    label: string;
    /** Icon component or icon name string */
    icon: LucideIcon | string;
    /** Properties that can be exported/imported */
    exportProperties: ExportProperty[];
    /** Function to fetch current data for export */
    getData?: () => Promise<any[]>;
    /** Function to handle imported data */
    handleImport?: (data: any[]) => Promise<ImportResult>;
    /** Optional description */
    description?: string;
}

// ============================================================================
// Field Mapping & Validation Types
// ============================================================================

/**
 * Represents a mapping between source header and target property
 */
export interface FieldMapping {
    /** Original header from import file */
    sourceHeader: string;
    /** Target property key in the system */
    targetProperty: string | null;
    /** Match type: exact, fuzzy, manual, unmapped */
    matchType: "exact" | "fuzzy" | "manual" | "unmapped";
    /** Match confidence (0-1) for fuzzy matches */
    confidence?: number;
    /** Whether this mapping is required */
    required?: boolean;
}

/**
 * Result of header validation
 */
export interface HeaderValidationResult {
    /** All mappings from source to target */
    mappings: FieldMapping[];
    /** Headers that couldn't be automatically mapped */
    unmappedHeaders: string[];
    /** Required fields that are missing in the source */
    missingRequiredFields: string[];
    /** Is the mapping valid enough to proceed? */
    isValid: boolean;
    /** Validation warnings */
    warnings: string[];
    /** Suggested alternative mappings */
    suggestions: Record<string, string[]>;
}

/**
 * Strategy for merging imported data with existing records
 */
export type MergeStrategy =
    | "skip"         // Skip if duplicate found
    | "overwrite"    // Replace existing with imported
    | "merge"        // Merge fields (imported wins on conflict)
    | "merge_keep"   // Merge fields (existing wins on conflict)
    | "create_new";  // Always create new (may create duplicates)

/**
 * Options for detecting duplicates
 */
export interface DuplicateDetectionOptions {
    /** Field(s) to use for duplicate detection */
    matchFields: string[];
    /** Match mode */
    matchMode: "all" | "any"; // all fields must match vs any field
    /** Case sensitive matching */
    caseSensitive?: boolean;
    /** Trim whitespace before comparing */
    trimWhitespace?: boolean;
}

/**
 * Import options for the data transfer
 */
export interface ImportOptions {
    /** Skip the first row (header row) */
    skipFirstRow?: boolean;
    /** What to do when duplicate found */
    mergeStrategy: MergeStrategy;
    /** Fields/options for duplicate detection */
    duplicateDetection?: DuplicateDetectionOptions;
    /** Field mapping from source to target */
    fieldMapping?: Record<string, string>;
    /** Transform values before import */
    valueTransforms?: Record<string, (value: any) => any>;
    /** Validation rules */
    validation?: ValidationRules;
    /** Batch size for processing */
    batchSize?: number;
    /** Continue on error (don't abort entire import) */
    continueOnError?: boolean;
}

/**
 * Validation rules for import
 */
export interface ValidationRules {
    /** Required fields that must have values */
    requiredFields?: string[];
    /** Type validation rules */
    typeValidation?: Record<string, "string" | "number" | "boolean" | "date" | "email" | "url">;
    /** Custom validation functions */
    customValidators?: Record<string, (value: any, row: any) => boolean | string>;
    /** Min/Max for numeric fields */
    numericRanges?: Record<string, { min?: number; max?: number }>;
    /** Pattern validation (regex) */
    patterns?: Record<string, RegExp | string>;
}

/**
 * Preview result with validation details
 */
export interface ImportPreviewResult {
    /** Sample data rows */
    data: any[];
    /** Detected headers */
    headers: string[];
    /** Total rows in file */
    totalRows: number;
    /** Header validation result */
    headerValidation: HeaderValidationResult;
    /** Row-level validation errors (preview only) */
    validationErrors: ImportError[];
    /** Warnings */
    warnings: ImportWarning[];
    /** Is preview valid for import? */
    canImport: boolean;
}

// ============================================================================
// Style Configuration Types
// ============================================================================

/**
 * Style configuration for customizing the appearance
 */
export interface DataTransferStyleConfig {
    /** Size for dialog/sheet */
    size?: "sm" | "md" | "lg" | "xl" | "full";
    /** Side for sheet mode */
    side?: "left" | "right" | "top" | "bottom";
    /** Theme variant */
    theme?: "default" | "dark" | "glass";
    /** Custom container class */
    containerClass?: string;
    /** Custom header class */
    headerClass?: string;
    /** Custom content class */
    contentClass?: string;
}

// ============================================================================
// Main Component Props Types
// ============================================================================

/**
 * Props for the UniversalDataTransferSheet component
 */
export interface UniversalDataTransferProps {
    /** Display mode - determines container type. Default: 'dialog' */
    mode?: DisplayMode;

    /** Feature identifier for registry lookup */
    featureId: string;
    /** Optional display name for the feature */
    featureName?: string;

    /** Entity types that can be exported/imported */
    entityTypes?: EntityTypeConfig[];

    /** Callback when import completes */
    onImport?: (result: ImportResult) => void;
    /** Callback when export completes */
    onExport?: (result: ExportResult) => void;
    /** Callback when dialog/sheet closes */
    onClose?: () => void;

    /** Custom title */
    title?: string;
    /** Custom subtitle */
    subtitle?: string;
    /** Show stats cards? Default: true */
    showStats?: boolean;
    /** Show history tab? Default: true */
    showHistory?: boolean;
    /** Default active tab */
    defaultTab?: "import" | "export" | "history";

    /** For dialog/sheet modes - is it open? */
    isOpen?: boolean;
    /** For dialog/sheet modes - control open state */
    onOpenChange?: (open: boolean) => void;

    /** Style customization */
    styleConfig?: DataTransferStyleConfig;

    /** Additional className */
    className?: string;
}

// ============================================================================
// Export Result Type
// ============================================================================

export interface ExportResult {
    success: boolean;
    format: ExportFormat;
    recordCount: number;
    fileName?: string;
    error?: string;
}

// ============================================================================
// Transfer Job Types (for history tracking)
// ============================================================================

export interface TransferJob {
    id: string;
    type: "import" | "export";
    entity: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    startedAt: string;
    completedAt?: string;
    recordCount: number;
    fileName: string;
    error?: string;
}

export interface TransferStats {
    totalExports: number;
    totalImports: number;
    failedJobs: number;
    activeJobs: number;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseUniversalDataTransferConfig {
    /** Feature identifier */
    featureId: string;
    /** Entity types configuration */
    entityTypes?: EntityTypeConfig[];
    /** Use Convex backend for history? */
    useConvex?: boolean;
    /** Initial open state */
    initialOpen?: boolean;
    /** Default display mode */
    defaultMode?: DisplayMode;
}

export interface UseUniversalDataTransferReturn {
    // State
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeTab: "import" | "export" | "history";
    setActiveTab: (tab: "import" | "export" | "history") => void;

    // Data
    stats: TransferStats;
    recentJobs: TransferJob[];
    isLoading: boolean;

    // Actions
    startImport: (file: File, entityType: string, format: ExportFormat) => Promise<ImportResult>;
    startExport: (entityType: string, format: ExportFormat) => Promise<ExportResult>;

    // Render helper
    renderDataTransfer: (props?: Partial<UniversalDataTransferProps>) => React.ReactNode;
}
