"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, MessageCircle, FileText, Bug } from "lucide-react"

/**
 * Help Settings - Help and support resources
 */
export function HelpSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>
            Get help and find answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Documentation
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Support
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-2">
            <Bug className="h-4 w-4" />
            Report a Bug
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Application information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Build</span>
            <span>2024.01.15</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Environment</span>
            <span>Production</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
          <CardDescription>
            Terms and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="link" className="h-auto p-0 text-sm">
            Terms of Service
          </Button>
          <br />
          <Button variant="link" className="h-auto p-0 text-sm">
            Privacy Policy
          </Button>
          <br />
          <Button variant="link" className="h-auto p-0 text-sm">
            Cookie Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
