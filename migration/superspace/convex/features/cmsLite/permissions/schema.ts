import type { RoleTemplate } from "../../../workspace/roles.config";
import { CMS_ROLE_PERMISSIONS } from "../../../workspace/roles.config";

export const ROLE_PERMISSIONS = CMS_ROLE_PERMISSIONS;

export type RoleName = RoleTemplate["slug"];
