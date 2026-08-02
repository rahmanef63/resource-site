/**
 * RichText Block
 * 
 * Content editor/viewer using Tiptap.
 */

"use client"

import * as React from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FileText } from "lucide-react"
import { BlockCard } from "../shared"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface RichTextBlockProps {
    content: string
    editable?: boolean
    title?: string
    description?: string
    className?: string
    onUpdate?: (content: string) => void
}

// ============================================================================
// RichText Block
// ============================================================================

export function RichTextBlock({
    content,
    editable = false,
    title,
    description,
    className,
    onUpdate,
}: RichTextBlockProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
            },
        },
    })

    // Update content if it changes externally
    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    return (
        <BlockCard
            header={title ? { title, description, icon: FileText } : undefined}
            className={className}
        >
            <div className="border rounded-md bg-background">
                {editable && (
                    <div className="border-b p-2 flex gap-1 bg-muted/20 text-xs text-muted-foreground">
                        {/* Placeholder for toolbar */}
                        <span>Markdown Supported</span>
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </BlockCard>
    )
}
