/**
 * MembersListPanel
 *
 * Simple unified list of all workspace members.
 * Features:
 * - List view with Avatar, Name, Email, Role, Joined Date
 * - Search and Role Filter
 * - Invite Member Action
 * - Sorting by Name, Role, Date
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    MoreVertical,
    UserPlus,
    Filter,
    Mail,
    Shield,
    Trash2,
    Calendar,
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Send,
    X
} from "lucide-react";
import { format } from "date-fns";
import type { Id } from "@convex/_generated/dataModel";
import { useMembers, useRoles, useRemoveMember, useUpdateMemberRole, useWorkspaceInvitations, useCancelInvitation, useResendInvitation, useContactsForQuickInvite, useWorkspaceTeams } from "../api";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { QuickInvitePanel } from "./QuickInvitePanel";

interface MembersListPanelProps {
    workspaceId: Id<"workspaces">;
    className?: string;
}

type SortField = "name" | "role" | "joined";
type SortDirection = "asc" | "desc";

export function MembersListPanel({ workspaceId, className }: MembersListPanelProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState<string | "all">("all");
    const [isInviteOpen, setIsInviteOpen] = React.useState(false);
    const [sortField, setSortField] = React.useState<SortField>("name");
    const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
    const [showPending, setShowPending] = React.useState(true);

    // Data Hooks
    // Cast to any to handle enriched return type not yet in generated types
    const membersRaw = useMembers(workspaceId, { includeInactive: false });

    interface EnrichedMember {
        _id: Id<"workspaceMemberships">;
        _creationTime: number;
        userId: Id<"users">;
        roleId: Id<"roles">;
        workspaceId: Id<"workspaces">;
        status: string; // "active" | "inactive" | "invited"
        user?: {
            _id: Id<"users">;
            name?: string;
            email?: string;
            avatarUrl?: string;
        };
        role?: {
            _id: Id<"roles">;
            name: string;
            color?: string;
            level?: number;
        };
    }

    const members = membersRaw as unknown as EnrichedMember[] | undefined;
    const roles = useRoles(workspaceId);
    const contactsForInvite = useContactsForQuickInvite(workspaceId);
    const teams = useWorkspaceTeams(workspaceId);
    const removeMember = useRemoveMember();
    const updateMemberRole = useUpdateMemberRole();
    const { toast } = useToast();

    // Invitation Hooks
    const pendingInvitations = useWorkspaceInvitations(workspaceId, "pending");
    const cancelInvitation = useCancelInvitation();
    const resendInvitation = useResendInvitation();

    // Derived State
    const filteredMembers = React.useMemo(() => {
        if (!members) return [];
        let result = [...members]; // Create copy for sorting

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (m) =>
                    m.user?.name?.toLowerCase().includes(query) ||
                    m.user?.email?.toLowerCase().includes(query)
            );
        }

        // Filter by role
        if (roleFilter !== "all") {
            result = result.filter((m) => m.role?._id === roleFilter);
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === "name") {
                const na = a.user?.name || "";
                const nb = b.user?.name || "";
                cmp = na.localeCompare(nb);
            } else if (sortField === "role") {
                const ra = a.role?.name || "";
                const rb = b.role?.name || "";
                cmp = ra.localeCompare(rb);
            } else if (sortField === "joined") {
                const da = a._creationTime || 0;
                const db = b._creationTime || 0;
                cmp = da - db;
            }
            return sortDirection === "asc" ? cmp : -cmp;
        });

        return result;
    }, [members, searchQuery, roleFilter, sortField, sortDirection]);

    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleRemoveMember = async (userId: Id<"users">, memberId: Id<"workspaceMemberships">) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await removeMember({ workspaceId, userId });
            toast({ title: "Member removed", description: "The user has been removed from the workspace." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove member.",
                variant: "destructive",
            });
        }
    };

    const handleMemberRoleUpdate = async (userId: Id<"users">, roleId: Id<"roles">) => {
        try {
            await updateMemberRole({
                workspaceId,
                userId,
                roleId,
            });
            toast({ title: "Role updated", description: "Member role has been updated." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update role.",
                variant: "destructive",
            });
        }
    };

    const handleCancelInvitation = async (invitationId: Id<"invitations">) => {
        if (!confirm("Are you sure you want to cancel this invitation?")) return;
        try {
            await cancelInvitation({ invitationId });
            toast({ title: "Invitation cancelled", description: "The invitation has been cancelled." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to cancel invitation.",
                variant: "destructive",
            });
        }
    };

    const handleResendInvitation = async (invitationId: Id<"invitations">) => {
        try {
            await resendInvitation({ invitationId });
            toast({ title: "Invitation resent", description: "Values token refreshed and date extended." });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to resend invitation.",
                variant: "destructive",
            });
        }
    };

    const getInitials = (name?: string) => {
        return (name || "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!members || !roles) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
        return sortDirection === "asc" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const inviteDescription =
        "Invite a single contact, a workspace hierarchy, or a saved team without leaving member management.";

    return (
        <div className={cn("flex flex-col h-full space-y-4", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            className="pl-8 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <Filter className="w-3.5 h-3.5" />
                                {roleFilter === "all"
                                    ? "All Roles"
                                    : roles.find((r: any) => r._id === roleFilter)?.name || "Role"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                                All Roles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {roles.map((role: any) => (
                                <DropdownMenuItem
                                    key={role._id}
                                    onClick={() => setRoleFilter(role._id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: role.color ?? "#6366f1" }}
                                        />
                                        {role.name}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => setIsInviteOpen(true)}
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </Button>
                <ResponsiveDialog
                    open={isInviteOpen}
                    onOpenChange={setIsInviteOpen}
                    variant="modal"
                    size="full"
                    contentClassName="sm:max-w-[1100px]"
                >
                    <ResponsiveDialog.Header>
                        <ResponsiveDialog.Title>Invite to Workspace</ResponsiveDialog.Title>
                        <ResponsiveDialog.Description>{inviteDescription}</ResponsiveDialog.Description>
                    </ResponsiveDialog.Header>
                    <ResponsiveDialog.Body className="p-0">
                        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                            <QuickInvitePanel
                                workspaceId={workspaceId}
                                Contacts={contactsForInvite ?? []}
                                teams={teams ?? []}
                            />
                        </div>
                    </ResponsiveDialog.Body>
                </ResponsiveDialog>
            </div>

            {/* List */}
            <div className="flex-1 border rounded-md bg-card overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/50">
                                <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleSort("name")}>
                                    <div className="flex items-center">Member <SortIcon field="name" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                                    <div className="flex items-center">Role <SortIcon field="role" /></div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("joined")}>
                                    <div className="flex items-center">Joined <SortIcon field="joined" /></div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.length === 0 && (!pendingInvitations?.length) ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member._id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.user?.avatarUrl} />
                                                    <AvatarFallback>{getInitials(member.user?.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {member.user?.name || "Unknown User"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                                                        {member.user?.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="bg-opacity-10 border-opacity-20 flex w-fit items-center gap-1.5"
                                                style={{
                                                    backgroundColor: (member.role?.color ?? "#6366f1") + "20",
                                                    borderColor: member.role?.color ?? "#6366f1",
                                                    color: member.role?.color ?? "#6366f1",
                                                }}
                                            >
                                                <Shield className="w-3 h-3" />
                                                {member.role?.name || "No Role"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                {member._creationTime
                                                    ? format(new Date(member._creationTime), "MMM d, yyyy")
                                                    : "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-label="More options" variant="ghost" size="icon" className="h-8 w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => window.location.href = `mailto:${member.user?.email}`}
                                                    >
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Email member
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="focus:bg-transparent">
                                                        <span className="text-xs text-muted-foreground font-medium mb-1 ml-1">Change Role</span>
                                                    </DropdownMenuItem>
                                                    {roles?.map((r: any) => (
                                                        <DropdownMenuItem
                                                            key={r._id}
                                                            onClick={() => handleMemberRoleUpdate(member.user!._id, r._id)}
                                                            disabled={member.role?._id === r._id}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: r.color ?? "#6366f1" }}
                                                                />
                                                                {r.name}
                                                                {member.role?._id === r._id && <span className="ml-auto text-xs opacity-50">(Current)</span>}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleRemoveMember(member.user!._id, member._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove from workspace
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}

                            {/* Pending Invitations Section */}
                            {pendingInvitations && pendingInvitations.length > 0 && (
                                <>
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={4} className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            Pending Invitations ({pendingInvitations.length})
                                        </TableCell>
                                    </TableRow>
                                    {pendingInvitations.map((inv: any) => (
                                        <TableRow key={inv._id} className="group bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-dashed">
                                                        <Mail className="h-4 w-4 text-muted-foreground/50" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-foreground/80 italic">
                                                            {inv.inviteeEmail}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Invitation pending
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {inv.roleId && (
                                                    <Badge variant="outline" className="opacity-70">
                                                        {roles.find((r: any) => r._id === inv.roleId)?.name ?? "Role"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                {format(new Date(inv._creationTime), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-label="More options" variant="ghost" size="icon" className="h-8 w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleResendInvitation(inv._id)}>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            Resend Invitation
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleCancelInvitation(inv._id)}
                                                            className="text-destructive"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Cancel Invitation
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
