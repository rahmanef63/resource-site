/**
 * Studio Header — Center Section
 * Panel visibility toggles, viewport selector, bottom panel toggle, group button.
 *
 * Tab switching (Library/Templates/Settings) was moved inside StudioLeftPanel
 * so the panel is self-contained. This section now focuses on canvas controls.
 */
import React from 'react';
import { Group, PanelBottom, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StudioMode } from '@/frontend/slices/studio/registry';
import type { ActiveView } from '@/frontend/slices/studio/views/StudioEditorTabs';

export interface StudioHeaderCenterProps {
    mode: StudioMode;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    setViewport?: (v: 'desktop' | 'tablet' | 'mobile') => void;
    onToggleBottom?: () => void;
    activeView?: ActiveView;
    onGroup: () => void;
}

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children as any}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
);

const Sep = () => <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;

export const StudioHeaderCenter: React.FC<StudioHeaderCenterProps> = ({
    mode,
    viewport, setViewport, onToggleBottom, activeView,
    onGroup,
}) => (
    <TooltipProvider delayDuration={400}>
        <div className="flex items-center gap-0.5 shrink-0">
            {/* Viewport toggle — only in preview/split-preview views for UI/unified modes */}
            {(mode === 'ui' || mode === 'unified') && setViewport && (activeView === 'preview' || activeView === 'split-preview') && (
                <>
                    <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                        <Tip label="Desktop viewport">
                            <Button
                                variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewport('desktop')}
                                className="h-6 px-2 text-xs gap-1 shrink-0"
                            >
                                <Monitor size={11} />
                            </Button>
                        </Tip>
                        <Tip label="Tablet viewport">
                            <Button
                                variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewport('tablet')}
                                className="h-6 px-2 text-xs gap-1 shrink-0"
                            >
                                <Tablet size={11} />
                            </Button>
                        </Tip>
                        <Tip label="Mobile viewport">
                            <Button
                                variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewport('mobile')}
                                className="h-6 px-2 text-xs gap-1 shrink-0"
                            >
                                <Smartphone size={11} />
                            </Button>
                        </Tip>
                    </div>
                    <Sep />
                </>
            )}

            {/* Group button */}
            <Tip label="Group selected nodes (G)">
                <Button variant="ghost" size="sm" onClick={onGroup} className="h-7 w-7 p-0 shrink-0">
                    <Group size={12} />
                </Button>
            </Tip>

            {/* Bottom panel toggle */}
            {onToggleBottom && (
                <>
                    <Sep />
                    <Tip label="Toggle Output Panel">
                        <Button variant="ghost" size="sm" onClick={onToggleBottom} className="h-7 w-7 p-0 shrink-0">
                            <PanelBottom size={12} />
                        </Button>
                    </Tip>
                </>
            )}
        </div>
    </TooltipProvider>
);
