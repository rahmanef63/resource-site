import React from 'react';
// Studio canvas widget — uses the raw 3-column primitive directly because the
// builder context renders bare placeholder panels, not feature pages. All
// other callers go through FeatureThreeColumnLayout. Direct import preserved
// intentionally; do not migrate.
import { ThreeColumnLayoutAdvanced } from '@/frontend/shared/ui/layout/container/three-column';
import { cn } from '@/lib/utils';

export interface ThreeColumnWidgetProps {
    leftWidth?: number;
    rightWidth?: number;
    leftCollapsed?: boolean;
    rightCollapsed?: boolean;
    resizable?: boolean;
    showCollapseButtons?: boolean;
    leftLabel?: string;
    centerLabel?: string;
    rightLabel?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ThreeColumnWidget: React.FC<ThreeColumnWidgetProps> = ({
    leftWidth = 280,
    rightWidth = 320,
    leftCollapsed = false,
    rightCollapsed = false,
    resizable = true,
    showCollapseButtons = true,
    leftLabel = 'Left Panel',
    centerLabel = 'Main Content',
    rightLabel = 'Right Panel',
    className,
    children,
}) => {
    // In the builder context, we render placeholder panels
    // Children can be wired via the node system
    const leftPanel = (
        <div className="h-full p-4 bg-muted/30 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{leftLabel}</span>
        </div>
    );

    const centerPanel = (
        <div className="h-full p-4 flex items-center justify-center">
            {children || <span className="text-muted-foreground text-sm">{centerLabel}</span>}
        </div>
    );

    const rightPanel = (
        <div className="h-full p-4 bg-muted/30 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{rightLabel}</span>
        </div>
    );

    return (
        <div className={cn('h-64 w-full border rounded-lg overflow-hidden', className)}>
            <ThreeColumnLayoutAdvanced
                left={leftPanel}
                center={centerPanel}
                right={rightPanel}
                leftWidth={leftWidth}
                rightWidth={rightWidth}
                defaultLeftCollapsed={leftCollapsed}
                defaultRightCollapsed={rightCollapsed}
                resizable={resizable}
                showCollapseButtons={showCollapseButtons}
                leftLabel={leftLabel}
                centerLabel={centerLabel}
                rightLabel={rightLabel}
            />
        </div>
    );
};
