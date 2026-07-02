"use client"

import * as React from "react"
import { Shield, Users, Activity, Server } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"

import { EnhancedTableHeader } from "../components/EnhancedTableHeader"

const STATS = [
  { label: "Active Workspaces", value: "142",   icon: Server,   tone: "text-blue-500"    },
  { label: "Total Users",       value: "1,840", icon: Users,    tone: "text-emerald-500" },
  { label: "Pending Invites",   value: "23",    icon: Shield,   tone: "text-amber-500"   },
  { label: "System Health",     value: "99.9%", icon: Activity, tone: "text-purple-500"  },
]

const MOCK_USERS = [
  { id: "u_1", name: "Alif Pratama",   email: "alif@kopi-kita.id",  workspaces: 3, role: "Owner",   status: "active"   },
  { id: "u_2", name: "Bella Setiawan", email: "bella@kopi-kita.id", workspaces: 2, role: "Admin",   status: "active"   },
  { id: "u_3", name: "Cahya Nugroho",  email: "cahya@nusantara.id", workspaces: 1, role: "Manager", status: "active"   },
  { id: "u_4", name: "Dwi Rahayu",     email: "dwi@warung.id",      workspaces: 1, role: "Staff",   status: "inactive" },
]

type SortField = "name" | "workspaces" | "role"

function PlatformAdminPreview({ compact }: FeaturePreviewProps) {
  const [sortField, setSortField] = React.useState<SortField>("name")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Platform Admin</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {STATS[0].value} workspaces · {STATS[1].value} users
        </p>
      </div>
    )
  }

  const sorted = [...MOCK_USERS].sort((a, b) => {
    const av = (a as any)[sortField]
    const bv = (b as any)[sortField]
    return sortDir === "asc"
      ? av < bv ? -1 : av > bv ? 1 : 0
      : av > bv ? -1 : av < bv ? 1 : 0
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Platform Administration</h3>
        </div>
        <Badge variant="destructive" className="text-[10px]">Admin only</Badge>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 pt-4 pb-3">
                <Icon className={`h-5 w-5 ${tone}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <EnhancedTableHeader sortable sortDirection={sortField === "name" ? sortDir : null} isActive={sortField === "name"} onSort={() => toggleSort("name")}>
                    User
                  </EnhancedTableHeader>
                  <EnhancedTableHeader sortable sortDirection={sortField === "workspaces" ? sortDir : null} isActive={sortField === "workspaces"} onSort={() => toggleSort("workspaces")}>
                    Workspaces
                  </EnhancedTableHeader>
                  <EnhancedTableHeader sortable sortDirection={sortField === "role" ? sortDir : null} isActive={sortField === "role"} onSort={() => toggleSort("role")}>
                    Role
                  </EnhancedTableHeader>
                  <EnhancedTableHeader>Status</EnhancedTableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.workspaces}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{u.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={u.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {u.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "platform-admin",
  name: "Platform Admin",
  description: "Super-admin panel for managing platform users, workspaces, and configuration.",
  component: PlatformAdminPreview,
  category: "administration",
  tags: ["admin", "system", "platform", "management", "superadmin"],
  mockDataSets: [
    {
      id: "default",
      name: "Platform overview",
      description: "Stats + 4 mock users via real EnhancedTableHeader (sortable columns).",
      data: { stats: STATS, users: MOCK_USERS },
    },
  ],
})
