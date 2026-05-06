export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEvent {
    id: string;
    title: string;
    startsAt: Date;
    endsAt?: Date; // Optional for now
    color?: string; // Hex color or class name hint
    allDay?: boolean;
    // Generic data bucket for the original object (e.g., Database Record or Calendar Document)
    originalData?: any;
}

export interface CalendarDayProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected?: boolean;
    events: CalendarEvent[];
    onDateClick?: (date: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onAddEventClick?: (date: Date) => void;
    renderEvent?: (event: CalendarEvent) => React.ReactNode;
}
