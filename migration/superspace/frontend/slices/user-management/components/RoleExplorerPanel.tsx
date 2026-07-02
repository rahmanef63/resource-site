/**
 * RoleExplorerPanel
 *
 * Advanced Role and User management with Tree UI.
 * Layout:
 * - Left: RoleUserTree (Toggle View: By Role / By User)
 * - Center: Inspector (Role Details or User Details with Multi-Workspace Matrix)
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Id } from "@convex/_generated/dataModel";
import { RoleUserTree, type TreeViewMode } from "./RoleUserTree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Building, GitBranch, ArrowLeftRight, ArrowLeft, MoreHorizontal, Edit2, Trash2, Check, Plus, X } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMembers, useRoles, useUserWorkspaceMatrix } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { AccessMatrixView } from "./AccessMatrixView";
import { UI_PERMISSIONS } from "../config/permissions";
import { useCreateRole, useUpdateRole, useDeleteRole } from "../api";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PERMS } from "@/convex/workspace/permissions";

interface RoleExplorerPanelProps {
    workspaceId: Id<"workspaces">;
    className?: string;
}

export function RoleExplorerPanel({
    workspaceId,
    className,
}: RoleExplorerPanelProps) {
    const [viewMode, setViewMode] = React.useState<TreeViewMode>("role");
    const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
    const [selectedItemType, setSelectedItemType] = React.useState<"role" | "user" | "membership" | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editName, setEditName] = React.useState("");
    const [editPermissions, setEditPermissions] = React.useState<Set<string>>(new Set());

    // Create Role State
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [newRoleName, setNewRoleName] = React.useState("");
    const [newRoleLevel, setNewRoleLevel] = React.useState(1);

    const { toast } = useToast();

    // Fetch data for inspector
    const roles = useRoles(workspaceId);
    const members = useMembers(workspaceId);
    const matrix = useUserWorkspaceMatrix(workspaceId);
    const createRole = useCreateRole();
    const updateRole = useUpdateRole();
    const deleteRole = useDeleteRole();

    // Derived selected item data
    const selectedData = React.useMemo(() => {
        if (!selectedItemId) return null;

        if (selectedItemType === "role") {
            return roles?.find((r: any) => r._id === selectedItemId);
        } else if (selectedItemType === "user") {
            // In "user" view, ID is userId. In "role" view, ID might be membershipId, but we probably passed userId if we clicked a user node that represents a user
            // RoleUserTree passes `m._id` (membershipId) for "By Role" and `user._id` (userId) for "By User". 
            // Need uniform handling.
            if (viewMode === "role") {
                // It's a membership ID
                const membership = members?.find((m: any) => m._id === selectedItemId);
                return membership;
            } else {
                // It's a user ID
                const matrixData = matrix as any;
                const user = matrixData?.users?.find((u: any) => u._id === selectedItemId);
                return user;
            }
        }
        return null;
    }, [selectedItemId, selectedItemType, roles, members, matrix, viewMode]);

    // Reset edit state when selection changes
    React.useEffect(() => {
        setIsEditing(false);
    }, [selectedItemId, selectedItemType]);

    // Sync form state with data when NOT editing
    React.useEffect(() => {
        if (!isEditing && selectedItemType === "role" && selectedData) {
            setEditName((selectedData as any).name);
            setEditPermissions(new Set((selectedData as any).permissions || []));
        }
    }, [selectedData, selectedItemType, isEditing]);

    const togglePermission = (permId: string) => {
        if (!isEditing) return;
        const next = new Set(editPermissions);
        if (next.has(permId)) next.delete(permId);
        else next.add(permId);
        setEditPermissions(next);
    };

    const handleCreateRole = async () => {
        try {
            await createRole({
                workspaceId,
                name: newRoleName,
                level: newRoleLevel,
                permissions: [PERMS.VIEW_WORKSPACE], // Default minimum
            });
            toast({ title: "Role created", description: `Role ${newRoleName} created successfully.` });
            setIsCreateOpen(false);
            setNewRoleName("");
            setNewRoleLevel(1);
        } catch (error) {
            toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
        }
    };

    const handleSaveRole = async () => {
        if (!selectedItemId) return;
        try {
            await updateRole({
                roleId: selectedItemId as Id<"roles">,
                name: editName,
                permissions: Array.from(editPermissions),
            });
            toast({ title: "Role updated", description: "Role changes saved." });
            setIsEditing(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedItemId) return;
        if (!confirm("Are you sure? Members with this role must be reassigned first.")) return;
        try {
            await deleteRole({ roleId: selectedItemId as Id<"roles"> });
            toast({ title: "Role deleted", description: "Role deleted successfully." });
            setSelectedItemId(null);
        } catch (error) {
            toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete role", variant: "destructive" });
        }
    };
    return (
        <div className={cn("flex flex-col md:flex-row h-full border rounded-lg overflow-hidden bg-background", className)}>
            {/* Left Panel: Tree */}
            <div className={cn(
                "w-full md:w-1/3 md:min-w-[300px] flex flex-col border-b md:border-b-0 md:border-r bg-muted/10",
                selectedItemId ? "hidden md:flex" : "flex" // On mobile, hide list if item selected
            )}>
                <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2 font-medium text-sm">
                        {viewMode === "role" ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        {viewMode === "role" ? "Roles & Members" : "Users & Access"}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setIsCreateOpen(true)}
                        title="Create Role"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewMode(viewMode === "role" ? "user" : "role")}
                        title="Toggle View Mode"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Toggle Bar */}
                <div className="p-2 border-b bg-muted/20">
                    <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md mb-2">
                        <button
                            onClick={() => setViewMode("role")}
                            className={cn(
                                "text-xs font-medium py-1 rounded transition-all",
                                viewMode === "role" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            By Role
                        </button>
                        <button
                            onClick={() => setViewMode("user")}
                            className={cn(
                                "text-xs font-medium py-1 rounded transition-all",
                                viewMode === "user" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            By User
                        </button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        <RoleUserTree
                            workspaceId={workspaceId}
                            viewMode={viewMode}
                            selectedItemId={selectedItemId || undefined}
                            onItemSelect={(id, type) => {
                                setSelectedItemId(id);
                                setSelectedItemType(type as any); // "membership" maps to "user" logic mostly
                            }}
                        />
                    </div>
                </ScrollArea>
            </div>

            {/* Center Panel: Inspector */}
            <div className={cn(
                "flex-1 flex flex-col bg-background",
                !selectedItemId ? "hidden md:flex" : "flex"
            )}>
                {!selectedItemId ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <GitBranch className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Select an item to view details</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {selectedItemType === "role" && selectedData ? (
                            <div className="p-6 h-full flex flex-col">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="md:hidden mb-4 self-start -ml-2"
                                    onClick={() => setSelectedItemId(null)}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to List
                                </Button>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
                                            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="text-lg font-bold h-9"
                                                />
                                            ) : (
                                                <h2 className="text-2xl font-bold tracking-tight">{(selectedData as any).name}</h2>
                                            )}
                                            <Badge variant="outline" className="mt-1">
                                                Role • Level {(selectedData as any).level}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">

                                        {isEditing ? (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                                    <X className="w-4 h-4 mr-2" /> Cancel
                                                </Button>
                                                <Button size="sm" onClick={handleSaveRole}>
                                                    <Check className="w-4 h-4 mr-2" /> Save
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Role
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-label="More options" variant="ghost" size="sm">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={handleDeleteRole} className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Role
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}

                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="flex-1 overflow-auto min-h-0">
                                    <h3 className="text-sm font-medium mb-4 flex items-center justify-between">
                                        Permissions
                                        {isEditing && (
                                            <span className="text-xs text-muted-foreground font-normal">
                                                Select the capabilities for this role
                                            </span>
                                        )}
                                    </h3>

                                    <div className="space-y-6">
                                        {UI_PERMISSIONS.map((group) => (
                                            <div key={group.id} className="space-y-3">
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {group.label}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {group.permissions.map((perm) => {
                                                        const hasPerm = isEditing
                                                            ? editPermissions.has(perm.id)
                                                            : (selectedData as any).permissions?.includes(perm.id) || (selectedData as any).permissions?.includes("*");

                                                        return (
                                                            <div
                                                                key={perm.id}
                                                                className={cn(
                                                                    "flex items-start gap-3 p-3 rounded-md border text-sm transition-colors",
                                                                    hasPerm ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-transparent",
                                                                    isEditing ? "cursor-pointer hover:bg-muted/20" : "opacity-80"
                                                                )}
                                                                onClick={(e) => {
                                                                    // If view mode, maybe prompt user?
                                                                    if (!isEditing) {
                                                                        toast({ title: "View Only", description: "Click 'Edit Role' to make changes." });
                                                                        return;
                                                                    }
                                                                    // If we clicked the checkbox directly, don't double-toggle (it handles itself)
                                                                    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
                                                                    togglePermission(perm.id);
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={hasPerm}
                                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                                    className={cn("mt-0.5", !isEditing && "opacity-70")}
                                                                    disabled={!isEditing}
                                                                />
                                                                <div className="space-y-0.5">
                                                                    <div className="font-medium">{perm.label}</div>
                                                                    <div className="text-xs text-muted-foreground">{perm.description}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : selectedItemType === "user" || selectedItemType === "membership" ? (
                            // User Details View
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-6 border-b flex flex-col items-start gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="md:hidden self-start -ml-2"
                                        onClick={() => setSelectedItemId(null)}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to List
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                                            <AvatarImage src={(selectedData as any)?.user?.avatarUrl || (selectedData as any)?.avatarUrl} />
                                            <AvatarFallback>{((selectedData as any)?.user?.name?.[0] || (selectedData as any)?.name?.[0] || "?").toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-bold">{(selectedData as any)?.user?.name || (selectedData as any)?.name || "Unknown User"}</h2>
                                            <p className="text-sm text-muted-foreground">{(selectedData as any)?.user?.email || (selectedData as any)?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-auto p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-muted-foreground" />
                                        Workspace Access
                                    </h3>

                                    {/* We can re-use AccessMatrixView logic here but filtered for this user */}
                                    {/* Or just show a list of workspaces this user is part of and their roles there */}

                                    {/* 
                             The 'matrix' data already contains all this info.
                             We should find the row in 'matrix' for this user.
                         */}
                                    {(() => {
                                        // Find user in matrix
                                        const userId = (selectedData as any)?.user?._id || (selectedData as any)?._id;

                                        // matrix is { users, workspaces, matrix: { userId: { wsId: roleInfo } } }
                                        const matrixData = matrix as any;

                                        if (!matrixData || !matrixData.matrix || !matrixData.matrix[userId]) {
                                            return <p className="text-sm text-muted-foreground">No workspace info available.</p>;
                                        }

                                        const userAccess = matrixData.matrix[userId];
                                        // Reconstruct access list
                                        const accessList = Object.entries(userAccess).map(([wsId, roleInfo]: [string, any]) => {
                                            const ws = matrixData.workspaces.find((w: any) => w._id === wsId);
                                            if (!ws) return null;
                                            return {
                                                workspace: ws,
                                                role: {
                                                    _id: roleInfo.roleId,
                                                    name: roleInfo.roleName,
                                                    level: roleInfo.roleLevel
                                                }
                                            };
                                        }).filter(Boolean);

                                        if (accessList.length === 0) return <p className="text-sm text-muted-foreground">No workspace info available.</p>;

                                        return (
                                            <div className="space-y-3">
                                                {accessList.map((acc: any) => (
                                                    <Card key={acc.workspace._id} className="overflow-hidden">
                                                        <div className="flex items-center justify-between p-4 mix-blend-multiply dark:mix-blend-normal bg-muted/30">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    <span className="font-bold text-primary">{acc.workspace.name[0]}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{acc.workspace.name}</div>
                                                                    {/* We don't have joinedAt in the simplified matrix, can omit or fetch if critical */}
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                style={{
                                                                    backgroundColor: (acc.role?.color ?? "#6366f1") + "20",
                                                                    borderColor: acc.role?.color ?? "#6366f1",
                                                                    color: acc.role?.color ?? "#6366f1",
                                                                }}
                                                            >
                                                                {acc.role?.name || "Unknown Role"}
                                                            </Badge>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Create Role Dialog */}
            <ResponsiveDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} variant="modal" size="sm">
                <ResponsiveDialog.Header>
                    <ResponsiveDialog.Title>Create New Role</ResponsiveDialog.Title>
                    <ResponsiveDialog.Description>Define a new role and its permissions.</ResponsiveDialog.Description>
                </ResponsiveDialog.Header>
                <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input
                                placeholder="e.g. Editor"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Level (0-99)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={99}
                                value={newRoleLevel}
                                onChange={(e) => setNewRoleLevel(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">Higher levels have more authority in hierarchy logic.</p>
                        </div>
                    </div>
                </ResponsiveDialog.Body>
                <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                    <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateRole} disabled={!newRoleName}>Create Role</Button>
                </ResponsiveDialog.Footer>
            </ResponsiveDialog>
        </div >
    );
}
