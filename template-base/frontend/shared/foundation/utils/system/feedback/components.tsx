"use client"

import * as React from "react"
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  Bug,
  Lightbulb,
  History,
  ExternalLink,
  Check,
  Rocket,
  Zap,
  Shield,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type FeedbackType = "bug" | "feature" | "improvement" | "other"

export interface FeedbackFormData {
  type: FeedbackType
  message: string
  rating?: number
}

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  description?: string
  type: "feature" | "improvement" | "fix" | "breaking"
  items?: string[]
}

export interface FeedbackDialogProps {
  onSubmit?: (data: FeedbackFormData) => void
  trigger?: React.ReactNode
  className?: string
}

const feedbackTypes = [
  { value: "bug", label: "Bug Report", icon: Bug, description: "Something isn't working" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, description: "I have an idea" },
  { value: "improvement", label: "Improvement", icon: Sparkles, description: "Make something better" },
  { value: "other", label: "Other", icon: MessageSquare, description: "General feedback" },
]

/**
 * Feedback Dialog
 */
export function FeedbackDialog({
  onSubmit,
  trigger,
  className,
}: FeedbackDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<FeedbackType>("feature")
  const [message, setMessage] = React.useState("")
  const [rating, setRating] = React.useState<number | undefined>()
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = () => {
    onSubmit?.({ type, message, rating })
    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setMessage("")
      setRating(undefined)
    }, 2000)
  }

  const triggerEl = trigger ?? (
    <Button variant="outline" className={className} onClick={() => setOpen(true)}>
      <MessageSquare className="mr-2 h-4 w-4" />
      Feedback
    </Button>
  )

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        triggerEl
      )}
      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        {submitted ? (
          <>
            <ResponsiveDialog.Header className="sr-only">
              <ResponsiveDialog.Title>Feedback submitted</ResponsiveDialog.Title>
              <ResponsiveDialog.Description>Thank you for sharing your feedback.</ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body className="px-4 py-8 sm:px-6">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Thank you!</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            </ResponsiveDialog.Body>
          </>
        ) : (
          <>
            <ResponsiveDialog.Header>
              <ResponsiveDialog.Title>Send Feedback</ResponsiveDialog.Title>
              <ResponsiveDialog.Description>
                Help us improve by sharing your thoughts
              </ResponsiveDialog.Description>
            </ResponsiveDialog.Header>

            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
              <div className="space-y-4">
              {/* Feedback Type */}
              <div className="space-y-2">
                <Label>What type of feedback?</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as FeedbackType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {feedbackTypes.map(({ value, label, icon: Icon }) => (
                    <div key={value}>
                      <RadioGroupItem
                        value={value}
                        id={value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={value}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all",
                          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                          "hover:border-primary/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Your feedback</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what's on your mind..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>How satisfied are you?</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          rating && star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </ResponsiveDialog.Body>

            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!message.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
            </ResponsiveDialog.Footer>
          </>
        )}
      </ResponsiveDialog>
    </>
  )
}

/**
 * Quick Rating Widget
 */
export function QuickRating({
  onRate,
  className,
}: {
  onRate?: (positive: boolean) => void
  className?: string
}) {
  const [rated, setRated] = React.useState<boolean | null>(null)

  const handleRate = (positive: boolean) => {
    setRated(positive)
    onRate?.(positive)
  }

  if (rated !== null) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Check className="h-4 w-4 text-green-500" />
        Thanks for your feedback!
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRate(true)}
        className="h-8"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRate(false)}
        className="h-8"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

const sampleChangelog: ChangelogEntry[] = [
  {
    id: "1",
    version: "2.1.0",
    date: "2025-12-09",
    title: "System Utilities Update",
    type: "feature",
    description: "Added new system utility components",
    items: [
      "Added Theme Toggle utility",
      "Added Profile & Account management",
      "Added Help Center components",
      "Added Command Menu (Cmd+K)",
    ],
  },
  {
    id: "2",
    version: "2.0.0",
    date: "2025-12-01",
    title: "Major Release",
    type: "breaking",
    description: "Complete redesign with new architecture",
    items: [
      "New Dynamic Menu System",
      "Workspace templates",
      "Improved performance",
    ],
  },
]

/**
 * Changelog Dialog
 */
export function ChangelogDialog({
  changelog = sampleChangelog,
  trigger,
  className,
}: {
  changelog?: ChangelogEntry[]
  trigger?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const typeStyles = {
    feature: { icon: Rocket, color: "bg-blue-500" },
    improvement: { icon: Zap, color: "bg-green-500" },
    fix: { icon: Shield, color: "bg-orange-500" },
    breaking: { icon: Sparkles, color: "bg-purple-500" },
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button variant="outline" className={className} onClick={() => setOpen(true)}>
          <History className="mr-2 h-4 w-4" />
          Changelog
        </Button>
      )}
      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title className="flex items-center gap-2">
            <History className="h-5 w-5" />
            What&apos;s New
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Latest updates and improvements
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
            {changelog.map((entry) => {
              const { icon: Icon, color } = typeStyles[entry.type]
              return (
                <div key={entry.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-0 top-1 h-3 w-3 rounded-full",
                      color
                    )}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.version}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold">{entry.title}</h4>
                    
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                    
                    {entry.items && (
                      <ul className="space-y-1">
                        {entry.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="h-3 w-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </ScrollArea>
        </ResponsiveDialog.Body>
      </ResponsiveDialog>
    </>
  )
}

/**
 * Changelog Badge (for notification of new updates)
 */
export function ChangelogBadge({
  hasUpdates = false,
  onClick,
  className,
}: {
  hasUpdates?: boolean
  onClick?: () => void
  className?: string
}) {
  if (!hasUpdates) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      New
    </button>
  )
}
