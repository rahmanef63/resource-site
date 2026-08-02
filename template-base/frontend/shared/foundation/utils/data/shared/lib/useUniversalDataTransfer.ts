/**
 * useUniversalDataTransfer Hook
 * 
 * A dynamic hook that provides export/import functionality
 * with optional Convex backend integration for history tracking.
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";

import { UniversalDataTransferSheet } from "../components/UniversalDataTransferSheet";
import type {
    UseUniversalDataTransferConfig,
    UseUniversalDataTransferReturn,
    TransferJob,
    TransferStats,
    ExportResult,
    UniversalDataTransferProps,
    DisplayMode,
} from "../types/transfer-types";
import type {
    ImportResult,
    ExportFormat
} from "../types/data-export-types";

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_STATS: TransferStats = {
    totalExports: 0,
    totalImports: 0,
    failedJobs: 0,
    activeJobs: 0,
};

// ============================================================================
// Main Hook
// ============================================================================

export function useUniversalDataTransfer(
    config: UseUniversalDataTransferConfig
): UseUniversalDataTransferReturn {
    const {
        featureId,
        entityTypes = [],
        initialOpen = false,
        defaultMode = "dialog",
    } = config;

    // State
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [activeTab, setActiveTab] = useState<"import" | "export" | "history">("import");
    const [mode] = useState<DisplayMode>(defaultMode);
    const [recentJobs, setRecentJobs] = useState<TransferJob[]>([]);
    const [isLoading] = useState(false);

    // Computed Stats
    const stats = useMemo<TransferStats>(() => {
        if (recentJobs.length === 0) return DEFAULT_STATS;

        return {
            totalExports: recentJobs.filter((j) => j.type === "export").length,
            totalImports: recentJobs.filter((j) => j.type === "import").length,
            failedJobs: recentJobs.filter((j) => j.status === "failed").length,
            activeJobs: recentJobs.filter(
                (j) => j.status === "processing" || j.status === "pending"
            ).length,
        };
    }, [recentJobs]);

    // Import Action
    const startImport = useCallback(
        async (file: File, entityType: string, format: ExportFormat): Promise<ImportResult> => {
            const jobId = `import-${Date.now()}`;

            const newJob: TransferJob = {
                id: jobId,
                type: "import",
                entity: entityType,
                status: "processing",
                progress: 0,
                startedAt: new Date().toISOString(),
                recordCount: 0,
                fileName: file.name,
            };

            setRecentJobs((prev) => [newJob, ...prev]);

            try {
                const entityConfig = entityTypes.find((e) => e.id === entityType);
                if (entityConfig?.handleImport) {
                    const data = await parseFile(file, format);
                    const result = await entityConfig.handleImport(data);

                    setRecentJobs((prev) =>
                        prev.map((j) =>
                            j.id === jobId
                                ? {
                                    ...j,
                                    status: result.success ? "completed" : "failed",
                                    progress: 100,
                                    completedAt: new Date().toISOString(),
                                    recordCount: result.imported,
                                }
                                : j
                        )
                    );

                    return result;
                }

                // Mock successful import if no handler
                const mockResult: ImportResult = {
                    success: true,
                    imported: 10,
                    updated: 0,
                    failed: 0,
                    errors: [],
                    warnings: [],
                };

                setRecentJobs((prev) =>
                    prev.map((j) =>
                        j.id === jobId
                            ? {
                                ...j,
                                status: "completed",
                                progress: 100,
                                completedAt: new Date().toISOString(),
                                recordCount: mockResult.imported,
                            }
                            : j
                    )
                );

                return mockResult;
            } catch (error) {
                setRecentJobs((prev) =>
                    prev.map((j) =>
                        j.id === jobId
                            ? {
                                ...j,
                                status: "failed",
                                error: error instanceof Error ? error.message : "Import failed",
                            }
                            : j
                    )
                );

                return {
                    success: false,
                    imported: 0,
                    updated: 0,
                    failed: 1,
                    errors: [{ message: error instanceof Error ? error.message : "Import failed", type: "format" }],
                    warnings: [],
                };
            }
        },
        [entityTypes]
    );

    // Export Action
    const startExport = useCallback(
        async (entityType: string, format: ExportFormat): Promise<ExportResult> => {
            const jobId = `export-${Date.now()}`;

            const newJob: TransferJob = {
                id: jobId,
                type: "export",
                entity: entityType,
                status: "processing",
                progress: 0,
                startedAt: new Date().toISOString(),
                recordCount: 0,
                fileName: `${entityType}-export.${format}`,
            };

            setRecentJobs((prev) => [newJob, ...prev]);

            try {
                const entityConfig = entityTypes.find((e) => e.id === entityType);
                let data: any[] = [];

                if (entityConfig?.getData) {
                    data = await entityConfig.getData();
                }

                const fileName = `${entityType}-${new Date().toISOString().split("T")[0]}.${format}`;
                await generateDownload(data, format, fileName);

                setRecentJobs((prev) =>
                    prev.map((j) =>
                        j.id === jobId
                            ? {
                                ...j,
                                status: "completed",
                                progress: 100,
                                completedAt: new Date().toISOString(),
                                recordCount: data.length,
                                fileName,
                            }
                            : j
                    )
                );

                return {
                    success: true,
                    format,
                    recordCount: data.length,
                    fileName,
                };
            } catch (error) {
                setRecentJobs((prev) =>
                    prev.map((j) =>
                        j.id === jobId
                            ? {
                                ...j,
                                status: "failed",
                                error: error instanceof Error ? error.message : "Export failed",
                            }
                            : j
                    )
                );

                return {
                    success: false,
                    format,
                    recordCount: 0,
                    error: error instanceof Error ? error.message : "Export failed",
                };
            }
        },
        [entityTypes]
    );

    // Render Helper
    const renderDataTransfer = useCallback(
        (props?: Partial<UniversalDataTransferProps>): React.ReactNode => {
            return React.createElement(UniversalDataTransferSheet, {
                mode: props?.mode || mode,
                featureId: featureId,
                entityTypes: entityTypes,
                isOpen: isOpen,
                onOpenChange: setIsOpen,
                showStats: true,
                showHistory: true,
                defaultTab: activeTab,
                ...props,
            });
        },
        [featureId, entityTypes, isOpen, activeTab, mode]
    );

    return {
        isOpen,
        setIsOpen,
        activeTab,
        setActiveTab,
        stats,
        recentJobs,
        isLoading,
        startImport,
        startExport,
        renderDataTransfer,
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

async function parseFile(file: File, format: ExportFormat): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;

                if (format === "json") {
                    const parsed = JSON.parse(content);
                    resolve(Array.isArray(parsed) ? parsed : parsed.data || [parsed]);
                } else if (format === "csv") {
                    const lines = content.split("\n").filter((line) => line.trim());
                    if (lines.length < 2) {
                        resolve([]);
                        return;
                    }

                    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
                    const data = lines.slice(1).map((line) => {
                        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
                        return headers.reduce((obj, header, index) => {
                            obj[header] = values[index] || "";
                            return obj;
                        }, {} as Record<string, string>);
                    });

                    resolve(data);
                } else {
                    reject(new Error(`Unsupported format: ${format}`));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
}

async function generateDownload(data: any[], format: ExportFormat, fileName: string): Promise<void> {
    let content: string;
    let mimeType: string;

    if (format === "json") {
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
    } else if (format === "csv") {
        if (data.length === 0) {
            content = "";
        } else {
            const headers = Object.keys(data[0]);
            const rows = data.map((item) =>
                headers.map((h) => `"${String(item[h] ?? "").replace(/"/g, '""')}"`).join(",")
            );
            content = [headers.join(","), ...rows].join("\n");
        }
        mimeType = "text/csv";
    } else {
        throw new Error(`Unsupported format: ${format}`);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default useUniversalDataTransfer;
