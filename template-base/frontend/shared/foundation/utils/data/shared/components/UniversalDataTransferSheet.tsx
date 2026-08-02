/**
 * Universal Data Transfer Sheet Component
 * 
 * A highly dynamic, reusable component for export/import functionality
 * that supports 3 display modes: dialog, sheet, and panel.
 * 
 * - Dialog mode: Modal centered overlay (default)
 * - Sheet mode: Slide-out panel from side  
 * - Panel mode: Plain content for embedding in FeatureThreeColumnLayout right panel
 */

"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
    Upload,
    Download,
    FileSpreadsheet,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Database,
    Users,
    FolderKanban,
    Package,
    AlertCircle,
    X,
    FileUp,
    RefreshCw,
    LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import type {
    UniversalDataTransferProps,
    EntityTypeConfig,
    TransferJob,
    TransferStats,
    ExportResult,
} from "../types/transfer-types";
import type { ImportResult, ExportFormat } from "../types/data-export-types";

// ============================================================================
// Default Entity Types
// ============================================================================

const DEFAULT_ENTITY_TYPES: EntityTypeConfig[] = [
    { id: "contacts", label: "Contacts", icon: Users, exportProperties: [] },
    { id: "tasks", label: "Tasks", icon: FileText, exportProperties: [] },
    { id: "projects", label: "Projects", icon: FolderKanban, exportProperties: [] },
    { id: "inventory", label: "Inventory", icon: Package, exportProperties: [] },
];

const EXPORT_FORMATS = [
    { value: "toon", label: "TOON", description: "Token-optimized (73% smaller)", savings: 73 },
    { value: "csv", label: "CSV", description: "Spreadsheet compatible", savings: 60 },
    { value: "json", label: "JSON", description: "Full schema", savings: 0 },
    { value: "markdown", label: "Markdown", description: "Table format", savings: 40 },
];

// ============================================================================
// Default Stats
// ============================================================================

const DEFAULT_STATS: TransferStats = {
    totalExports: 0,
    totalImports: 0,
    failedJobs: 0,
    activeJobs: 0,
};

// ============================================================================
// Icon Resolver Utility
// ============================================================================

function resolveIcon(icon: LucideIcon | string): LucideIcon {
    if (typeof icon === "string") {
        const iconMap: Record<string, LucideIcon> = {
            Users,
            FileText,
            FolderKanban,
            Package,
            Database,
        };
        return iconMap[icon] || FileText;
    }
    return icon;
}

// ============================================================================
// Data Transfer Content Component (The actual UI)
// ============================================================================

interface DataTransferContentProps {
    featureId: string;
    featureName?: string;
    entityTypes: EntityTypeConfig[];
    stats: TransferStats;
    recentJobs: TransferJob[];
    isLoading: boolean;
    showStats: boolean;
    showHistory: boolean;
    defaultTab: "import" | "export" | "history";
    onImport: (file: File, entityType: string, format: ExportFormat) => Promise<void>;
    onExport: (entityType: string, format: ExportFormat) => Promise<void>;
    onClose?: () => void;
    className?: string;
}

function DataTransferContent({
    featureId,
    featureName,
    entityTypes,
    stats,
    recentJobs,
    isLoading,
    showStats,
    showHistory,
    defaultTab,
    onImport,
    onExport,
    onClose,
    className,
}: DataTransferContentProps) {
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedEntityType, setSelectedEntityType] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("csv");
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }, []);

    const handleImportClick = async () => {
        if (!selectedFile || !selectedEntityType) return;
        setIsProcessing(true);
        try {
            const format = selectedFile.name.endsWith(".csv")
                ? "csv"
                : selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")
                    ? "xlsx"
                    : "json";
            await onImport(selectedFile, selectedEntityType, format as ExportFormat);
            setImportDialogOpen(false);
            setSelectedFile(null);
            setSelectedEntityType("");
        } catch (error) {
            console.error("Import failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportClick = async () => {
        if (!selectedEntityType) return;
        setIsProcessing(true);
        try {
            await onExport(selectedEntityType, selectedFormat as ExportFormat);
            setExportDialogOpen(false);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const openExportDialog = (entityType: string) => {
        setSelectedEntityType(entityType);
        setSelectedFormat("csv");
        setExportDialogOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "processing":
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    return (
        <div className={`flex flex-col h-full ${className || ""}`}>
            {/* Stats Overview */}
            {showStats && (
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 p-4 border-b">
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Exports</span>
                            <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1">{stats.totalExports}</div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Imports</span>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1">{stats.totalImports}</div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Active</span>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1">{stats.activeJobs}</div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Failed</span>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1">{stats.failedJobs}</div>
                    </Card>
                </div>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-4 mt-4 flex w-full justify-evenly">
                    <TabsTrigger value="import" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                    </TabsTrigger>
                    <TabsTrigger value="export" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </TabsTrigger>
                    {showHistory && (
                        <TabsTrigger value="history" className="gap-2">
                            <Clock className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    )}
                </TabsList>

                <ScrollArea className="flex-1">
                    <TabsContent value="import" className="p-4 space-y-4 m-0">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* CSV Import Card */}
                            <Card
                                className={`cursor-pointer transition-all hover:shadow-md ${dragActive ? "border-primary border-2" : ""}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => setImportDialogOpen(true)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-fit">
                                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                    </div>
                                    <CardTitle className="mt-3 text-base">CSV Import</CardTitle>
                                    <CardDescription>Import from CSV files</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-xs text-muted-foreground">Drag & drop or click</p>
                                </CardContent>
                            </Card>

                            {/* TOON Import Card (Recommended) */}
                            <Card
                                className="cursor-pointer hover:shadow-md transition-all border-primary/50"
                                onClick={() => setImportDialogOpen(true)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 w-fit">
                                        <Database className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <CardTitle className="mt-3 text-base">TOON Import</CardTitle>
                                    <CardDescription>Token-optimized format</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20">
                                        73% smaller
                                    </Badge>
                                </CardContent>
                            </Card>

                            {/* JSON Import Card */}
                            <Card
                                className="cursor-pointer hover:shadow-md transition-all"
                                onClick={() => setImportDialogOpen(true)}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit">
                                        <Database className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <CardTitle className="mt-3 text-base">JSON Import</CardTitle>
                                    <CardDescription>Structured data</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-xs text-muted-foreground">Full schema support</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="export" className="p-4 space-y-4 m-0">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {entityTypes.map((entity) => {
                                const IconComponent = resolveIcon(entity.icon);
                                return (
                                    <Card key={entity.id} className="hover:shadow-md transition-all">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <CardTitle className="text-base">{entity.label}</CardTitle>
                                            </div>
                                            {entity.description && (
                                                <CardDescription className="mt-2">{entity.description}</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardFooter className="gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => onExport(entity.id, "csv")}
                                            >
                                                CSV
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openExportDialog(entity.id)}>
                                                More
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {showHistory && (
                        <TabsContent value="history" className="p-4 space-y-4 m-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : recentJobs.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Clock className="h-12 w-12 text-muted-foreground" />
                                        <div className="text-center">
                                            <h3 className="font-medium">No history yet</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Your transfer history will appear here
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {recentJobs.map((job) => (
                                        <Card key={job.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`p-2 rounded-lg ${job.type === "import"
                                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                                            : "bg-green-100 dark:bg-green-900/30"
                                                            }`}
                                                    >
                                                        {job.type === "import" ? (
                                                            <Upload className="h-5 w-5 text-blue-600" />
                                                        ) : (
                                                            <Download className="h-5 w-5 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium truncate capitalize">
                                                                {job.type}: {job.entity}
                                                            </p>
                                                            {job.fileName && (
                                                                <span className="text-xs text-muted-foreground truncate">
                                                                    ({job.fileName})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                            <span>{new Date(job.startedAt).toLocaleString()}</span>
                                                            {job.recordCount > 0 && <span>{job.recordCount} records</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(job.status)}
                                                        <Badge
                                                            variant={
                                                                job.status === "completed"
                                                                    ? "default"
                                                                    : job.status === "failed"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                            }
                                                        >
                                                            {job.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {job.status === "processing" && (
                                                    <Progress value={job.progress} className="mt-3 h-1" />
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    )}
                </ScrollArea>
            </Tabs>

            {/* Import Dialog (nested) */}
            <ResponsiveDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} variant="modal" size="md">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title>Import Data</ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>Upload a file to import data</ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                                } ${selectedFile ? "bg-muted/50" : ""}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileUp className="h-8 w-8 text-primary" />
                                    <div className="text-left">
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground mb-2">Drag & drop or</p>
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        Browse Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls,.json"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Import to</Label>
                            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {entityTypes.map((entity) => {
                                        const IconComponent = resolveIcon(entity.icon);
                                        return (
                                            <SelectItem key={entity.id} value={entity.id}>
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    {entity.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ResponsiveDialog.Body>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportClick}
                        disabled={!selectedFile || !selectedEntityType || isProcessing}
                    >
                        {isProcessing ? "Importing..." : "Start Import"}
                    </Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>

            {/* Export Dialog (nested) */}
            <ResponsiveDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} variant="modal" size="md">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title>
                        Export {entityTypes.find((e) => e.id === selectedEntityType)?.label}
                    </ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>Choose your export format</ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            {EXPORT_FORMATS.map((format) => (
                                <Card
                                    key={format.value}
                                    className={`cursor-pointer transition-all ${selectedFormat === format.value ? "border-primary ring-2 ring-primary/20" : ""
                                        } ${format.value === "toon" ? "border-primary/50" : ""}`}
                                    onClick={() => setSelectedFormat(format.value)}
                                >
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 ${selectedFormat === format.value
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground"
                                                }`}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{format.label}</p>
                                                {format.savings > 0 && (
                                                    <Badge variant="outline" className={`text-xs ${format.savings >= 60 ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-blue-50 text-blue-700 dark:bg-blue-900/20"}`}>
                                                        {format.savings}% smaller
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{format.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </ResponsiveDialog.Body>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExportClick} disabled={isProcessing}>
                        <Download className="h-4 w-4 mr-2" />
                        {isProcessing ? "Exporting..." : "Export"}
                    </Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>
        </div>
    );
}

// ============================================================================
// Main Universal Data Transfer Sheet Component
// ============================================================================

export function UniversalDataTransferSheet({
    mode = "dialog",
    featureId,
    featureName,
    entityTypes = DEFAULT_ENTITY_TYPES,
    onImport,
    onExport,
    onClose,
    title = "Data Transfer",
    subtitle = "Import and export your data",
    showStats = true,
    showHistory = true,
    defaultTab = "import",
    isOpen = false,
    onOpenChange,
    styleConfig,
    className,
}: UniversalDataTransferProps) {
    // Default stats (can be enhanced with real data via hook)
    const [stats] = useState<TransferStats>(DEFAULT_STATS);
    const [recentJobs] = useState<TransferJob[]>([]);
    const [isLoading] = useState(false);

    const handleImport = async (file: File, entityType: string, format: ExportFormat) => {
        // Implementation would call onImport callback
    };

    const handleExport = async (entityType: string, format: ExportFormat) => {
        // Implementation would call onExport callback
    };

    const handleClose = () => {
        onOpenChange?.(false);
        onClose?.();
    };

    // Content is the same regardless of mode
    const content = (
        <DataTransferContent
            featureId={featureId}
            featureName={featureName}
            entityTypes={entityTypes}
            stats={stats}
            recentJobs={recentJobs}
            isLoading={isLoading}
            showStats={showStats}
            showHistory={showHistory}
            defaultTab={defaultTab}
            onImport={handleImport}
            onExport={handleExport}
            onClose={handleClose}
            className={className}
        />
    );

    // Panel mode: return content directly (no wrapper)
    if (mode === "panel") {
        return (
            <div className={`h-full flex flex-col ${styleConfig?.containerClass || ""}`}>
                <div className={`p-4 border-b ${styleConfig?.headerClass || ""}`}>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
                <div className={`flex-1 min-h-0 ${styleConfig?.contentClass || ""}`}>
                    {content}
                </div>
            </div>
        );
    }

    // Sheet mode
    if (mode === "sheet") {
        return (
            <ResponsiveDialog
                open={isOpen}
                onOpenChange={onOpenChange ?? (() => {})}
                variant="panel"
                sheetSide={(styleConfig?.side as "left" | "right" | "top" | "bottom" | undefined) || "right"}
                contentClassName={`sm:max-w-xl ${styleConfig?.containerClass || ""}`}
            >
                <ResponsiveDialog.Header className={styleConfig?.headerClass}>
                    <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>{subtitle}</ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Body className={`flex-1 mt-4 p-0 ${styleConfig?.contentClass || ""}`}>
                    {content}
                </ResponsiveDialog.Body>
            </ResponsiveDialog>
        );
    }

    // Default: Dialog mode
    return (
        <ResponsiveDialog
            open={isOpen}
            onOpenChange={onOpenChange ?? (() => {})}
            variant="modal"
            size="xl"
            contentClassName={styleConfig?.containerClass}
        >
            <ResponsiveDialog.Header className={styleConfig?.headerClass}>
                <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
                <ResponsiveDialog.Description>{subtitle}</ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body className={`flex-1 min-h-0 overflow-hidden p-0 ${styleConfig?.contentClass || ""}`}>
                {content}
            </ResponsiveDialog.Body>
        </ResponsiveDialog>
    );
}

export default UniversalDataTransferSheet;
