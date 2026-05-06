'use client';

/**
 * Execution Controls Component
 * 
 * Top bar controls for flow validation and execution.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    Pause,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileJson2,
    Upload,
    RotateCcw,
} from 'lucide-react';
import type { ExecutionStatus, ValidationResult } from './types';
import { cn } from '@/frontend/shared/foundation';

// ============================================================================
// Types
// ============================================================================

export interface ExecutionControlsProps {
    status: ExecutionStatus;
    validationResult?: ValidationResult;
    onValidate?: () => void;
    onRun?: () => void;
    onStop?: () => void;
    onExport?: () => void;
    onImport?: () => void;
    onClear?: () => void;
    disabled?: boolean;
    className?: string;
}

// ============================================================================
// Status Badge
// ============================================================================

const statusConfig: Record<ExecutionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    idle: { label: 'Draft', variant: 'secondary', icon: <span className="w-2 h-2 rounded-full bg-yellow-500" /> },
    validating: { label: 'Validating...', variant: 'secondary', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    running: { label: 'Running', variant: 'default', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    success: { label: 'Success', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { label: 'Failed', variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', variant: 'outline', icon: <Pause className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: ExecutionStatus }) {
    const config = statusConfig[status];

    return (
        <Badge
            variant={config.variant}
            className={cn(
                "gap-1.5 px-2.5",
                status === 'success' && "bg-green-500/15 text-green-700 border-green-500/30",
                status === 'running' && "bg-blue-500/15 text-blue-700 border-blue-500/30",
            )}
        >
            {config.icon}
            <span>{config.label}</span>
        </Badge>
    );
}

// ============================================================================
// Execution Controls
// ============================================================================

export function ExecutionControls({
    status,
    validationResult,
    onValidate,
    onRun,
    onStop,
    onExport,
    onImport,
    onClear,
    disabled = false,
    className,
}: ExecutionControlsProps) {
    const isRunning = status === 'running' || status === 'validating';
    const canRun = status !== 'running' && status !== 'validating';
    const isValid = validationResult?.valid ?? false;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Status Badge */}
            <StatusBadge status={status} />

            {/* Validation Errors Count */}
            {validationResult && !validationResult.valid && (
                <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationResult.errors.length} error(s)
                </Badge>
            )}

            <div className="w-px h-6 bg-border mx-1" />

            {/* Export/Import */}
            <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={disabled || isRunning}
                className="gap-1.5"
            >
                <FileJson2 className="w-4 h-4" />
                Export
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onImport}
                disabled={disabled || isRunning}
                className="gap-1.5"
            >
                <Upload className="w-4 h-4" />
                Import
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={disabled || isRunning}
                className="gap-1.5 text-destructive hover:text-destructive"
            >
                <RotateCcw className="w-4 h-4" />
                Clear
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Validate Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onValidate}
                disabled={disabled || isRunning}
                className="gap-1.5"
            >
                <CheckCircle2 className="w-4 h-4" />
                Validate
            </Button>

            {/* Run/Stop Button */}
            {isRunning ? (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onStop}
                    disabled={disabled}
                    className="gap-1.5"
                >
                    <Pause className="w-4 h-4" />
                    Stop
                </Button>
            ) : (
                <Button
                    variant="default"
                    size="sm"
                    onClick={onRun}
                    disabled={disabled || !canRun}
                    className="gap-1.5 bg-green-600 hover:bg-green-700"
                >
                    <Play className="w-4 h-4" />
                    Run
                </Button>
            )}
        </div>
    );
}
