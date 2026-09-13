"use client";

import { useMemo } from "react";
import { createPermissionsApi, type PermissionsApi } from "../lib/api";
import type { Permission } from "../lib/permissions";

export type { PermissionsApi } from "../lib/api";

export function usePermissions(permissions: readonly Permission[]): PermissionsApi {
  return useMemo(() => createPermissionsApi(permissions), [permissions]);
}
