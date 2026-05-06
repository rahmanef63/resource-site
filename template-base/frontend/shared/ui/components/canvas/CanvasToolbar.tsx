import React from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  Minus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface CanvasToolbarProps {
  onLayout?: (direction: 'TB' | 'LR' | 'RL' | 'BT') => void;
  className?: string;
  showLayoutControls?: boolean;
}

/**
 * Unified vertical toolbar on the left side
 * Combines Layout and Zoom controls in a single strip
 */
export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onLayout,
  className,
  showLayoutControls = true
}) => {
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const handleFitView = () => fitView({ padding: 0.1, duration: 800 });
  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleResetZoom = () => zoomTo(1, { duration: 200 });

  // Button style for consistent look
  const btnClass = "w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/80";

  return (
    <TooltipProvider delayDuration={300}>
      <Panel position="bottom-left" className={cn('ml-2 mb-2', className)}>
        <div className="bg-background/95 backdrop-blur-md rounded-lg shadow-lg border border-border/50 flex flex-col items-center py-2 px-1.5 gap-1">
          {/* Layout Controls */}
          {showLayoutControls && onLayout && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => onLayout('TB')} className={btnClass}>
                    <ArrowDown size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Top → Bottom</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => onLayout('BT')} className={btnClass}>
                    <ArrowUp size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Bottom → Top</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => onLayout('LR')} className={btnClass}>
                    <ArrowRight size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Left → Right</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => onLayout('RL')} className={btnClass}>
                    <ArrowLeft size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Right → Left</TooltipContent>
              </Tooltip>

              <Separator className="my-1 w-6" />
            </>
          )}

          {/* Zoom Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleZoomIn} className={btnClass}>
                <ZoomIn size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleZoomOut} className={btnClass}>
                <ZoomOut size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleResetZoom} className={cn(btnClass, "text-xs font-medium")}>
                1:1
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Reset Zoom (100%)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleFitView} className={btnClass}>
                <Maximize size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Fit to View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => fitView({ padding: 0.2, duration: 1000 })} className={btnClass}>
                <Sparkles size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Auto Arrange</TooltipContent>
          </Tooltip>
        </div>
      </Panel>
    </TooltipProvider>
  );
};

