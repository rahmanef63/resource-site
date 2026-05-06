/**
 * Studio Preview Page — Full-screen standalone preview
 *
 * Opens as a new browser tab with the current canvas schema.
 * Schema is passed via localStorage key 'studio-preview-schema'.
 */
"use client";

import React, { useEffect, useState } from 'react';
import type { Schema } from '@/frontend/slices/studio/ui/types';
import { resolveRendererRootId } from '@/frontend/slices/studio/ui/slices/renderer/components/Renderer';
import { schemaToHtml } from '@/frontend/slices/studio/lib/schemaToHtml';
import { X, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'studio-preview-schema';

export default function StudioPreviewPage() {
    const [schema, setSchema] = useState<Schema | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadSchema = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                setError('No preview schema found. Open the Studio and click "Open Preview in New Tab".');
                return;
            }
            const parsed = JSON.parse(raw);
            setSchema(parsed);
            setError(null);
        } catch (e: any) {
            setError('Failed to parse schema: ' + e.message);
        }
    };

    useEffect(() => {
        loadSchema();

        // Listen for schema updates (when Studio saves a new version)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) loadSchema();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white p-8">
                <div className="text-4xl">🎨</div>
                <p className="text-slate-300 text-sm text-center max-w-sm">{error}</p>
                <button
                    onClick={loadSchema}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-900 transition-colors"
                >
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="animate-pulse text-sm text-slate-500">Loading preview…</div>
            </div>
        );
    }

    const previewRootId = resolveRendererRootId({
        schema,
        activeWs: { category: 'personal', key: '' },
        activeRoute: '/',
    });
    const previewHtml = schemaToHtml(schema, {
        rootIds: previewRootId ? [previewRootId] : undefined,
    });

    return (
        <div className="min-h-screen bg-slate-100 relative">
            {/* Floating toolbar */}
            <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-2.5 py-1.5">
                <span className="text-[10px] text-slate-500 font-medium">Studio Preview</span>
                <button
                    onClick={loadSchema}
                    title="Reload schema from Studio"
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <RefreshCw size={12} />
                </button>
                <button
                    onClick={() => window.close()}
                    title="Close preview"
                    className="p-1 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                >
                    <X size={12} />
                </button>
            </div>

            <iframe
                title="Studio Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="min-h-screen w-full border-0 bg-white"
            />
        </div>
    );
}
