"use client"

import type { Id } from "@convex/_generated/dataModel"
import { CrmView } from "./views/CrmView"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CrmPageProps {
    workspaceId?: Id<"workspaces"> | null
}

export default function CrmPage({ workspaceId }: CrmPageProps) {
    if (!workspaceId) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No workspace selected. Please select a workspace to access CRM.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return <CrmView workspaceId={workspaceId} />
}
