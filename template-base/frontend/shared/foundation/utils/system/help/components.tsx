"use client"

import * as React from "react"
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  Search,
  ChevronRight,
  Headphones,
  Mail,
  Phone,
  MessagesSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface HelpLink {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
}

export interface HelpDropdownProps {
  links?: HelpLink[]
  onDocumentation?: () => void
  onTutorials?: () => void
  onLiveChat?: () => void
  onEmail?: () => void
  className?: string
}

const defaultLinks: HelpLink[] = [
  {
    id: "docs",
    label: "Documentation",
    description: "Learn how to use the app",
    icon: BookOpen,
  },
  {
    id: "tutorials",
    label: "Video Tutorials",
    description: "Step-by-step guides",
    icon: Video,
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Frequently asked questions",
    icon: FileText,
  },
  {
    id: "live-chat",
    label: "Live Chat",
    description: "Talk to our support team",
    icon: MessageCircle,
  },
]

/**
 * Help Button with Dropdown
 */
export function HelpDropdown({
  links = defaultLinks,
  onDocumentation,
  onTutorials,
  onLiveChat,
  onEmail,
  className,
}: HelpDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => {
          const Icon = link.icon ?? HelpCircle
          return (
            <DropdownMenuItem
              key={link.id}
              onClick={link.onClick}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{link.label}</span>
                {link.description && (
                  <span className="text-xs text-muted-foreground">
                    {link.description}
                  </span>
                )}
              </div>
              {link.href && <ExternalLink className="ml-auto h-3 w-3" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Help Center Dialog
 */
export function HelpCenterDialog({
  trigger,
  className,
}: {
  trigger?: React.ReactNode
  className?: string
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [open, setOpen] = useState(false)

  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      articles: [
        "Quick Start Guide",
        "Setting up your workspace",
        "Inviting team members",
      ],
    },
    {
      title: "Features",
      icon: FileText,
      articles: [
        "Managing projects",
        "Using the dashboard",
        "Customizing settings",
      ],
    },
    {
      title: "Troubleshooting",
      icon: HelpCircle,
      articles: [
        "Common issues",
        "Error messages",
        "Performance tips",
      ],
    },
  ]

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button variant="outline" className={className} onClick={() => setOpen(true)}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help Center
        </Button>
      )}
      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="lg">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Help Center</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Find answers and learn how to use the app
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="grid gap-4 mt-4">
          {helpCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ul className="space-y-1">
                    {category.articles.map((article) => (
                      <li key={article}>
                        <button className="flex w-full items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {article}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
          </div>
        </ResponsiveDialog.Body>
      </ResponsiveDialog>
    </>
  )
}

/**
 * Contact Support Card
 */
export function ContactSupportCard({ className }: { className?: string }) {
  const contactMethods = [
    {
      icon: MessagesSquare,
      label: "Live Chat",
      description: "Chat with our support team",
      availability: "Available 9AM - 6PM",
      action: "Start Chat",
    },
    {
      icon: Mail,
      label: "Email Support",
      description: "Get help via email",
      availability: "Response within 24 hours",
      action: "Send Email",
    },
    {
      icon: Phone,
      label: "Phone Support",
      description: "Talk to a human",
      availability: "Premium plan only",
      action: "Call Now",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          Contact Support
        </CardTitle>
        <CardDescription>
          Choose your preferred way to get help
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {contactMethods.map((method) => {
          const Icon = method.icon
          return (
            <div
              key={method.label}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {method.availability}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {method.action}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/**
 * Quick Help Widget (Floating button)
 */
export function QuickHelpWidget({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {isOpen && (
        <Card className="mb-2 w-72 animate-in slide-in-from-bottom-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Video className="mr-2 h-4 w-4" />
              Watch Tutorials
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Support
            </Button>
          </CardContent>
        </Card>
      )}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}
