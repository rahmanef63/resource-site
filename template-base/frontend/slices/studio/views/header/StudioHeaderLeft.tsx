/**
 * Studio Header — Left Section
 * Mode toggle (UI / Flow / All) + Preview mode (Design / Interactive) + Group controls
 */
import React from 'react';
import { Layers3, Zap, Brush, FlaskConical, Ungroup } from 'lucide-react';
import { Button } from '@/components/ui';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StudioMode } from '@/frontend/slices/studio/registry';

export interface StudioHeaderLeftProps {
    mode: StudioMode;
    setMode: (mode: StudioMode) => void;
    previewMode: 'design' | 'interactive';
    setPreviewMode: (m: 'design' | 'interactive') => void;
    focusedGroupId: string | null;
    onExitGroup: () => void;
}

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children as any}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
);

export const StudioHeaderLeft: React.FC<StudioHeaderLeftProps> = ({
    mode, setMode,
    previewMode, setPreviewMode,
    focusedGroupId, onExitGroup,
}) => (
    <TooltipProvider delayDuration={400}>
        <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode toggle */}
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider select-none shrink-0">Editor</span>
            <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                <Tip label="UI Builder">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode('ui')}
                        className={cn('h-6 px-2 text-xs gap-1 transition-colors', mode === 'ui' && 'bg-emerald-500 text-white hover:bg-emerald-600')}
                    >
                        <Layers3 size={12} /> UI
                    </Button>
                </Tip>
                <Tip label="Workflow / Automation">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode('workflow')}
                        className={cn('h-6 px-2 text-xs gap-1 transition-colors', mode === 'workflow' && 'bg-violet-500 text-white hover:bg-violet-600')}
                    >
                        <Zap size={12} /> Flow
                    </Button>
                </Tip>
                <Tip label="Unified (UI + Flow)">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode('unified')}
                        className={cn('h-6 px-2 text-xs gap-1 transition-colors', mode === 'unified' && 'bg-blue-500 text-white hover:bg-blue-600')}
                    >
                        <Layers3 size={12} /> All
                    </Button>
                </Tip>
            </div>

            {/* Preview mode: Design / Interactive (only in UI/unified) */}
            {(mode === 'ui' || mode === 'unified') && (
                <>
                    <div className="w-px h-3 bg-border/60 shrink-0" />
                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider select-none shrink-0">Mode</span>
                    <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                        <Tip label="Design mode — click nodes to select">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewMode('design')}
                                className={cn('h-6 px-2 text-xs gap-1 transition-colors', previewMode === 'design' && 'bg-emerald-500 text-white hover:bg-emerald-600')}
                            >
                                <Brush size={11} /> Design
                            </Button>
                        </Tip>
                        <Tip label="Interactive mode — try the live UI">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewMode('interactive')}
                                className={cn('h-6 px-2 text-xs gap-1 transition-colors', previewMode === 'interactive' && 'bg-violet-500 text-white hover:bg-violet-600')}
                            >
                                <FlaskConical size={11} /> Interactive
                            </Button>
                        </Tip>
                    </div>
                </>
            )}

            {/* Exit group pill */}
            {focusedGroupId && (
                <button
                    onClick={onExitGroup}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0 border border-emerald-500/20"
                    title="Exit group focus mode"
                >
                    <Ungroup size={10} />
                    Exit Group
                </button>
            )}
        </div>
    </TooltipProvider>
);
