import { PERMS } from "@/convex/workspace/permissions";

export interface PermissionGroup {
    id: string;
    label: string;
    description: string;
    permissions: PermissionDefinition[];
}

export interface PermissionDefinition {
    id: string;
    label: string;
    description: string;
}

export const UI_PERMISSIONS: PermissionGroup[] = [
    {
        id: "workspace",
        label: "Workspace Management",
        description: "Control general workspace settings and structure",
        permissions: [
            { id: PERMS.MANAGE_WORKSPACE, label: "Manage Workspace", description: "Edit workspace name, icon, and settings" },
            { id: PERMS.VIEW_WORKSPACE, label: "View Workspace", description: "Can access and view the workspace" },
            { id: PERMS.MANAGE_ROLES, label: "Manage Roles", description: "Create, edit, and delete roles" },
            { id: PERMS.MANAGE_MENUS, label: "Manage Menus", description: "Edit sidebar navigation and menus" },
        ]
    },
    {
        id: "members",
        label: "Member Management",
        description: "Control who can access the workspace",
        permissions: [
            { id: PERMS.MANAGE_MEMBERS, label: "Manage Members", description: "Remove members or change their roles" },
            { id: PERMS.INVITE_MEMBERS, label: "Invite Members", description: "Send invitations to new users" },
            { id: PERMS.MANAGE_INVITATIONS, label: "Manage Invitations", description: "View and cancel pending invitations" },
        ]
    },
    {
        id: "documents",
        label: "Documents",
        description: "Access and control over document features",
        permissions: [
            { id: PERMS.DOCUMENTS_CREATE, label: "Create Documents", description: "Create new documents" },
            { id: PERMS.DOCUMENTS_EDIT, label: "Edit Documents", description: "Edit existing documents" },
            { id: PERMS.DOCUMENTS_DELETE, label: "Delete Documents", description: "Delete documents" },
            { id: PERMS.DOCUMENTS_PUBLISH, label: "Publish Documents", description: "Make documents public" },
        ]
    },
    {
        id: "database",
        label: "Database",
        description: "Control database schemas and data",
        permissions: [
            { id: PERMS.DATABASE_READ, label: "Read Data", description: "View database records" },
            { id: PERMS.DATABASE_CREATE, label: "Create Data", description: "Add new records" },
            { id: PERMS.DATABASE_UPDATE, label: "Update Data", description: "Modify existing records" },
            { id: PERMS.DATABASE_DELETE, label: "Delete Data", description: "Remove records" },
            { id: PERMS.DATABASE_MANAGE, label: "Manage Schemas", description: "Edit database structure and fields" },
        ]
    },
    {
        id: "communications",
        label: "Communications",
        description: "Chat and messaging features",
        permissions: [
            { id: PERMS.COMMUNICATIONS_VIEW, label: "View Channels", description: "Access chat channels" },
            { id: PERMS.CREATE_CONVERSATIONS, label: "Create Channels", description: "Create new discussion channels" },
            { id: PERMS.MANAGE_CONVERSATIONS, label: "Manage Channels", description: "Archive or delete channels" },
        ]
    }
];
