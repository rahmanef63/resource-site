"use client"

import * as React from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export interface CodeBlockDialogProps {
  open: boolean
  onClose: () => void
  onInsert: (code: string, language: string) => void
}

export function CodeBlockDialog({ open, onClose, onInsert }: CodeBlockDialogProps) {
  const [code, setCode] = React.useState("")
  const [language, setLanguage] = React.useState("javascript")

  const languages = [
    "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
    "go", "rust", "ruby", "php", "swift", "kotlin", "sql", "html", "css",
    "json", "yaml", "markdown", "bash", "powershell"
  ]

  const handleInsert = () => {
    if (code.trim()) {
      onInsert(code, language)
      setCode("")
      setLanguage("javascript")
      onClose()
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      variant="modal"
      size="md"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Insert Code Block</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Add syntax-highlighted code to your message</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Code</Label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or type your code here..."
              className="w-full h-48 p-3 rounded-md border bg-background font-mono text-sm resize-none"
            />
          </div>
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} disabled={!code.trim()}>Insert Code</Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
