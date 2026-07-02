"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import {
  Search,
  Filter,
  MoreHorizontal,
  Loader2,
  Mail,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Eye,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

const STATUS_CONFIG: Record<InvitationStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  declined: { label: "Declined", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  expired: { label: "Expired", icon: AlertTriangle, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
};

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvitationDetailsDialog({ 
  invitation, 
  isOpen, 
  onClose,
}: { 
  invitation: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!invitation) return null;

  const statusConfig = STATUS_CONFIG[invitation.status as InvitationStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Invitation Details</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          View detailed information about this invitation
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1", statusConfig.color)}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline">{invitation.type}</Badge>
          </div>

          {/* Invitee */}
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Invitee Email</span>
            <p className="font-medium">{invitation.inviteeEmail}</p>
          </div>

          {/* Inviter */}
          <div className="grid gap-1">
            <span className="text-sm text-muted-foreground">Invited By</span>
            <p>{invitation.inviter?.name || invitation.inviter?.email || "Unknown"}</p>
          </div>

          {/* Workspace */}
          {invitation.workspace && (
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Workspace</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{invitation.workspace.name}</span>
                <Badge variant="outline" className="text-xs">{invitation.workspace.type}</Badge>
              </div>
            </div>
          )}

          {/* Role */}
          {invitation.role && (
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge
                variant="outline"
                style={{ borderColor: invitation.role.color, color: invitation.role.color }}
              >
                {invitation.role.name}
              </Badge>
            </div>
          )}

          {/* Message */}
          {invitation.message && (
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Message</span>
              <p className="text-sm bg-muted p-2 rounded">{invitation.message}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Created</span>
              <p className="text-sm">
                {invitation._creationTime 
                  ? formatDistanceToNow(invitation._creationTime, { addSuffix: true }) 
                  : "Unknown"}
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Expires</span>
              <p className="text-sm">
                {invitation.expiresAt 
                  ? formatDistanceToNow(invitation.expiresAt, { addSuffix: true }) 
                  : "Unknown"}
              </p>
            </div>
          </div>

          {invitation.acceptedAt && (
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Accepted</span>
              <p className="text-sm">
                {formatDistanceToNow(invitation.acceptedAt, { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  );
}

export function PlatformInvitationsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"workspace" | "personal" | "all">("all");
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);

  const invitations = useQuery(api.dev.platformAdmin.listAllInvitations, {
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
  }) as any[] | undefined;

  const filteredInvitations = useMemo(() => {
    if (!invitations) return [];
    
    if (!searchQuery) return invitations;
    
    const query = searchQuery.toLowerCase();
    return invitations.filter((inv: any) =>
      inv.inviteeEmail?.toLowerCase().includes(query) ||
      inv.inviter?.name?.toLowerCase().includes(query) ||
      inv.inviter?.email?.toLowerCase().includes(query) ||
      inv.workspace?.name?.toLowerCase().includes(query)
    );
  }, [invitations, searchQuery]);

  const stats = useMemo(() => {
    if (!invitations) return { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0 };
    return {
      total: invitations.length,
      pending: invitations.filter((i: any) => i.status === "pending").length,
      accepted: invitations.filter((i: any) => i.status === "accepted").length,
      declined: invitations.filter((i: any) => i.status === "declined").length,
      expired: invitations.filter((i: any) => i.status === "expired").length,
    };
  }, [invitations]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={Mail} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="Accepted" value={stats.accepted} icon={CheckCircle} />
        <StatCard title="Declined" value={stats.declined} icon={XCircle} />
        <StatCard title="Expired" value={stats.expired} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Invitations</CardTitle>
              <CardDescription>
                View all invitations across the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button aria-label="Close" variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Table */}
          {invitations === undefined ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading invitations...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invitee</TableHead>
                    <TableHead>Inviter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">No invitations found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvitations.map((inv: any) => {
                      const statusConfig = STATUS_CONFIG[inv.status as InvitationStatus] || STATUS_CONFIG.pending;
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={inv._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{inv.inviteeEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {inv.inviter?.name || inv.inviter?.email || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {inv.type === "workspace" ? (
                                <>
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{inv.workspace?.name || "Unknown"}</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Personal</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("gap-1 text-xs", statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {inv._creationTime 
                              ? formatDistanceToNow(inv._creationTime, { addSuffix: true }) 
                              : "Unknown"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-label="More options" variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedInvitation(inv)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InvitationDetailsDialog
        invitation={selectedInvitation}
        isOpen={!!selectedInvitation}
        onClose={() => setSelectedInvitation(null)}
      />
    </div>
  );
}
