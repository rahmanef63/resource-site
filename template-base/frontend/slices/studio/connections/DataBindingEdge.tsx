/**
 * Data Binding Edge
 * 
 * Connects automation nodes to UI blocks for live data flow.
 * When an automation node produces data, it flows to connected UI blocks.
 */

import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { Database, ArrowRight } from 'lucide-react';

export interface DataBindingEdgeData {
    /** Source property from automation node output */
    sourceProperty?: string;
    /** Target property on UI block */
    targetProperty?: string;
    /** Transformation function name */
    transform?: string;
    /** Label for the binding */
    label?: string;
}

/**
 * Custom edge for data binding between automation nodes and UI blocks.
 * Visualizes the data flow with a distinctive style.
 */
export function DataBindingEdge({
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
}: EdgeProps<DataBindingEdgeData>) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const label = data?.label ||
        (data?.sourceProperty && data?.targetProperty
            ? `${data.sourceProperty} → ${data.targetProperty}`
            : 'Data Binding');

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: '#8b5cf6', // Purple for data bindings
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
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
                    className="flex items-center gap-1 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] px-2 py-0.5 rounded-full border border-violet-300 dark:border-violet-700 shadow-sm"
                >
                    <Database className="w-3 h-3" />
                    <span>{label}</span>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default DataBindingEdge;
