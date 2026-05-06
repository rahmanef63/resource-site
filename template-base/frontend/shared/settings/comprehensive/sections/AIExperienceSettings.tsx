"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BrainCircuit, Sparkles, Zap } from "lucide-react"

export function AIExperienceSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">AI Experience</h3>
                <p className="text-sm text-muted-foreground">Customize how SuperSpace AI assists you.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assistance Level</CardTitle>
                    <CardDescription>Choose how proactive the AI should be.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <RadioGroup defaultValue="standard">
                        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <RadioGroupItem value="minimal" id="minimal" className="mt-1" />
                            <div className="grid gap-1.5">
                                <Label htmlFor="minimal" className="font-medium flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                    Minimal
                                </Label>
                                <p className="text-sm text-muted-foreground">Only responds when directly asked. No autonomous suggestions.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-accent/10 border-primary/20 hover:bg-accent/20 cursor-pointer transition-colors">
                            <RadioGroupItem value="standard" id="standard" className="mt-1" />
                            <div className="grid gap-1.5">
                                <Label htmlFor="standard" className="font-medium flex items-center gap-2">
                                    <BrainCircuit className="h-4 w-4 text-primary" />
                                    Standard (Recommended)
                                </Label>
                                <p className="text-sm text-muted-foreground">Balanced assistance with smart contextual suggestions.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <RadioGroupItem value="proactive" id="proactive" className="mt-1" />
                            <div className="grid gap-1.5">
                                <Label htmlFor="proactive" className="font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                    Proactive
                                </Label>
                                <p className="text-sm text-muted-foreground">Actively looks for optimizations and anticipates your needs.</p>
                            </div>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Memory</CardTitle>
                    <CardDescription>Allow AI to remember context across sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Workspace Memory</Label>
                            <p className="text-sm text-muted-foreground">Remember project details and team preferences.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Personal Preferences</Label>
                            <p className="text-sm text-muted-foreground">Remember your writing style and formatting choices.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
