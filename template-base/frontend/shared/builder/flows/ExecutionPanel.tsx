'use client';

/**
 * Execution Panel Component
 * 
 * Logs panel showing execution progress, step details, and run statistics.
 */

import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    Info,
    AlertTriangle,
    AlertCircle,
    Bug,
    Trash2,
    Download,
} from 'lucide-react';
import type { ExecutionResult, ExecutionLog, ExecutionStep } from './types';
import { cn } from '@/frontend/shared/foundation';

// ============================================================================
// Types
// ============================================================================

export interface ExecutionPanelProps {
    result?: ExecutionResult | null;
    logs: ExecutionLog[];
    steps: ExecutionStep[];
    onClearLogs?: () => void;
    onExportLogs?: () => void;
    className?: string;
}

// ============================================================================
// Log Entry
// ============================================================================

const logIcons: Record<string, React.ReactNode> = {
    info: <Info className="w-3 h-3 text-blue-500" />,
    warn: <AlertTriangle className="w-3 h-3 text-yellow-500" />,
    error: <AlertCircle className="w-3 h-3 text-red-500" />,
    debug: <Bug className="w-3 h-3 text-gray-500" />,
};

function LogEntry({ log }: { log: ExecutionLog }) {
    const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className={cn(
            "flex items-start gap-2 py-1 px-2 font-mono text-xs",
            log.level === 'error' && "bg-red-500/5",
            log.level === 'warn' && "bg-yellow-500/5",
        )}>
            {logIcons[log.level] || logIcons.info}
            <span className="text-muted-foreground w-16 shrink-0">{time}</span>
            {log.nodeLabel && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                    {log.nodeLabel}
                </Badge>
            )}
            <span className={cn(
                "flex-1",
                log.level === 'error' && "text-red-600",
                log.level === 'warn' && "text-yellow-600",
            )}>
                {log.message}
            </span>
        </div>
    );
}

// ============================================================================
// Run Statistics
// ============================================================================

function RunStats({ result }: { result: ExecutionResult | null | undefined }) {
    if (!result) {
        return (
            <div className="grid grid-cols-2 gap-2 text-sm">
                <StatCard label="Status" value="—" />
                <StatCard label="Steps" value="—" />
                <StatCard label="Started" value="—" />
                <StatCard label="Duration" value="—" />
            </div>
        );
    }

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const completedSteps = result.steps.filter(s => s.status === 'completed').length;
    const failedSteps = result.steps.filter(s => s.status === 'failed').length;

    return (
        <div className="grid grid-cols-2 gap-2 text-sm">
            <StatCard
                label="Status"
                value={result.status}
                variant={result.status === 'success' ? 'success' : result.status === 'failed' ? 'error' : 'default'}
            />
            <StatCard
                label="Steps"
                value={`${completedSteps}/${result.steps.length}${failedSteps > 0 ? ` (${failedSteps} failed)` : ''}`}
            />
            <StatCard label="Started" value={formatTime(result.startedAt)} />
            <StatCard label="Duration" value={result.duration ? formatDuration(result.duration) : '—'} />
        </div>
    );
}

function StatCard({
    label,
    value,
    variant = 'default'
}: {
    label: string;
    value: string;
    variant?: 'default' | 'success' | 'error'
}) {
    return (
        <div className="border rounded-lg p-2 bg-muted/30">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={cn(
                "font-semibold text-xs mt-0.5",
                variant === 'success' && "text-green-600",
                variant === 'error' && "text-red-600",
            )}>
                {value}
            </div>
        </div>
    );
}

// ============================================================================
// Step List
// ============================================================================

function StepList({ steps }: { steps: ExecutionStep[] }) {
    if (steps.length === 0) {
        return (
            <div className="text-sm text-muted-foreground italic py-4 text-center">
                No steps executed yet
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {steps.map((step, i) => (
                <div
                    key={`${step.nodeId}-${i}`}
                    className={cn(
                        "flex items-center gap-2 py-1.5 px-2 rounded text-xs",
                        step.status === 'running' && "bg-blue-500/10",
                        step.status === 'completed' && "bg-green-500/5",
                        step.status === 'failed' && "bg-red-500/10",
                    )}
                >
                    {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                    {step.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    {step.status === 'running' && <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />}
                    {step.status === 'pending' && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    {step.status === 'skipped' && <Clock className="w-3.5 h-3.5 text-muted-foreground opacity-50" />}

                    <span className="font-medium flex-1">{step.nodeLabel}</span>

                    {step.duration !== undefined && (
                        <span className="text-muted-foreground">{step.duration}ms</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Execution Panel
// ============================================================================

export function ExecutionPanel({
    result,
    logs,
    steps,
    onClearLogs,
    onExportLogs,
    className,
}: ExecutionPanelProps) {
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs.length]);

    const handleExport = () => {
        const exportData = {
            result,
            logs,
            steps,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `execution-log-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        onExportLogs?.();
    };

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Runs & Logs
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">
                        {logs.length} logs
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleExport}
                        title="Export Logs"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onClearLogs}
                        title="Clear Logs"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex overflow-hidden">
                {/* Logs Section */}
                <div className="flex-1 flex flex-col border-r min-w-0">
                    <ScrollArea className="flex-1">
                        <div className="p-1">
                            {logs.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic py-4 text-center">
                                    Run a workflow to see logs
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <LogEntry key={`${log.timestamp}-${i}`} log={log} />
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </ScrollArea>
                </div>

                {/* Stats & Steps Section */}
                <div className="w-64 shrink-0 flex flex-col p-3 gap-3 overflow-auto">
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Run Summary
                        </h4>
                        <RunStats result={result} />
                    </div>

                    <div className="flex-1 min-h-0">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Steps ({steps.length})
                        </h4>
                        <StepList steps={steps} />
                    </div>

                    {result?.error && (
                        <div className="border border-red-200 bg-red-50 rounded-lg p-2">
                            <div className="text-xs font-medium text-red-800 mb-1">Error</div>
                            <div className="text-xs text-red-600">{result.error}</div>
                        </div>
                    )}

                    {result?.output && (
                        <div className="border rounded-lg p-2 bg-muted/30">
                            <div className="text-xs font-medium mb-1">Output</div>
                            <pre className="text-[10px] font-mono overflow-auto max-h-24">
                                {JSON.stringify(result.output, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
