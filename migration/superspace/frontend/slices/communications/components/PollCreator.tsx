"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export interface PollCreatorProps {
  open: boolean
  onClose: () => void
  onCreatePoll: (question: string, options: string[]) => void
}

export function PollCreator({ open, onClose, onCreatePoll }: PollCreatorProps) {
  const [question, setQuestion] = React.useState("")
  const [options, setOptions] = React.useState(["", ""])
  const [allowMultiple, setAllowMultiple] = React.useState(false)
  const [isAnonymous, setIsAnonymous] = React.useState(false)

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = () => {
    const validOptions = options.filter(o => o.trim())
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll(question, validOptions)
      setQuestion("")
      setOptions(["", ""])
      setAllowMultiple(false)
      setIsAnonymous(false)
      onClose()
    }
  }

  const validOptionsCount = options.filter(o => o.trim()).length
  const canSubmit = question.trim() && validOptionsCount >= 2

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      variant="modal"
      size="md"
    >
      <ResponsiveDialog.Header className="border-0 bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          </div>
          <div>
            <ResponsiveDialog.Title className="text-lg font-semibold text-white m-0">Create a Poll</ResponsiveDialog.Title>
            <ResponsiveDialog.Description className="text-white/80 text-sm mt-1">
              Gather feedback from your team
            </ResponsiveDialog.Description>
          </div>
        </div>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {/* Question Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>Your Question</span>
              <span className="text-xs text-muted-foreground">(required)</span>
            </Label>
            <div className="relative">
              <textarea
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none text-sm placeholder:text-muted-foreground"
                maxLength={300}
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {question.length}/300
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                Options
                <span className="text-xs text-muted-foreground">({validOptionsCount} of {options.length})</span>
              </span>
              <span className="text-xs text-muted-foreground">Min 2, Max 10</span>
            </Label>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 animate-in slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="pr-10 h-10 rounded-lg border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      maxLength={100}
                    />
                    {option.trim() && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {options.length > 2 && (
                    <Button aria-label="Close"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full h-10 border-dashed border-2 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
                Add Another Option
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className="pt-2 border-t border-border">
            <Label className="text-sm font-medium mb-3 block">Poll Settings</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAllowMultiple(!allowMultiple)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  allowMultiple
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  allowMultiple ? "bg-violet-500/20 text-violet-600" : "bg-muted text-muted-foreground"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Multiple Choice</p>
                  <p className="text-xs text-muted-foreground">Allow multiple selections</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  isAnonymous
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  isAnonymous ? "bg-violet-500/20 text-violet-600" : "bg-muted text-muted-foreground"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Anonymous</p>
                  <p className="text-xs text-muted-foreground">Hide voter identities</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="bg-muted/30 sm:justify-between flex-col-reverse sm:flex-row items-stretch sm:items-center">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          {canSubmit ? (
            <span className="text-green-600 inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ready to create
            </span>
          ) : (
            "Add a question and at least 2 options"
          )}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-9 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
            Create Poll
          </Button>
        </div>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
