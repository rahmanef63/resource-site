/**
 * Studio Canvas Empty State
 *
 * Shown when the canvas has no nodes.
 * Provides 4 quick-action entry points to get started.
 */
import React from 'react';
import { Plus, LayoutTemplate, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui';

export interface StudioCanvasEmptyProps {
    onAddElement: () => void;
    onChooseTemplate: () => void;
    onAskAI: () => void;
    onImport: () => void;
}

export const StudioCanvasEmpty: React.FC<StudioCanvasEmptyProps> = ({
    onAddElement,
    onChooseTemplate,
    onAskAI,
    onImport,
}) => (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center select-none">
        {/* Icon */}
        <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <LayoutTemplate size={28} className="text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Canvas is empty</p>
                <p className="text-xs text-muted-foreground mt-0.5">Choose how you'd like to get started</p>
            </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 px-3 hover:bg-accent hover:border-primary/30 transition-colors"
                onClick={onAddElement}
            >
                <Plus size={20} className="text-primary" />
                <span className="text-xs font-medium">Add Element</span>
            </Button>

            <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 px-3 hover:bg-accent hover:border-primary/30 transition-colors"
                onClick={onChooseTemplate}
            >
                <LayoutTemplate size={20} className="text-violet-500" />
                <span className="text-xs font-medium">Template</span>
            </Button>

            <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 px-3 hover:bg-accent hover:border-primary/30 transition-colors"
                onClick={onAskAI}
            >
                <Sparkles size={20} className="text-amber-500" />
                <span className="text-xs font-medium">Ask AI</span>
            </Button>

            <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 px-3 hover:bg-accent hover:border-primary/30 transition-colors"
                onClick={onImport}
            >
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-xs font-medium">Import</span>
            </Button>
        </div>

        {/* Hint */}
        <p className="text-[11px] text-muted-foreground/60">
            Or drag components from the Library panel
        </p>
    </div>
);
