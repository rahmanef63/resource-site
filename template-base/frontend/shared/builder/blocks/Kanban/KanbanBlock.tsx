/**
 * KanbanBlock — Drag-and-drop task board with localStorage persistence.
 *
 * Features:
 *   - Real DnD using @dnd-kit/core + @dnd-kit/sortable
 *   - Reorder within column + cross-column moves
 *   - Controlled (onColumnsChange) and uncontrolled (internal state) modes
 *   - localStorage persistence: persistStrategy="localStorage" + persistKey
 *   - Polished UI: column accents, card hierarchy, priority badges, assignee avatars
 *   - DragOverlay with smooth drop animation
 */

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    useDroppable,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Kanban, MoreHorizontal, Plus, RotateCcw, CalendarDays, Tag } from "lucide-react"
import { BlockCard } from "../shared"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface KanbanAssignee {
    src?: string
    fallback?: string
    alt?: string
}

export interface KanbanItem {
    id: string
    title: string
    status?: string
    priority?: "low" | "medium" | "high"
    tags?: string[]
    assignee?: KanbanAssignee
    dueDate?: string
}

export interface KanbanColumn {
    id: string
    title: string
    items: KanbanItem[]
}

export type KanbanPersistStrategy = "none" | "localStorage"

export interface KanbanBlockProps {
    columns?: KanbanColumn[]
    title?: string
    description?: string
    height?: string
    className?: string
    loading?: boolean
    enableDragDrop?: boolean
    /** "localStorage" saves board state across reloads. Requires persistKey. */
    persistStrategy?: KanbanPersistStrategy
    /** Unique key for localStorage. e.g. "studio-kanban-project-1" */
    persistKey?: string
    onColumnsChange?: (columns: KanbanColumn[]) => void
    onAddItem?: (columnId: string) => void
    onItemClick?: (item: KanbanItem) => void
}

// ============================================================================
// Constants
// ============================================================================

/** Color accent per column position (wraps around) */
const COLUMN_ACCENT_COLORS = [
    { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", ring: "ring-blue-400" },
    { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", ring: "ring-amber-400" },
    { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-400" },
    { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", ring: "ring-purple-400" },
    { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", ring: "ring-rose-400" },
]

const PRIORITY_CONFIG = {
    high:   { label: "High",   className: "bg-red-100 text-red-700 border-red-200" },
    medium: { label: "Med",    className: "bg-amber-100 text-amber-700 border-amber-200" },
    low:    { label: "Low",    className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
}

// ============================================================================
// KanbanCard (pure display, no dnd)
// ============================================================================

interface KanbanCardProps {
    item: KanbanItem
    onItemClick?: (item: KanbanItem) => void
    isDragOverlay?: boolean
}

function KanbanCard({ item, onItemClick, isDragOverlay }: KanbanCardProps) {
    const priority = item.priority ? PRIORITY_CONFIG[item.priority] : null

    return (
        <div
            className={cn(
                "bg-white rounded-lg border p-3 space-y-2 group",
                isDragOverlay
                    ? "shadow-2xl rotate-1 ring-2 ring-primary/30 cursor-grabbing border-primary/20"
                    : "border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150 cursor-grab active:cursor-grabbing",
            )}
            onClick={() => !isDragOverlay && onItemClick?.(item)}
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 leading-snug flex-1">{item.title}</p>
                {!isDragOverlay && (
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 -mt-0.5 -mr-1 p-0.5 rounded">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-500 font-medium">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer row: priority + due date + assignee */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    {priority && (
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", priority.className)}>
                            {priority.label}
                        </span>
                    )}
                    {item.dueDate && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
                            <CalendarDays className="h-2.5 w-2.5" />
                            {item.dueDate}
                        </span>
                    )}
                </div>
                {item.assignee && (
                    <Avatar className="h-5 w-5 flex-shrink-0 ring-1 ring-white ring-offset-0">
                        {item.assignee.src && <AvatarImage src={item.assignee.src} alt={item.assignee.alt ?? ""} />}
                        <AvatarFallback className="text-[8px] font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {item.assignee.fallback ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// SortableCard (DnD wrapper)
// ============================================================================

function SortableCard({ item, onItemClick }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        data: { type: "item", item },
    })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
            className={cn(isDragging && "opacity-40")}
        >
            <KanbanCard item={item} onItemClick={onItemClick} />
        </div>
    )
}

// ============================================================================
// DroppableColumn
// ============================================================================

interface DroppableColumnProps {
    column: KanbanColumn
    accentIdx: number
    isOver: boolean
    colHeight: string
    onAddItem?: (columnId: string) => void
    onItemClick?: (item: KanbanItem) => void
}

function DroppableColumn({ column, accentIdx, isOver, colHeight, onAddItem, onItemClick }: DroppableColumnProps) {
    const { setNodeRef } = useDroppable({ id: column.id, data: { type: "column", column } })
    const accent = COLUMN_ACCENT_COLORS[accentIdx % COLUMN_ACCENT_COLORS.length]

    return (
        <div className={cn(
            "flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all duration-200",
            isOver ? `${accent.border} ${accent.bg} ring-2 ${accent.ring}/30` : "border-gray-200 bg-gray-50/60",
        )}>
            {/* Column header */}
            <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200/80">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", `bg-${accent.border.split("-")[1]}-400`)} />
                    <h3 className="text-sm font-semibold text-gray-700 truncate">{column.title}</h3>
                    <span className={cn("ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0", accent.badge)}>
                        {column.items.length}
                    </span>
                </div>
                {onAddItem && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 flex-shrink-0"
                        onClick={() => onAddItem(column.id)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Cards */}
            <div ref={setNodeRef} className="flex-1 flex flex-col">
                <ScrollArea style={{ height: colHeight }}>
                    <div className="p-2 flex flex-col gap-2">
                        <SortableContext items={column.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {column.items.map(item => (
                                <SortableCard key={item.id} item={item} onItemClick={onItemClick} />
                            ))}
                        </SortableContext>
                        {column.items.length === 0 && (
                            <div className={cn(
                                "h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
                                isOver ? `${accent.border} bg-white/60` : "border-gray-200",
                            )}>
                                <span className="text-xs text-gray-400">{isOver ? "Drop here" : "No items"}</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

// ============================================================================
// useKanbanPersistence hook
// ============================================================================

function useKanbanPersistence(
    persistStrategy: KanbanPersistStrategy,
    persistKey: string | undefined,
    initial: KanbanColumn[],
): [KanbanColumn[], (next: KanbanColumn[]) => void, () => void] {
    const load = useCallback((): KanbanColumn[] => {
        if (persistStrategy !== "localStorage" || !persistKey) return initial
        try {
            const raw = localStorage.getItem(persistKey)
            if (!raw) return initial
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed as KanbanColumn[]
        } catch { /* ignore parse errors */ }
        return initial
    }, [persistStrategy, persistKey]) // eslint-disable-line react-hooks/exhaustive-deps

    const [columns, _setColumns] = useState<KanbanColumn[]>(() => load())

    const setColumns = useCallback((next: KanbanColumn[]) => {
        _setColumns(next)
        if (persistStrategy === "localStorage" && persistKey) {
            try { localStorage.setItem(persistKey, JSON.stringify(next)) } catch { /* quota errors */ }
        }
    }, [persistStrategy, persistKey])

    const reset = useCallback(() => {
        if (persistStrategy === "localStorage" && persistKey) {
            try { localStorage.removeItem(persistKey) } catch { /* ignore */ }
        }
        _setColumns(initial)
    }, [persistStrategy, persistKey]) // eslint-disable-line react-hooks/exhaustive-deps

    return [columns, setColumns, reset]
}

// ============================================================================
// KanbanBlock
// ============================================================================

const EMPTY_COLUMNS: KanbanColumn[] = []

export function KanbanBlock({
    columns: columnsProp,
    title = "Kanban Board",
    description,
    height = "380px",
    className,
    loading = false,
    enableDragDrop = true,
    persistStrategy = "none",
    persistKey,
    onColumnsChange,
    onAddItem,
    onItemClick,
}: KanbanBlockProps) {
    const initial = columnsProp ?? EMPTY_COLUMNS

    const [columns, setColumnsState, resetPersisted] = useKanbanPersistence(persistStrategy, persistKey, initial)
    const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)
    const [overId, setOverId] = useState<string | null>(null)

    // Sync from props (inspector updates) without clobbering persisted state on first render
    const hasMountedRef = useRef(false)
    useEffect(() => {
        if (!hasMountedRef.current) { hasMountedRef.current = true; return }
        if (columnsProp && persistStrategy === "none") setColumnsState(columnsProp)
    }, [columnsProp]) // eslint-disable-line react-hooks/exhaustive-deps

    const onColumnsChangeRef = useRef(onColumnsChange)
    useEffect(() => { onColumnsChangeRef.current = onColumnsChange }, [onColumnsChange])

    const setColumns = useCallback((next: KanbanColumn[]) => {
        setColumnsState(next)
        setTimeout(() => onColumnsChangeRef.current?.(next), 0)
    }, [setColumnsState])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveItem((event.active.data.current?.item as KanbanItem | undefined) ?? null)
    }, [])

    const handleDragOver = useCallback((event: DragOverEvent) => {
        setOverId(event.over ? String(event.over.id) : null)
    }, [])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        setActiveItem(null)
        setOverId(null)
        if (!over) return

        const activeId = String(active.id)
        const overId = String(over.id)
        if (activeId === overId) return

        const cols: KanbanColumn[] = columns.map(col => ({ ...col, items: [...col.items] }))

        const srcColIdx = cols.findIndex(col => col.items.some(i => i.id === activeId))
        if (srcColIdx === -1) return

        const srcCol = cols[srcColIdx]
        const srcItemIdx = srcCol.items.findIndex(i => i.id === activeId)
        const dragged = { ...srcCol.items[srcItemIdx] }

        // Over a column (empty drop / column header)
        const destColIdx = cols.findIndex(col => col.id === overId)
        if (destColIdx !== -1 && destColIdx !== srcColIdx) {
            srcCol.items.splice(srcItemIdx, 1)
            cols[destColIdx].items.push(dragged)
            setColumns([...cols])
            return
        }

        // Over an item (reorder / cross-column at position)
        const overColIdx = cols.findIndex(col => col.items.some(i => i.id === overId))
        if (overColIdx === -1) return
        const overCol = cols[overColIdx]
        const overItemIdx = overCol.items.findIndex(i => i.id === overId)

        if (srcColIdx === overColIdx) {
            cols[srcColIdx].items = arrayMove(srcCol.items, srcItemIdx, overItemIdx)
        } else {
            srcCol.items.splice(srcItemIdx, 1)
            overCol.items.splice(overItemIdx, 0, dragged)
        }

        setColumns([...cols])
    }, [columns, setColumns])

    const isEmpty = columns.length === 0

    const headerAction = persistStrategy === "localStorage" && persistKey ? (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Reset board to default"
            onClick={resetPersisted}
        >
            <RotateCcw className="h-3.5 w-3.5" />
        </Button>
    ) : undefined

    const board = (
        <ScrollArea className="w-full" type="scroll">
            <div className="flex gap-3 pb-3 px-1 min-w-max">
                {columns.map((col, idx) => (
                    <DroppableColumn
                        key={col.id}
                        column={col}
                        accentIdx={idx}
                        isOver={
                            overId === col.id ||
                            // Also highlight when an item being dragged over belongs to this column
                            col.items.some(i => i.id === overId)
                        }
                        colHeight={height}
                        onAddItem={onAddItem}
                        onItemClick={onItemClick}
                    />
                ))}
            </div>
        </ScrollArea>
    )

    return (
        <BlockCard
            header={{
                title,
                description: description ?? (persistStrategy === "localStorage" ? "Auto-saved" : undefined),
                icon: Kanban,
                action: headerAction,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Kanban,
                title: "No columns",
                description: "Add columns via the Inspector (JSON field) to get started",
            }}
            className={cn("overflow-hidden", className)}
            noPadding
        >
            <div className="p-3">
                {enableDragDrop ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {board}
                        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                            {activeItem ? <KanbanCard item={activeItem} isDragOverlay /> : null}
                        </DragOverlay>
                    </DndContext>
                ) : board}
            </div>
        </BlockCard>
    )
}
