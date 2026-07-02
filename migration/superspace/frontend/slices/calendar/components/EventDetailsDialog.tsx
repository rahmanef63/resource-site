
import React from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Edit2, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface EventDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    onEdit: (event: any) => void
    onDelete: (eventId: string) => void
}

export function EventDetailsDialog({
    open,
    onOpenChange,
    event,
    onEdit,
    onDelete
}: EventDetailsDialogProps) {
    if (!event) return null

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
            <ResponsiveDialog.Header>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <ResponsiveDialog.Title className="text-xl leading-none">{event.title}</ResponsiveDialog.Title>
                        <ResponsiveDialog.Description className="sr-only">Event details</ResponsiveDialog.Description>
                        {event.type && (
                            <Badge variant="secondary" className="mt-2 capitalize bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                {event.type}
                            </Badge>
                        )}
                    </div>
                </div>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <div className="grid gap-4">
                    {/* Time & Date */}
                    <div className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="grid gap-0.5">
                            <span className="font-medium text-foreground">
                                {formatDate(event.startsAt)}
                            </span>
                            {!event.allDay && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                    {formatTime(event.startsAt)}
                                    {event.endsAt && ` - ${formatTime(event.endsAt)}`}
                                </span>
                            )}
                            {event.allDay && (
                                <span className="text-muted-foreground">All Day</span>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <span className="text-foreground">{event.location}</span>
                        </div>
                    )}

                    <Separator />

                    {/* Description */}
                    {event.description && (
                        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {event.description}
                        </div>
                    )}

                    {!event.description && (
                        <div className="text-sm text-muted-foreground italic">
                            No description provided.
                        </div>
                    )}
                </div>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        onDelete(event._id)
                        onOpenChange(false)
                    }}
                    className="gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            onEdit(event)
                            onOpenChange(false)
                        }}
                        className="gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Button>
                </div>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    )
}
