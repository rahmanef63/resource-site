/**
 * Event Binding Edge
 * 
 * Connects UI blocks to automation triggers.
 * When a UI event occurs (click, submit, change), it triggers an automation workflow.
 */

import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { Zap } from 'lucide-react';

export interface EventBindingEdgeData {
    /** Event type that triggers the binding */
    eventType?: 'click' | 'submit' | 'change' | 'focus' | 'blur' | 'hover';
    /** Whether to prevent default behavior */
    preventDefault?: boolean;
    /** Whether to stop propagation */
    stopPropagation?: boolean;
    /** Label for the binding */
    label?: string;
}

/**
 * Custom edge for event binding from UI blocks to automation triggers.
 * Visualizes the event flow with a distinctive style.
 */
export function EventBindingEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
    markerEnd,
}: EdgeProps<EventBindingEdgeData>) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const label = data?.label || data?.eventType || 'Event';

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: '#f59e0b', // Amber for event bindings
                    strokeWidth: 2,
                    strokeDasharray: '3,3',
                    ...style,
                }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shadow-sm"
                >
                    <Zap className="w-3 h-3" />
                    <span>{label}</span>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default EventBindingEdge;
