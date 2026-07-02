/**
 * RoleUserTree
 *
 * Tree visualization for Roles and Users.
 * - View Mode: "role" (Roles -> Users) or "user" (Users -> Workspaces)
 * - Supports Drag and Drop (Native HTML5)
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    ChevronDown,
    Shield,
    User,
    Building,
    GripVertical,
    MoreVertical,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import {
    useRoles,
    useMembers,
    useUserWorkspaceMatrix,
    useUpdateMemberRole,
} from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
export type TreeViewMode = "role" | "user";

export interface RoleUserTreeProps {
    workspaceId: Id<"workspaces">;
    viewMode: TreeViewMode;
    onItemSelect?: (id: string, type: "role" | "user" | "membership" | "workspace") => void;
    selectedItemId?: string;
    className?: string;
}

interface TreeNode {
    id: string;
    name: string;
    type: "role" | "user" | "workspace";
    parentId?: string;
    children?: TreeNode[];
    data?: any; // Original data object
    icon?: React.ReactNode;
    isDraggable?: boolean;
    isDroppable?: boolean;
}

export function RoleUserTree({
    workspaceId,
    viewMode,
    onItemSelect,
    selectedItemId,
    className,
}: RoleUserTreeProps) {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
    const [draggedItem, setDraggedItem] = React.useState<TreeNode | null>(null);
    const [dropTarget, setDropTarget] = React.useState<string | null>(null);

    // Data
    const roles = useRoles(workspaceId);
    const members = useMembers(workspaceId, { includeInactive: false });
    const matrix = useUserWorkspaceMatrix(workspaceId); // For "user" view

    // Mutations
    const updateMemberRole = useUpdateMemberRole();
    const { toast } = useToast();

    // Build Tree Data
    const treeData = React.useMemo<TreeNode[]>(() => {
        if (viewMode === "role") {
            if (!roles || !members) return [];

            return roles.map((role: any) => ({
                id: role._id,
                name: role.name,
                type: "role",
                isDroppable: true,
                isDraggable: false,
                data: role,
                icon: <Shield className="w-4 h-4 text-indigo-500" />,
                children: members
                    .filter((m: any) => m.role?._id === role._id)
                    .map((m: any) => ({
                        id: m._id, // Membership ID
                        name: m.user?.name || "Unknown",
                        type: "user",
                        parentId: role._id,
                        isDraggable: true,
                        isDroppable: false,
                        data: m,
                        icon: (
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={m.user?.avatarUrl} />
                                <AvatarFallback className="text-[9px]">
                                    {(m.user?.name?.[0] || "?").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ),
                    })),
            }));
        } else {
            // By User Mode
            const matrixData = matrix as any; // matrix is { users, workspaces, matrix }
            if (!matrixData || !matrixData.users) return [];

            return matrixData.users.map((user: any) => ({
                id: user._id,
                name: user.name || "Unknown",
                type: "user",
                isDraggable: false,
                isDroppable: false,
                data: user,
                icon: (
                    <Avatar className="w-5 h-5">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="text-[9px]">
                            {(user.name?.[0] || "?").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                ),
                children: matrixData.workspaces.map((ws: any) => {
                    const access = matrixData.matrix?.[user._id]?.[ws._id];
                    if (!access) return null; // User not in this workspace

                    return {
                        id: `${user._id}-${ws._id}`,
                        name: ws.name,
                        type: "workspace",
                        parentId: user._id,
                        isDraggable: false,
                        isDroppable: false,
                        data: { ...ws, role: access },
                        icon: <Building className="w-4 h-4 text-muted-foreground" />,
                    };
                }).filter(Boolean)
            }));
        }
    }, [viewMode, roles, members, matrix]);

    // Expand Management
    const toggleExpand = (id: string) => {
        const next = new Set(expandedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedItems(next);
    };

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, node: TreeNode) => {
        if (!node.isDraggable) return;
        setDraggedItem(node);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/json", JSON.stringify({ id: node.id, type: node.type, parentId: node.parentId }));
    };

    const handleDragOver = (e: React.DragEvent, node: TreeNode) => {
        e.preventDefault(); // allow drop
        if (!draggedItem) return;

        // Only allow dropping User onto Role (in Role mode)
        if (viewMode === "role") {
            if (node.type === "role" && draggedItem.type === "user" && draggedItem.parentId !== node.id) {
                setDropTarget(node.id);
                e.dataTransfer.dropEffect = "move";
                return;
            }
        }
        setDropTarget(null);
        e.dataTransfer.dropEffect = "none";
    };

    const handleDrop = async (e: React.DragEvent, targetNode: TreeNode) => {
        e.preventDefault();
        if (!draggedItem || !dropTarget) return;

        if (viewMode === "role" && targetNode.id === dropTarget) {
            // Move User to Role
            const memberId = draggedItem.id as Id<"workspaceMemberships">;
            const roleId = targetNode.id as Id<"roles">;
            const oldRoleName = roles?.find((r: any) => r._id === draggedItem.parentId)?.name;

            // We need userId, but draggedItem.data might be the membership doc which has userId
            const membership = draggedItem.data as any;

            try {
                await updateMemberRole({
                    workspaceId,
                    userId: membership.userId,
                    roleId: roleId
                });
                toast({
                    title: "Role Updated",
                    description: `Moved ${draggedItem.name} from ${oldRoleName} to ${targetNode.name}`
                });
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Failed to update role",
                    variant: "destructive"
                });
            }
        }

        setDraggedItem(null);
        setDropTarget(null);
    };

    // Render Node
    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedItems.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedItemId === node.id;
        const isDropTarget = dropTarget === node.id;

        return (
            <div key={node.id} className="select-none">
                <div
                    className={cn(
                        "flex items-center gap-2 py-1.5 pr-2 rounded-md transition-colors cursor-pointer text-sm",
                        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50",
                        isDropTarget && "bg-primary/10 ring-1 ring-primary border-primary",
                        // Indentation
                        level > 0 && "ml-4" // Simple indentation
                    )}
                    style={{ paddingLeft: `${level * 12 + 8}px` }} // Dynamic padding for tree structure
                    draggable={node.isDraggable}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onDragOver={(e) => handleDragOver(e, node)}
                    onDrop={(e) => handleDrop(e, node)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onItemSelect?.(node.id, node.type);
                    }}
                >
                    {/* Draggable Handle */}
                    {node.isDraggable && (
                        <GripVertical className="w-3 h-3 text-muted-foreground opacity-50 mr-1" />
                    )}

                    {/* Expand/Collapse */}
                    {hasChildren ? (
                        <button aria-label="Expand"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.id);
                            }}
                            className="p-0.5 hover:bg-muted rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <span className="w-4" />
                    )}

                    {/* Icon */}
                    <div className="flex-shrink-0">{node.icon}</div>

                    {/* Label */}
                    <div className="flex-1 truncate font-medium">
                        {node.name}
                        {node.type === "workspace" && (
                            <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1">
                                {node.data?.role?.name}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Children */}
                {isExpanded && hasChildren && (
                    <div className="border-l ml-[15px] border-border/40">
                        {node.children!.map((child) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("py-2", className)}>
            {treeData.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 text-center">
                    {viewMode === "role" ? "No roles found" : "No users found"}
                </div>
            )}
            {treeData.map((node) => renderNode(node))}
        </div>
    );
}
