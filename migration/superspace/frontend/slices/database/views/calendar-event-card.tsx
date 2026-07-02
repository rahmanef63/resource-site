/**
 * Calendar Event Card Component
 * 
 * Displays a record as an event card on the calendar.
 * Supports drag-and-drop, color coding, and property display.
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.5
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyRowData } from './table-columns';

export interface CalendarEvent {
  id: string;
  record: PropertyRowData;
  date: Date;
  color?: string;
  title: string;
  status?: string; // Add status to event interface
}

export interface CalendarEventCardProps {
  /** The calendar event to display */
  event: CalendarEvent;
  
  /** Whether the card can be dragged */
  isDraggable?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Optional CSS class name */
  className?: string;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  isDraggable = true,
  onClick,
  className,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    disabled: !isDraggable,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-2 rounded-md border p-2 text-xs transition-all',
        'hover:shadow-md cursor-pointer',
        isDragging && 'opacity-50',
        className
      )}
      onClick={onClick}
      {...attributes}
    >
      {isDraggable && (
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      
      {event.color && (
        <div
          className="w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-md"
          style={{ backgroundColor: event.color }}
        />
      )}
      
      <div className={cn('flex-1 min-w-0', event.color && 'pl-2')}>
        <p className="font-medium truncate">{event.title}</p>
        {event.status && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {event.status}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default CalendarEventCard;
