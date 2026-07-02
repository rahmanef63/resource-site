
import React, { useEffect, useState } from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker/SharedDatePicker"
import { InlineColorPicker } from "@/frontend/shared/ui/color-picker"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventFormData {
    title: string
    description: string
    startDate: string
    startTime: string
    hasEndTime: boolean
    endDate: string
    endTime: string
    allDay: boolean
    location: string
    color: string
    type: string
}

const defaultFormData: EventFormData = {
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    hasEndTime: true,
    endDate: new Date().toISOString().split("T")[0],
    endTime: "10:00",
    allDay: false,
    location: "",
    color: "#3b82f6", // Default blue hex
    type: "meeting",
}

import { EVENT_TYPES, EVENT_COLORS } from "../constants"

interface EventFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialDate?: Date
    event?: any
    onSubmit: (data: EventFormData) => Promise<void>
    isProcessing?: boolean
}

export function EventFormDialog({
    open,
    onOpenChange,
    initialDate,
    event,
    onSubmit,
    isProcessing = false
}: EventFormDialogProps) {
    const [formData, setFormData] = useState<EventFormData>(defaultFormData)
    const [openTypeCombo, setOpenTypeCombo] = useState(false)

    useEffect(() => {
        if (open) {
            if (event) {
                // Edit mode
                const startDate = new Date(event.startsAt)
                const endDate = new Date(event.endsAt)
                setFormData({
                    title: event.title || "",
                    description: event.description || "",
                    startDate: startDate.toISOString().split("T")[0],
                    startTime: startDate.toTimeString().slice(0, 5),
                    hasEndTime: !!event.endsAt, // Assume true if exists
                    endDate: endDate.toISOString().split("T")[0],
                    endTime: endDate.toTimeString().slice(0, 5),
                    allDay: event.allDay || false,
                    location: event.location || "",
                    color: event.color || "#3b82f6",
                    type: event.type || "meeting",
                })
            } else {
                // Create mode
                setFormData({
                    ...defaultFormData,
                    startDate: initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                    endDate: initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                })
            }
        }
    }, [open, event, initialDate])

    const handleDurationClick = (minutes: number) => {
        // Simple logic: add minutes to start time
        if (!formData.startDate || !formData.startTime) return;

        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(start.getTime() + minutes * 60000);

        setFormData({
            ...formData,
            hasEndTime: true,
            endDate: end.toISOString().split("T")[0],
            endTime: end.toTimeString().slice(0, 5)
        })
    }

    const handleSubmit = async () => {
        if (!formData.title.trim()) return
        await onSubmit(formData)
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="lg">
            <ResponsiveDialog.Header>
                <ResponsiveDialog.Title>{event ? "Edit Event" : "Create Event"}</ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                    {event ? "Update event details" : "Add a new event to your calendar"}
                </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Event title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="text-lg font-medium"
                        />
                    </div>

                    {/* All Day Toggle */}
                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                        <Label className="cursor-pointer flex-1" onClick={() => setFormData(p => ({ ...p, allDay: !p.allDay }))}>All day event</Label>
                        <Switch
                            checked={formData.allDay}
                            onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
                        />
                    </div>

                    {/* Start Date/Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start</Label>
                            <SharedDatePicker
                                date={formData.startDate ? new Date(formData.startDate) : undefined}
                                onChange={(date) => setFormData({
                                    ...formData,
                                    startDate: date ? date.toLocaleDateString('en-CA') : ""
                                })}
                                showPresets={true}
                                showTimePicker={!formData.allDay}
                                timeValue={formData.startTime}
                                onTimeChange={(time) => setFormData({ ...formData, startTime: time })}
                            />
                        </div>

                        {/* End Date/Time or Duration */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>End</Label>
                                <div className="flex items-center space-x-2">
                                    {!formData.allDay && (
                                        <span className="text-xs text-muted-foreground flex gap-1">
                                            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]" onClick={() => handleDurationClick(15)}>+15m</Button>
                                            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]" onClick={() => handleDurationClick(30)}>+30m</Button>
                                            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]" onClick={() => handleDurationClick(60)}>+1h</Button>
                                        </span>
                                    )}
                                    <Switch
                                        checked={formData.hasEndTime}
                                        onCheckedChange={(c) => setFormData({ ...formData, hasEndTime: c })}
                                        className="scale-75"
                                    />
                                </div>
                            </div>

                            {formData.hasEndTime ? (
                                <SharedDatePicker
                                    date={formData.endDate ? new Date(formData.endDate) : undefined}
                                    onChange={(date) => setFormData({
                                        ...formData,
                                        endDate: date ? date.toLocaleDateString('en-CA') : ""
                                    })}
                                    fromDate={formData.startDate ? new Date(formData.startDate) : undefined}
                                    showTimePicker={!formData.allDay}
                                    timeValue={formData.endTime}
                                    onTimeChange={(time) => setFormData({ ...formData, endTime: time })}
                                    disabled={!formData.hasEndTime}
                                />
                            ) : (
                                <div className="h-10 flex items-center justify-center text-sm text-muted-foreground border rounded-md border-dashed bg-muted/20">
                                    No end time set
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Type & Color Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Custom Type Combobox */}
                        <div className="space-y-2 flex flex-col">
                            <Label>Type</Label>
                            <Popover open={openTypeCombo} onOpenChange={setOpenTypeCombo}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openTypeCombo} className="justify-between">
                                        {formData.type || "Select type..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search type..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
                                                    onClick={() => {
                                                        setFormData({ ...formData, type: "Custom" }); // Simplify for now or capture input
                                                        setOpenTypeCombo(false);
                                                    }}
                                                >
                                                    + Create new type
                                                </Button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {EVENT_TYPES.map((type) => (
                                                    <CommandItem
                                                        key={type.value}
                                                        value={type.value}
                                                        onSelect={(currentValue) => {
                                                            setFormData({ ...formData, type: currentValue })
                                                            setOpenTypeCombo(false)
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", formData.type === type.value ? "opacity-100" : "opacity-0")} />
                                                        {type.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Custom Color Picker */}
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <InlineColorPicker
                                value={formData.color}
                                onChange={(c) => setFormData({ ...formData, color: c })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="Add location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Add details"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isProcessing || !formData.title.trim()}>
                    {isProcessing ? (event ? "Updating..." : "Creating...") : (event ? "Update Event" : "Create Event")}
                </Button>
            </ResponsiveDialog.Footer>
        </ResponsiveDialog>
    )
}
