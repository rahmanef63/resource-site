"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function PrivacySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Privacy & Visibility</h3>
                <p className="text-sm text-muted-foreground">Manage who can see your profile and content.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                    <CardDescription>Control who can engage with your profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Private Account</Label>
                            <p className="text-sm text-muted-foreground">Only approved followers can see your activity.</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show Activity Status</Label>
                            <p className="text-sm text-muted-foreground">Allow accounts you follow to see when you were last active.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Search Discovery</CardTitle>
                    <CardDescription>Allow people to find you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Index Search Engines</Label>
                            <p className="text-sm text-muted-foreground">Allow your profile to appear in search engine results (Google, Bing).</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
