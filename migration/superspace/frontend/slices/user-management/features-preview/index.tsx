"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import type { Id } from "@convex/_generated/dataModel"

import { AccessMatrixView } from "../components/AccessMatrixView"
import type { AccessMatrix } from "../types"

const _userId  = (raw: string) => raw as unknown as Id<"users">
const _wsId    = (raw: string) => raw as unknown as Id<"workspaces">

const MOCK_USERS = [
  { _id: _userId("u_alif"),  name: "Alif Pratama",   email: "alif@kopi-kita.id"   },
  { _id: _userId("u_bella"), name: "Bella Setiawan", email: "bella@kopi-kita.id"  },
  { _id: _userId("u_cahya"), name: "Cahya Nugroho",  email: "cahya@kopi-kita.id"  },
  { _id: _userId("u_dwi"),   name: "Dwi Rahayu",     email: "dwi@kopi-kita.id"    },
]

const MOCK_WORKSPACES = [
  { _id: _wsId("ws_root"), name: "Kopi Kita HQ",        slug: "kopi-kita",       type: "organization", depth: 0 },
  { _id: _wsId("ws_eng"),  name: "Engineering",         slug: "engineering",     type: "organization", depth: 1, parentWorkspaceId: _wsId("ws_root") },
  { _id: _wsId("ws_ops"),  name: "Operations",          slug: "operations",      type: "organization", depth: 1, parentWorkspaceId: _wsId("ws_root") },
]

const MOCK_MATRIX: AccessMatrix = {
  users: MOCK_USERS,
  workspaces: MOCK_WORKSPACES,
  matrix: {
    [_userId("u_alif")]:  { [_wsId("ws_root")]: { roleId: "r_owner",   roleName: "Owner",   roleLevel: 0  } },
    [_userId("u_bella")]: { [_wsId("ws_root")]: { roleId: "r_admin",   roleName: "Admin",   roleLevel: 10 }, [_wsId("ws_ops")]: { roleId: "r_manager", roleName: "Manager", roleLevel: 30 } },
    [_userId("u_cahya")]: { [_wsId("ws_eng")]:  { roleId: "r_manager", roleName: "Manager", roleLevel: 30 } },
    [_userId("u_dwi")]:   { [_wsId("ws_ops")]:  { roleId: "r_staff",   roleName: "Staff",   roleLevel: 50 } },
  },
}

function UserManagementPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_USERS.length} members · {MOCK_WORKSPACES.length} workspaces · 4 role levels
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b bg-muted/20 px-4 py-3">
        <h3 className="text-base font-semibold">Access matrix</h3>
        <p className="text-xs text-muted-foreground">
          Who has what role in which workspace — live filterable view via real {`<AccessMatrixView>`}.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AccessMatrixView
          workspaceId={_wsId("ws_root")}
          matrix={MOCK_MATRIX}
        />
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "user-management",
  name: "User Management",
  description: "Members, roles, teams, and cross-workspace access matrix.",
  component: UserManagementPreview,
  category: "administration",
  tags: ["users", "members", "roles", "rbac", "teams"],
  mockDataSets: [
    {
      id: "default",
      name: "Multi-workspace org",
      description: "4 mock users × 3 workspaces with mixed Owner/Admin/Manager/Staff roles.",
      data: { matrix: MOCK_MATRIX },
    },
  ],
})
