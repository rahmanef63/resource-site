/**
 * Studio Header — Right Section
 * Undo/Redo | Export/Import/Docs/Converter/Preview | Clear canvas
 */
import React from 'react';
import { Undo2, Redo2, Download, Upload, BookMarked, ArrowRightLeft, ExternalLink, Eraser, ChevronDown, FileJson, FileCode, Image as ImageIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface StudioHeaderRightProps {
    undo: () => void;
    canUndo: boolean;
    redo: () => void;
    canRedo: boolean;
    handleExport: (format?: 'studio' | 'n8n') => void;
    handleImport: () => void;
    onOpenDocs: () => void;
    onOpenConverter: () => void;
    onOpenPreview: () => void;
    handleExportHtml?: () => void;
    handleExportJpg?: () => void;
    /** Triggers clear confirmation dialog in parent */
    onClearRequest: () => void;
}

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children as any}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
);

const Sep = () => <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;

export const StudioHeaderRight: React.FC<StudioHeaderRightProps> = ({
    undo, canUndo, redo, canRedo,
    handleExport, handleImport,
    onOpenDocs, onOpenConverter, onOpenPreview,
    handleExportHtml, handleExportJpg,
    onClearRequest,
}) => (
    <TooltipProvider delayDuration={400}>
        <div className="flex items-center gap-0.5 shrink-0">
            <Tip label="Undo (Ctrl+Z)">
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 w-7 p-0">
                    <Undo2 size={13} />
                </Button>
            </Tip>
            <Tip label="Redo (Ctrl+Shift+Z)">
                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 w-7 p-0">
                    <Redo2 size={13} />
                </Button>
            </Tip>

            <Sep />

            <DropdownMenu>
                <Tip label="Export…">
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-1.5 gap-0.5 shrink-0">
                            <Download size={13} />
                            <ChevronDown size={10} className="text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                </Tip>
                <DropdownMenuContent align="end" className="w-48" sideOffset={4}>
                    <DropdownMenuItem onClick={() => handleExport('studio')} className="gap-2 text-xs">
                        <FileJson size={13} /> Export Studio JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('n8n')} className="gap-2 text-xs">
                        <FileJson size={13} /> Export n8n JSON
                    </DropdownMenuItem>
                    {handleExportHtml && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExportHtml} className="gap-2 text-xs">
                                <FileCode size={13} /> Export as HTML
                            </DropdownMenuItem>
                        </>
                    )}
                    {handleExportJpg && (
                        <DropdownMenuItem onClick={handleExportJpg} className="gap-2 text-xs">
                            <ImageIcon size={13} /> Export as JPG
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Tip label="Import JSON">
                <Button variant="ghost" size="sm" onClick={handleImport} className="h-7 w-7 p-0">
                    <Upload size={13} />
                </Button>
            </Tip>
            <Sep />

            <DropdownMenu>
                <Tip label="More actions">
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal size={13} />
                        </Button>
                    </DropdownMenuTrigger>
                </Tip>
                <DropdownMenuContent align="end" className="w-52" sideOffset={4}>
                    <DropdownMenuItem onClick={onOpenDocs} className="gap-2 text-xs">
                        <BookMarked size={13} /> JSON Schema Docs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenConverter} className="gap-2 text-xs">
                        <ArrowRightLeft size={13} /> JSON Converter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenPreview} className="gap-2 text-xs">
                        <ExternalLink size={13} /> Open Preview Tab
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Sep />

            <Tip label="Clear Canvas">
                <Button variant="ghost" size="sm" onClick={onClearRequest} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Eraser size={13} />
                </Button>
            </Tip>
        </div>
    </TooltipProvider>
);
