/**
 * ============================================================================
 * EXAMPLE FEATURE - page.tsx
 * ============================================================================
 * 
 * This is the main entry point for your feature's UI.
 * It's rendered when users navigate to the feature's path.
 * 
 * KEY PATTERNS:
 * 1. "use client" - Required for interactive components
 * 2. workspaceId prop - Passed by the layout system
 * 3. Guard against missing workspaceId - Show helpful message
 * 4. Delegate to a View component - Keep page.tsx minimal
 * 
 * FILE ORGANIZATION:
 * - page.tsx: Entry point, handles props, guards
 * - views/: Complex view components with business logic
 * - components/: Reusable UI components
 * - hooks/: Custom React hooks
 */

"use client"

import type { Id } from "@convex/_generated/dataModel"
import { ExampleView } from "./views/ExampleView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Lightbulb } from "lucide-react"

/**
 * Props interface for the feature page
 * 
 * workspaceId is provided by the dashboard layout system.
 * It can be undefined if no workspace is selected.
 */
interface ExamplePageProps {
    workspaceId?: Id<"workspaces"> | null
}

/**
 * Main page component for the Example feature
 * 
 * This component:
 * 1. Receives workspaceId from the layout
 * 2. Guards against missing workspace
 * 3. Renders the main view component
 */
export default function ExamplePage({ workspaceId }: ExamplePageProps) {
    // =========================================================================
    // GUARD: No workspace selected
    // =========================================================================
    
    /**
     * Always guard against missing workspaceId
     * This happens when:
     * - User hasn't selected a workspace yet
     * - User navigated directly to the URL
     * - Workspace was deleted
     */
    if (!workspaceId) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Workspace Selected</AlertTitle>
                    <AlertDescription>
                        Please select a workspace to access the Example feature.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // =========================================================================
    // RENDER: Main view
    // =========================================================================
    
    /**
     * Delegate to a View component for the actual UI
     * This keeps page.tsx focused on routing concerns
     */
    return <ExampleView workspaceId={workspaceId} />
}
