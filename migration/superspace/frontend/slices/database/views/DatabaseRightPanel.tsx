"use client";

import { useState, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
    Info,
    Sparkles,
    X,
    Bot,
    Calendar,
    User,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeatureAIAssistant } from "@/frontend/shared/ui/ai-assistant/FeatureAIAssistant";
import { cn } from "@/lib/utils";
import type { DatabaseFeature, DatabaseField } from "../types";

export interface DatabaseRightPanelProps {
    selectedRow: DatabaseFeature | null;
    fields: DatabaseField[];
    isMounted: boolean;
    onClose: () => void;
    mode: "inspector" | "ai";
    onModeChange: (mode: "inspector" | "ai") => void;
    onUpdateRow?: (rowId: Id<"dbRows">, updates: Record<string, unknown>) => Promise<void>;
}

export function DatabaseRightPanel({
    selectedRow,
    fields,
    isMounted,
    onClose,
    mode,
    onModeChange,
    onUpdateRow,
}: DatabaseRightPanelProps) {
    if (!isMounted) {
        return (
            <div className="h-full flex items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        );
    }

    return (
        <PanelSection label="Database details">
            <PanelSection.Header className="flex items-center justify-between px-3 py-2">
                <Tabs value={mode} onValueChange={(v) => onModeChange(v as "inspector" | "ai")}>
                    <TabsList className="flex w-full justify-evenly h-8">
                        <TabsTrigger value="inspector" className="text-xs h-7 gap-1.5">
                            <Info className="h-3.5 w-3.5" />
                            Inspector
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="text-xs h-7 gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button aria-label="Close" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </PanelSection.Header>

            <PanelSection.Items>
                {mode === "inspector" ? (
                    <InspectorContent
                        selectedRow={selectedRow}
                        fields={fields}
                        onUpdateRow={onUpdateRow}
                    />
                ) : (
                    <AIContent selectedRow={selectedRow} />
                )}
            </PanelSection.Items>
        </PanelSection>
    );
}

// ============================================================================
// Inspector Content
// ============================================================================

interface InspectorContentProps {
    selectedRow: DatabaseFeature | null;
    fields: DatabaseField[];
    onUpdateRow?: (rowId: Id<"dbRows">, updates: Record<string, unknown>) => Promise<void>;
}

function InspectorContent({ selectedRow, fields, onUpdateRow }: InspectorContentProps) {
    if (!selectedRow) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground text-sm">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a row to view details</p>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
                {/* Row title/name */}
                <div>
                    <h3 className="font-semibold text-lg truncate">{selectedRow.name || "Untitled"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        ID: {String(selectedRow.id).slice(0, 12)}...
                    </p>
                </div>

                {/* Properties */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Properties
                    </h4>

                    {fields.map((field) => {
                        const value = selectedRow.metadata?.[String(field._id)];
                        return (
                            <PropertyDisplay
                                key={field._id}
                                field={field}
                                value={value}
                            />
                        );
                    })}
                </div>

                {/* Metadata */}
                {selectedRow.startAt && (
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Timeline
                        </h4>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {new Date(selectedRow.startAt).toLocaleDateString()}
                                {selectedRow.endAt && (
                                    <> → {new Date(selectedRow.endAt).toLocaleDateString()}</>
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}

// ============================================================================
// Property Display
// ============================================================================

interface PropertyDisplayProps {
    field: DatabaseField;
    value: unknown;
}

function PropertyDisplay({ field, value }: PropertyDisplayProps) {
    const displayValue = useMemo(() => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">Empty</span>;
        }

        switch (field.type) {
            case "checkbox":
                return (
                    <Badge variant={value ? "default" : "secondary"}>
                        {value ? "Yes" : "No"}
                    </Badge>
                );
            case "date":
                return typeof value === "number"
                    ? new Date(value).toLocaleDateString()
                    : String(value);
            case "select":
            case "multiSelect":
                if (Array.isArray(value)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {value.map((v, i) => (
                                <Badge key={i} variant="secondary">{String(v)}</Badge>
                            ))}
                        </div>
                    );
                }
                return <Badge variant="secondary">{String(value)}</Badge>;
            case "url":
                return (
                    <a
                        href={String(value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                    >
                        {String(value)}
                    </a>
                );
            case "email":
                return (
                    <a
                        href={`mailto:${String(value)}`}
                        className="text-primary hover:underline"
                    >
                        {String(value)}
                    </a>
                );
            default:
                return <span className="break-words">{String(value)}</span>;
        }
    }, [field.type, value]);

    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{field.name}</Label>
            <div className="text-sm">{displayValue}</div>
        </div>
    );
}

// ============================================================================
// AI Content
// ============================================================================

interface AIContentProps {
    selectedRow: DatabaseFeature | null;
}

function AIContent({ selectedRow }: AIContentProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-4">
                <FeatureAIAssistant
                    featureId="database"
                    context={selectedRow ?? undefined}
                    title="Database Assistant"
                />
            </div>
        </div>
    );
}
