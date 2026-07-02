/**
 * Timeline Bar Component
 * 
 * Displays a record as a horizontal bar on the timeline/Gantt chart.
 * Supports drag-and-drop repositioning, resize handles, progress indicator, and color coding.
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.6
 */

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyRowData } from './table-columns';

export interface TimelineRecord extends PropertyRowData {
  startDate?: Date;
  endDate?: Date;
  progress?: number;
}

export interface TimelineBarProps {
  /** The record to display */
  record: TimelineRecord;
  
  /** Left position in pixels */
  left: number;
  
  /** Width in pixels */
  width: number;
  
  /** Top position in pixels */
  top: number;
  
  /** Color for the bar */
  color?: string;
  
  /** Title to display */
  title: string;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Whether the bar can be dragged */
  isDraggable?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Optional CSS class name */
  className?: string;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  record,
  left,
  width,
  top,
  color = '#6366f1',
  title,
  progress,
  isDraggable = true,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: record.id,
    disabled: !isDraggable,
  });

  const style = {
    left: transform ? left + transform.x : left,
    top: transform ? top + transform.y : top,
    width,
    backgroundColor: color,
  };

  // Don't render bars that are too small
  if (width < 20) {
    return (
      <div
        style={{
          left,
          top,
          width: Math.max(width, 4),
        }}
        className="absolute h-8 rounded cursor-pointer opacity-50"
        onClick={onClick}
        title={title}
      >
        <div 
          className="w-full h-full rounded"
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute h-8 rounded-md shadow-sm transition-all duration-200',
        'hover:shadow-md hover:z-10',
        isDragging && 'opacity-50 cursor-grabbing',
        !isDragging && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...attributes}
    >
      {/* Progress indicator */}
      {progress !== undefined && progress > 0 && (
        <div
          className="absolute inset-0 rounded-md bg-white/30"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Drag handle */}
      {isDraggable && isHovered && (
        <div
          className="absolute left-2 top-0 bottom-0 flex items-center cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-white/80" />
        </div>
      )}

      {/* Title */}
      <div className={cn(
        'absolute inset-0 flex items-center px-3 text-white font-medium text-sm',
        isDraggable && isHovered && 'pl-8'
      )}>
        <span className="truncate">{title}</span>
        {progress !== undefined && progress > 0 && (
          <span className="ml-auto text-xs opacity-80">{progress}%</span>
        )}
      </div>

      {/* Resize handles (for future enhancement) */}
      {isHovered && isDraggable && width > 60 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 flex items-center">
            <ChevronLeft className="h-3 w-3 text-white/60" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 flex items-center">
            <ChevronRight className="h-3 w-3 text-white/60" />
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineBar;
