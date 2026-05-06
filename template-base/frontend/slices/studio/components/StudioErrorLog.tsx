/**
 * Studio Error Log Panel
 *
 * Displays widget render errors collected by WidgetErrorBoundary.
 * Shows in the right panel as an "Errors" tab with copy-paste support.
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { studioErrorLog, type StudioError } from '@/frontend/slices/studio/ui/lib/studioErrorLog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui';
import { Copy, Check, Trash2, AlertTriangle, Bug, ChevronDown, ChevronRight } from 'lucide-react';

function useErrorLog() {
    const [errors, setErrors] = useState<Readonly<StudioError[]>>(studioErrorLog.getErrors());
    useEffect(() => {
        return studioErrorLog.subscribe(() => {
            setErrors([...studioErrorLog.getErrors()]);
        });
    }, []);
    return errors;
}

function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ErrorRow: React.FC<{ error: StudioError }> = ({ error }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyError = useCallback(() => {
        const text = [
            `[Studio Error] ${formatTime(error.timestamp)}`,
            `Node: ${error.nodeId}`,
            `Message: ${error.message}`,
            error.stack ? `\nStack:\n${error.stack}` : '',
        ].join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [error]);

    return (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg overflow-hidden">
            {/* Header row */}
            <div
                className="flex items-start gap-2 p-2.5 cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <AlertTriangle size={11} className="text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <code className="text-[10px] text-primary font-mono bg-primary/10 px-1 rounded">{error.nodeId}</code>
                        <span className="text-[9px] text-muted-foreground ml-auto">{formatTime(error.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-destructive mt-0.5 leading-tight line-clamp-2">
                        {error.message}
                    </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); copyError(); }}
                        className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Copy error"
                    >
                        {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                    </button>
                    {expanded ? <ChevronDown size={10} className="text-muted-foreground" /> : <ChevronRight size={10} className="text-muted-foreground" />}
                </div>
            </div>

            {/* Stack trace */}
            {expanded && error.stack && (
                <div className="border-t border-destructive/15 bg-background/40 p-2">
                    <pre className="text-[9px] text-muted-foreground font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32">
                        {error.stack}
                    </pre>
                </div>
            )}
        </div>
    );
};

export const StudioErrorLog: React.FC = () => {
    const errors = useErrorLog();
    const [copied, setCopied] = useState(false);

    const copyAll = useCallback(() => {
        if (errors.length === 0) return;
        const text = errors.map((e) => [
            `--- ${formatTime(e.timestamp)} | Node: ${e.nodeId} ---`,
            `Message: ${e.message}`,
            e.stack ? `Stack:\n${e.stack}` : '',
        ].join('\n')).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [errors]);

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
                <div className="flex items-center gap-1.5">
                    <Bug size={12} className="text-destructive" />
                    <span className="text-xs font-medium">Error Log</span>
                    {errors.length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">
                            {errors.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {errors.length > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] gap-1"
                                onClick={copyAll}
                                title="Copy all errors"
                            >
                                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                {copied ? 'Copied!' : 'Copy All'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => studioErrorLog.clear()}
                                title="Clear all errors"
                            >
                                <Trash2 size={10} />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Error list */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {errors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Check size={16} className="text-green-500" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">No errors — canvas is clean</p>
                        </div>
                    ) : (
                        errors.map((error) => (
                            <ErrorRow key={error.id} error={error} />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Quick tips */}
            {errors.length > 0 && (
                <div className="px-3 py-2 border-t shrink-0 bg-muted/30">
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                        Tip: Click an error to expand the stack trace. Use "Copy All" to paste into AI chat for debugging.
                    </p>
                </div>
            )}
        </div>
    );
};
