"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Globe } from "lucide-react"

export function ActivityUsageSettings() {
    const sessions = [
        { id: 1, device: "Chrome on Windows", location: "Jakarta, Indonesia", active: true, icon: Monitor },
        { id: 2, device: "SuperSpace Mobile App", location: "Jakarta, Indonesia", active: false, lastActive: "2 hours ago", icon: Smartphone },
        { id: 3, device: "Safari on iPhone", location: "Bali, Indonesia", active: false, lastActive: "3 days ago", icon: Globe },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Activity & Usage</h3>
                <p className="text-sm text-muted-foreground">Manage your active sessions and login history.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                        You are currently logged in on these devices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex items-start justify-between space-x-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <session.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{session.device}</p>
                                    <p className="text-sm text-muted-foreground">{session.location}</p>
                                    {session.active ? (
                                        <p className="text-xs text-green-600 font-medium mt-1">Active Now</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-1">Last active {session.lastActive}</p>
                                    )}
                                </div>
                            </div>
                            {!session.active && (
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Login History</CardTitle>
                    <CardDescription>Recent security activity on your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        No recent security alerts.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
