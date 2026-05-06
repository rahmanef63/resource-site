import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CalendarEvent } from "./types"

interface DraggableEventProps {
    event: CalendarEvent;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
}

export const DraggableEvent = ({ event, children, onClick, disabled }: DraggableEventProps) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: event.id,
        data: { event },
        disabled
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: 0.8,
        cursor: 'grabbing'
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className="touch-none w-full"
        >
            {children}
        </div>
    )
}
