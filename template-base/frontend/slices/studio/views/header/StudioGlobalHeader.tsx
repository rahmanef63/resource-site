/**
 * Studio Global Header
 *
 * Thin wrapper composing Left / Center / Right sub-components
 * inside FeatureHeader. Owns dialog state (AI generate + clear confirm).
 *
 * Mobile: compact toolbar with essential actions and overflow menu.
 */
import React, { useState } from 'react';
import { Layers3, ArrowLeft, Undo2, Redo2, Download, Upload, BookMarked, ArrowRightLeft, ExternalLink, Eraser, Sparkles, Ungroup, Group, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FeatureHeader } from '@/frontend/shared/ui/layout/header';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { StudioMode } from '@/frontend/slices/studio/registry';
import { StudioAIGenerateDialog } from '@/frontend/slices/studio/components/StudioAIGenerateDialog';
import { StudioAIModelPicker } from '@/frontend/slices/studio/components/StudioAIModelPicker';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import { StudioHeaderLeft } from './StudioHeaderLeft';
import { StudioHeaderCenter } from './StudioHeaderCenter';
import { StudioHeaderRight } from './StudioHeaderRight';
import type { ActiveView } from '@/frontend/slices/studio/views/StudioEditorTabs';

export interface StudioGlobalHeaderProps {
    mode: StudioMode;
    setMode: (mode: StudioMode) => void;
    undo: () => void;
    canUndo: boolean;
    redo: () => void;
    canRedo: boolean;
    handleExport: (format?: 'studio' | 'n8n') => void;
    handleImport: () => void;
    handleClear: () => void;
    onOpenDocs: () => void;
    onOpenConverter: () => void;
    onOpenPreview: () => void;
    handleExportHtml?: () => void;
    handleExportJpg?: () => void;
    previewMode: 'design' | 'interactive';
    setPreviewMode: (m: 'design' | 'interactive') => void;
    onGroup: () => void;
    focusedGroupId: string | null;
    onExitGroup: () => void;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    setViewport?: (v: 'desktop' | 'tablet' | 'mobile') => void;
    onToggleBottom?: () => void;
    activeView?: ActiveView;
    isMobile?: boolean;
    mobileOnBack?: () => void;
    mobileOnOpenInspector?: () => void;
}

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children as any}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
);

export const StudioGlobalHeader: React.FC<StudioGlobalHeaderProps> = (props) => {
    const {
        mode, setMode,
        undo, canUndo, redo, canRedo,
        handleExport, handleImport, handleClear,
        onOpenDocs, onOpenConverter, onOpenPreview,
        handleExportHtml, handleExportJpg,
        previewMode, setPreviewMode,
        onGroup, focusedGroupId, onExitGroup,
        viewport, setViewport, onToggleBottom, activeView,
        isMobile, mobileOnBack, mobileOnOpenInspector,
    } = props;

    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    // ========================================================================
    // Shared dialogs (desktop + mobile)
    // ========================================================================
    const dialogs = (
        <>
            <StudioAIGenerateDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} onUndo={undo} />
            <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Clear all canvas content? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { handleClear(); setClearConfirmOpen(false); }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Clear
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    // ========================================================================
    // Mobile: compact toolbar with essential actions + overflow menu
    // ========================================================================
    if (isMobile) {
        return (
            <>
                <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-background shrink-0">
                    {mobileOnBack && (
                        <Button variant="ghost" size="sm" onClick={mobileOnBack} className="h-8 w-8 p-0 shrink-0">
                            <ArrowLeft size={16} />
                        </Button>
                    )}

                    {/* Compact mode toggle */}
                    <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                        <Button
                            variant="ghost" size="sm" onClick={() => setMode('ui')}
                            className={cn('h-6 px-1.5 text-[10px] gap-0.5 transition-colors', mode === 'ui' && 'bg-emerald-500 text-white hover:bg-emerald-600')}
                        >
                            <Layers3 size={10} /> UI
                        </Button>
                        <Button
                            variant="ghost" size="sm" onClick={() => setMode('workflow')}
                            className={cn('h-6 px-1.5 text-[10px] gap-0.5 transition-colors', mode === 'workflow' && 'bg-violet-500 text-white hover:bg-violet-600')}
                        >
                            Flow
                        </Button>
                        <Button
                            variant="ghost" size="sm" onClick={() => setMode('unified')}
                            className={cn('h-6 px-1.5 text-[10px] gap-0.5 transition-colors', mode === 'unified' && 'bg-blue-500 text-white hover:bg-blue-600')}
                        >
                            All
                        </Button>
                    </div>

                    <div className="flex-1" />

                    <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-8 w-8 p-0 shrink-0">
                        <Undo2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-8 w-8 p-0 shrink-0">
                        <Redo2 size={14} />
                    </Button>

                    {mobileOnOpenInspector && (
                        <Button variant="ghost" size="sm" onClick={mobileOnOpenInspector} className="h-8 w-8 p-0 shrink-0">
                            <SlidersHorizontal size={14} />
                        </Button>
                    )}

                    <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                                <MoreHorizontal size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-1" sideOffset={4}>
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => { setAiDialogOpen(true); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                                >
                                    <Sparkles size={14} /> AI Generate
                                </button>

                                <div className="h-px bg-border my-1" />

                                <button onClick={() => { handleExport('studio'); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <Download size={14} /> Export Studio JSON
                                </button>
                                <button onClick={() => { handleExport('n8n'); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <Download size={14} /> Export n8n JSON
                                </button>
                                {handleExportHtml && (
                                    <button onClick={() => { handleExportHtml(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                        <Download size={14} /> Export as HTML
                                    </button>
                                )}
                                {handleExportJpg && (
                                    <button onClick={() => { handleExportJpg(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                        <Download size={14} /> Export as JPG
                                    </button>
                                )}
                                <button onClick={() => { handleImport(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <Upload size={14} /> Import JSON
                                </button>

                                <div className="h-px bg-border my-1" />

                                <button onClick={() => { onOpenDocs(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <BookMarked size={14} /> Schema Docs
                                </button>
                                <button onClick={() => { onOpenConverter(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <ArrowRightLeft size={14} /> JSON Converter
                                </button>
                                <button onClick={() => { onOpenPreview(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <ExternalLink size={14} /> Open Preview Tab
                                </button>

                                <div className="h-px bg-border my-1" />

                                <button onClick={() => { onGroup(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                                    <Group size={14} /> Group Selected
                                </button>
                                {focusedGroupId && (
                                    <button onClick={() => { onExitGroup(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-emerald-600">
                                        <Ungroup size={14} /> Exit Group
                                    </button>
                                )}

                                <div className="h-px bg-border my-1" />

                                <button onClick={() => { setClearConfirmOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-destructive">
                                    <Eraser size={14} /> Clear Canvas
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {dialogs}
            </>
        );
    }

    // ========================================================================
    // Desktop: FeatureHeader composing Left / Center / Right
    // All editor controls merged into single toolbar row.
    // ========================================================================
    const toolbar = (
        <div className="flex items-center gap-1.5 w-full overflow-hidden">
            {/* LEFT: editor type + mode + view controls */}
            <StudioHeaderLeft
                mode={mode}
                setMode={setMode}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                focusedGroupId={focusedGroupId}
                onExitGroup={onExitGroup}
            />
            <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
            <StudioHeaderCenter
                mode={mode}
                viewport={viewport}
                setViewport={setViewport}
                onToggleBottom={onToggleBottom}
                activeView={activeView}
                onGroup={onGroup}
            />

            {/* SPACER */}
            <div className="flex-1" />

            {/* RIGHT: AI + model picker + save status + document actions */}
            <TooltipProvider delayDuration={400}>
                <Tip label="Generate UI with AI (from scratch)">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiDialogOpen(true)}
                        className="h-7 px-2 gap-1 text-xs text-primary hover:text-primary shrink-0"
                    >
                        <Sparkles size={12} />
                        AI
                    </Button>
                </Tip>
            </TooltipProvider>
            <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
            <StudioAIModelPicker compact className="border-dashed" />
            <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
            <span className="text-[10px] text-muted-foreground/60 select-none tracking-wide shrink-0">Auto-saved</span>
            <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
            <StudioHeaderRight
                undo={undo}
                canUndo={canUndo}
                redo={redo}
                canRedo={canRedo}
                handleExport={handleExport}
                handleImport={handleImport}
                onOpenDocs={onOpenDocs}
                onOpenConverter={onOpenConverter}
                onOpenPreview={onOpenPreview}
                handleExportHtml={handleExportHtml}
                handleExportJpg={handleExportJpg}
                onClearRequest={() => setClearConfirmOpen(true)}
            />
        </div>
    );

    return (
        <>
            <FeatureHeader
                title="Studio"
                icon={Layers3}
                toolbar={toolbar}
            />
            {dialogs}
        </>
    );
};
