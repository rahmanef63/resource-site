"use client"

import {
    UploadCloud,
    FileText,
    FileSpreadsheet,
    FileCode,
    BookType,
    Trello,
    Workflow,
    Notebook,
    Layout,
    MoreHorizontal,
    Cloud,
    FileIcon,
    Ticket
} from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImportMigrationSettingsProps {
    workspaceId: Id<"workspaces">
}

export function ImportMigrationSettings({ workspaceId }: ImportMigrationSettingsProps) {
    return (
        <ScrollArea className="h-full w-full">
            <div className="flex flex-col max-w-4xl mx-auto p-6 md:p-10 space-y-10">
                {/* Header */}
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">Import or migrate</h2>
                    <p className="text-sm text-muted-foreground">
                        Import data from other apps and files into your workspace <span className="text-primary hover:underline cursor-pointer">Learn more</span>
                    </p>
                </div>

                {/* Convert Zip Dropzone */}
                <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group rounded-xl">
                    <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center space-y-4">
                        <div className="p-4 rounded-full bg-background/50 group-hover:bg-background transition-colors shadow-sm">
                            <UploadCloud className="h-8 w-8 text-primary/80" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium text-base">Convert Zip to pages</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Import a zip file that contains DOCX, CSV, Text, Markdown, HTML and EPUB files to convert to pages
                            </p>
                            <div className="pt-2 text-sm">
                                <span className="text-muted-foreground">Drag and drop a Zip file or </span>
                                <span className="text-primary font-medium hover:underline">Choose file</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                                Maximum zip file size: 5GB
                            </p>
                        </div>
                    </div>
                </Card>

                {/* File-based imports */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">File-based imports</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <ImportOption icon={FileSpreadsheet} label="CSV" />
                        <ImportOption icon={FileText} label="PDF" />
                        <ImportOption icon={BookType} label="Text & Markdown" />
                        <ImportOption icon={FileCode} label="HTML" />
                        <ImportOption icon={FileIcon} label="Word" />
                    </div>
                </div>

                {/* 3rd-party imports */}
                <div className="space-y-3 pb-6">
                    <h3 className="text-sm font-medium text-muted-foreground">3rd-party imports</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <IntegrationCard
                            icon={Layout}
                            label="Asana"
                            subLabel="fulan@gmail.com"
                            connected
                        />
                        <IntegrationCard
                            icon={Cloud}
                            label="Confluence"
                            subLabel="Transfer your team's documentation"
                            iconColor="text-blue-500"
                        />
                        <IntegrationCard
                            icon={Trello}
                            label="Trello"
                            subLabel="Move over your boards and cards"
                            iconColor="text-blue-600"
                        />
                        <IntegrationCard
                            icon={Workflow}
                            label="Workflowy"
                            subLabel="Import your outlines and lists"
                            iconColor="text-blue-400"
                        />
                        <IntegrationCard
                            icon={Notebook}
                            label="Evernote"
                            subLabel="Bring your notes and notebooks"
                            iconColor="text-green-500"
                        />
                        <IntegrationCard
                            icon={Ticket}
                            label="Jira"
                            subLabel="Import your issues and projects"
                            iconColor="text-blue-500"
                        />
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

function ImportOption({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <Button
            variant="outline"
            className="h-14 justify-start px-4 hover:bg-muted/50 transition-colors border-muted-foreground/20 hover:border-primary/20"
        >
            <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{label}</span>
        </Button>
    )
}

function IntegrationCard({
    icon: Icon,
    label,
    subLabel,
    connected = false,
    iconColor = "text-primary/80"
}: {
    icon: any,
    label: string,
    subLabel: string,
    connected?: boolean,
    iconColor?: string
}) {
    return (
        <div className="group flex flex-col p-4 border border-muted-foreground/20 rounded-lg hover:bg-muted/50 transition-all cursor-pointer hover:border-primary/20 bg-card">
            <div className="flex items-start justify-between w-full mb-3">
                <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                    <span className="font-medium">{label}</span>
                </div>
                {connected && (
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {subLabel}
            </p>
        </div>
    )
}
