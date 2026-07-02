/**
 * ============================================================================
 * EXAMPLE FEATURE - ExampleView.tsx
 * ============================================================================
 * 
 * The main view component containing business logic and UI composition.
 * 
 * KEY PATTERNS:
 * 1. Use Convex hooks for data fetching (useQuery)
 * 2. Use Convex mutations for data changes (useMutation)
 * 3. Handle loading and error states
 * 4. Compose smaller components
 * 
 * DATA FLOW:
 * 1. useQuery fetches data reactively (real-time updates!)
 * 2. useMutation sends changes to backend
 * 3. Backend validates with RBAC and logs audit events
 * 4. UI updates automatically via reactive queries
 */

"use client"

import type { Id } from "@convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { useState } from "react"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

// UI Components from shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
    Plus, 
    Trash2, 
    Check, 
    Lightbulb,
    BookOpen,
    Code,
    Rocket
} from "lucide-react"

interface ExampleViewProps {
    workspaceId: Id<"workspaces">
}

export type ExampleItem = {
    _id: Id<"exampleItems">
    name: string
    completed: boolean
}

export interface ExampleViewPresenterProps {
    items: ExampleItem[]
    newItemName: string
    isAdding: boolean
    onNewItemNameChange: (value: string) => void
    onAddItem: () => void | Promise<void>
    onToggle: (id: Id<"exampleItems">) => void | Promise<void>
    onDelete: (id: Id<"exampleItems">) => void | Promise<void>
}

export function ExampleViewPresenter({
    items,
    newItemName,
    isAdding,
    onNewItemNameChange,
    onAddItem,
    onToggle,
    onDelete,
}: ExampleViewPresenterProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Example Feature</h1>
                    <p className="text-muted-foreground">
                        A minimal reference implementation demonstrating SuperSpace patterns
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <BookOpen className="h-5 w-5 text-blue-500 mb-2" />
                        <CardTitle className="text-sm">Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Every file in this feature has detailed comments explaining the patterns.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Code className="h-5 w-5 text-green-500 mb-2" />
                        <CardTitle className="text-sm">Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            RBAC, Audit Logging, Real-time Updates, TypeScript, Zod validation.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Rocket className="h-5 w-5 text-purple-500 mb-2" />
                        <CardTitle className="text-sm">Get Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Copy this feature as a template: pnpm run create:feature my-feature
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>
                        Try adding, completing, and deleting items. Data persists in real-time!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a new item..."
                            value={newItemName}
                            onChange={(e) => onNewItemNameChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onAddItem()}
                            disabled={isAdding}
                        />
                        <Button onClick={() => onAddItem()} disabled={isAdding || !newItemName.trim()}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No items yet. Add one above!
                            </p>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <Button aria-label="Confirm"
                                        variant={item.completed ? "default" : "outline"}
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => onToggle(item._id)}
                                    >
                                        {item.completed && <Check className="h-3 w-3" />}
                                    </Button>
                                    <span className={item.completed ? "line-through text-muted-foreground flex-1" : "flex-1"}>
                                        {item.name}
                                    </span>
                                    {item.completed && (
                                        <Badge variant="secondary" className="text-xs">Done</Badge>
                                    )}
                                    <Button aria-label="Delete"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => onDelete(item._id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                            <span>{items.length} total</span>
                            <span>{items.filter((i) => i.completed).length} completed</span>
                            <span>{items.filter((i) => !i.completed).length} remaining</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Main view component for the Example feature
 * 
 * This demonstrates:
 * - Real-time data with useQuery
 * - Mutations with proper error handling
 * - Loading states
 * - Optimistic UI patterns
 */
export function ExampleView({ workspaceId }: ExampleViewProps) {
    // =========================================================================
    // STATE
    // =========================================================================
    
    const [newItemName, setNewItemName] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    
    // =========================================================================
    // DATA FETCHING - Real-time with Convex
    // =========================================================================
    
    /**
     * useQuery automatically:
     * - Fetches data on mount
     * - Re-fetches when args change
     * - Updates in real-time when data changes
     * - Returns undefined while loading
     */
    const items = useQuery(api.features.example.queries.getItems, {
        workspaceId,
    })
    
    // =========================================================================
    // MUTATIONS
    // =========================================================================
    
    /**
     * useMutation returns a function to call
     * The actual validation happens in the backend
     */
    const createItem = useMutation(api.features.example.mutations.createItem)
    const toggleItem = useMutation(api.features.example.mutations.toggleItem)
    const deleteItem = useMutation(api.features.example.mutations.deleteItem)
    
    // =========================================================================
    // HANDLERS
    // =========================================================================
    
    const handleAddItem = async () => {
        if (!newItemName.trim()) return
        
        setIsAdding(true)
        try {
            await createItem({
                workspaceId,
                name: newItemName.trim(),
            })
            setNewItemName("")
        } catch (error) {
            console.error("Failed to create item:", error)
            // In production, show a toast notification
        } finally {
            setIsAdding(false)
        }
    }
    
    const handleToggle = async (itemId: Id<"exampleItems">) => {
        try {
            await toggleItem({ itemId })
        } catch (error) {
            console.error("Failed to toggle item:", error)
        }
    }
    
    const handleDelete = async (itemId: Id<"exampleItems">) => {
        try {
            await deleteItem({ itemId, workspaceId })
        } catch (error) {
            console.error("Failed to delete item:", error)
        }
    }
    
    // =========================================================================
    // LOADING STATE
    // =========================================================================
    
    /**
     * items is undefined while loading
     * Show skeletons for better UX
     */
    if (items === undefined) {
        return (
            <FeatureShell featureId="example" padding>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </FeatureShell>
        )
    }

    return (
        <FeatureShell featureId="example">
            <ExampleViewPresenter
                items={items}
                newItemName={newItemName}
                isAdding={isAdding}
                onNewItemNameChange={setNewItemName}
                onAddItem={handleAddItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        </FeatureShell>
    )
}
