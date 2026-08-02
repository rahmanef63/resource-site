/**
 * Studio Converter Dialog
 *
 * Converts between Studio JSON ↔ HTML ↔ TSX formats.
 * Accessible from the Studio header toolbar.
 */
"use client";

import React, { useState, useCallback } from "react";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Check, ArrowRightLeft, FileCode2, Code2, Braces } from "lucide-react";
import type { Schema, ConversionStats } from "@/frontend/slices/studio/ui/lib/converters";
import { jsonToHtml, jsonToTsx, htmlToJson, tsxToJson, computeConversionStats } from "@/frontend/slices/studio/ui/lib/converters";
import { errorMessage } from "@/lib/utils";

type ConvertMode = 'json-to-html' | 'json-to-tsx' | 'html-to-json' | 'tsx-to-json';

interface StudioConverterDialogProps {
    open: boolean;
    onClose: () => void;
    /** Current schema from canvas (for JSON → HTML / TSX export) */
    schema?: Schema | null;
    /** Called when user imports JSON parsed from HTML/TSX */
    onImportSchema?: (schema: Schema) => void;
}

const MODES: { id: ConvertMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'json-to-html', label: 'JSON → HTML',  icon: <FileCode2 size={14} />, desc: 'Export current canvas as static HTML' },
    { id: 'json-to-tsx',  label: 'JSON → TSX',   icon: <Code2 size={14} />,     desc: 'Export current canvas as React TSX component' },
    { id: 'html-to-json', label: 'HTML → JSON',  icon: <Braces size={14} />,    desc: 'Import HTML and parse into Studio JSON nodes' },
    { id: 'tsx-to-json',  label: 'TSX → JSON',   icon: <Braces size={14} />,    desc: 'Import React JSX/TSX and parse into Studio JSON nodes' },
];

export const StudioConverterDialog: React.FC<StudioConverterDialogProps> = ({
    open,
    onClose,
    schema,
    onImportSchema,
}) => {
    const [mode, setMode] = useState<ConvertMode>('json-to-html');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<ConversionStats | null>(null);
    const [componentName, setComponentName] = useState('StudioPage');

    const isExport = mode === 'json-to-html' || mode === 'json-to-tsx';
    const isImport = mode === 'html-to-json' || mode === 'tsx-to-json';

    const runConvert = useCallback(() => {
        setError('');
        setStats(null);
        try {
            if (mode === 'json-to-html') {
                const src = schema ?? JSON.parse(input || '{}');
                setOutput(jsonToHtml(src));
            } else if (mode === 'json-to-tsx') {
                const src = schema ?? JSON.parse(input || '{}');
                setOutput(jsonToTsx(src, componentName || 'StudioPage'));
            } else if (mode === 'html-to-json') {
                const result = htmlToJson(input);
                setOutput(JSON.stringify(result, null, 2));
                setStats(computeConversionStats(result));
            } else if (mode === 'tsx-to-json') {
                const result = tsxToJson(input);
                setOutput(JSON.stringify(result, null, 2));
                setStats(computeConversionStats(result));
            }
        } catch (e) {
            setError(errorMessage(e, 'Conversion failed'));
        }
    }, [mode, schema, input, componentName]);

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const handleDownload = () => {
        if (!output) return;
        const ext = mode === 'json-to-html' ? 'html' : mode === 'json-to-tsx' ? 'tsx' : 'json';
        const mime = ext === 'html' ? 'text/html' : ext === 'tsx' ? 'text/plain' : 'application/json';
        const blob = new Blob([output], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studio-export.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleApplyToCanvas = () => {
        if (!output || !onImportSchema) return;
        try {
            const parsed = JSON.parse(output);
            onImportSchema(parsed);
            onClose();
        } catch (e) {
            setError('Invalid JSON: ' + errorMessage(e, 'parse error'));
        }
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={(v) => !v && onClose()} variant="modal" size="xl">
            <ResponsiveDialog.Header>
                <div className="flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-primary" />
                    <ResponsiveDialog.Title>Studio Converter</ResponsiveDialog.Title>
                </div>
                <ResponsiveDialog.Description className="text-xs mt-1">
                    Convert between Studio JSON, static HTML, and React TSX.
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="flex flex-col overflow-hidden">
                {/* Mode tabs */}
                <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 border-b bg-muted/30 overflow-x-auto">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setMode(m.id); setOutput(''); setError(''); setStats(null); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                                mode === m.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                            {m.icon}
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-3 p-4 overflow-y-auto">
                    {/* Description */}
                    <p className="text-xs text-muted-foreground">
                        {MODES.find((m) => m.id === mode)?.desc}
                    </p>

                    {/* TSX component name */}
                    {mode === 'json-to-tsx' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground whitespace-nowrap">Component name:</label>
                            <input
                                value={componentName}
                                onChange={(e) => setComponentName(e.target.value)}
                                className="h-7 px-2 text-xs rounded border border-border bg-background w-48 font-mono"
                                placeholder="StudioPage"
                            />
                        </div>
                    )}

                    {/* Input area (for import modes, or JSON override for export) */}
                    {(isImport || (!schema && isExport)) && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground/80">
                                {isImport
                                    ? (mode === 'html-to-json' ? 'Paste HTML' : 'Paste TSX / JSX')
                                    : 'Paste Studio JSON (or load from canvas)'}
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    mode === 'html-to-json'
                                        ? '<div class="flex gap-4">...</div>'
                                        : mode === 'tsx-to-json'
                                        ? 'export default function Page() { return (<div>...</div>); }'
                                        : '{ "version": "0.4", "root": ["page"], "nodes": {} }'
                                }
                                className="h-40 p-3 font-mono text-xs rounded border border-border bg-muted/30 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    )}

                    {isExport && schema && (
                        <p className="text-xs text-green-500">
                            ✓ Using current canvas schema ({Object.keys(schema.nodes).length} nodes)
                        </p>
                    )}

                    {/* Convert button */}
                    <Button size="sm" onClick={runConvert} className="self-start gap-2">
                        <ArrowRightLeft size={13} />
                        Convert
                    </Button>

                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
                            ⚠ {error}
                        </p>
                    )}

                    {/* BUG 8 FIX: Conversion stats for import modes */}
                    {stats && isImport && output && (
                        <div className="flex items-center gap-3 text-xs px-3 py-2 rounded border bg-muted/40">
                            <span className="text-green-500 font-medium">✓ {stats.nodeCount} nodes parsed</span>
                            {stats.textNodesExtracted > 0 && (
                                <span className="text-muted-foreground">{stats.textNodesExtracted} text nodes extracted</span>
                            )}
                            {stats.emptyNodes > 0 && (
                                <span className="text-amber-500">⚠ {stats.emptyNodes} empty nodes</span>
                            )}
                        </div>
                    )}

                    {/* Output */}
                    {output && (
                        <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                            <label className="text-xs font-medium text-foreground/80">Output</label>
                            <ScrollArea className="flex-1 min-h-[160px] border border-border rounded bg-muted/20">
                                <pre className="p-3 text-xs font-mono text-foreground/90 whitespace-pre-wrap break-all">
                                    {output}
                                </pre>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    {isImport && output && onImportSchema && (
                        <Button size="sm" onClick={handleApplyToCanvas} className="gap-1.5">
                            Apply to Canvas
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                    {output && (
                        <>
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
                                <Download size={13} />
                                Download
                            </Button>
                            <Button size="sm" className="gap-1.5" onClick={handleCopy}>
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </>
                    )}
                </div>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    );
};
