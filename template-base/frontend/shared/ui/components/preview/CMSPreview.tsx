import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Brush, FlaskConical } from 'lucide-react';

interface CMSPreviewProps {
  children?: React.ReactNode;
  designMode?: boolean;
  onToggleMode?: (mode: 'design' | 'interactive') => void;
  currentMode?: 'design' | 'interactive';
  className?: string;
  showSidebar?: boolean;
  footer?: React.ReactNode;
  iframeSrcDoc?: string;
  onFrameNodeSelect?: (nodeId: string) => void;
  iframeTitle?: string;
}

export const CMSPreview: React.FC<CMSPreviewProps> = ({
  children,
  designMode = true,
  onToggleMode,
  currentMode = 'design',
  className = '',
  showSidebar = false,
  footer,
  iframeSrcDoc,
  onFrameNodeSelect,
  iframeTitle = 'Studio Preview',
}) => {
  React.useEffect(() => {
    if (!iframeSrcDoc || !onFrameNodeSelect) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'studio-preview-frame' || data.type !== 'node-select' || typeof data.nodeId !== 'string') {
        return;
      }
      onFrameNodeSelect(data.nodeId);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [iframeSrcDoc, onFrameNodeSelect]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div className={cn('h-full w-full overflow-auto', !showSidebar && 'bg-slate-100')}>
        {iframeSrcDoc ? (
          <iframe
            title={iframeTitle}
            srcDoc={iframeSrcDoc}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="h-full w-full border-0 bg-white"
          />
        ) : children}
      </div>

      {footer && <div className="border-t bg-white">{footer}</div>}

      {onToggleMode && (
        <div className="absolute bottom-2 left-0 right-0 z-10 pointer-events-none flex justify-center">
          <div
            className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-full border border-gray-200 dark:border-zinc-700 shadow-md px-1 py-0.5 flex items-center gap-0.5 pointer-events-auto animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 px-2.5 text-xs rounded-full gap-1 transition-colors',
                currentMode === 'design'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Design mode — click to select nodes"
              onClick={() => onToggleMode('design')}
            >
              <Brush size={12} />
              Design
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 px-2.5 text-xs rounded-full gap-1 transition-colors',
                currentMode === 'interactive'
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Interactive mode — try the UI"
              onClick={() => onToggleMode('interactive')}
            >
              <FlaskConical size={12} />
              Interactive
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
