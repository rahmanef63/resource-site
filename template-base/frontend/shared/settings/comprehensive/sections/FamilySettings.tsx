"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Users } from "lucide-react"

export function FamilySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Family Center</h3>
                <p className="text-sm text-muted-foreground">Manage family supervision and safety tools.</p>
            </div>

            <Card className="bg-muted/20 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        <CardTitle>Supervision Tools</CardTitle>
                    </div>
                    <CardDescription>
                        SuperSpace provides tools for parents and guardians to help teens have a safe experience.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Setup Supervision</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Family Group</CardTitle>
                    </div>
                    <CardDescription>Manage your family details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">You are not part of any family group.</p>
                    <Button variant="outline">Create Family Group</Button>
                </CardContent>
            </Card>
        </div>
    )
}
