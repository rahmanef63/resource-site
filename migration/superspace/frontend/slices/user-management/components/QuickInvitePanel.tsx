/**
 * QuickInvitePanel
 * 
 * Provides quick invite features:
 * - Invite Contacts to workspace with checkboxes
 * - Invite to hierarchy (workspace + children)
 * - Bulk team invitations
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Users,
  GitBranch,
  Send,
  Check,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Id, Doc } from "@convex/_generated/dataModel";
import type { ContactForQuickInvite, Team, PropagationStrategy } from "../types";
import {
  useBulkInviteContacts,
  useInviteToHierarchy,
  useInviteTeamToWorkspaces,

  useRoles,
  useUserWorkspaceMatrix,
} from "../api";
import { useToast } from "@/hooks/use-toast";

interface QuickInvitePanelProps {
  workspaceId: Id<"workspaces">;
  Contacts: ContactForQuickInvite[];
  teams: Team[];
  className?: string;
}

export function QuickInvitePanel({
  workspaceId,
  Contacts: contacts,
  teams,
  className,
}: QuickInvitePanelProps) {
  // State
  const [mode, setMode] = React.useState<"Contacts" | "hierarchy" | "team">("hierarchy");
  const [hierarchyMode, setHierarchyMode] = React.useState<"all" | "custom">("all");
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = React.useState<Set<string>>(new Set());
  const [selectedContactIds, setSelectedContactIds] = React.useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [hierarchyEmail, setHierarchyEmail] = React.useState("");
  const [propagateToChildren, setPropagateToChildren] = React.useState(true);
  const [propagationStrategy, setPropagationStrategy] = React.useState<PropagationStrategy>("same");
  const [message, setMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Hooks
  const roles = useRoles(workspaceId);
  const matrix = useUserWorkspaceMatrix(workspaceId);
  const bulkInviteContacts = useBulkInviteContacts();
  const inviteToHierarchy = useInviteToHierarchy();
  const inviteTeamToWorkspaces = useInviteTeamToWorkspaces();
  const { toast } = useToast();

  // Filter Contacts
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.email?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Available (non-pending) Contacts
  const availableContacts = filteredContacts.filter((f) => !f.hasPendingInvite);
  const pendingContacts = filteredContacts.filter((f) => f.hasPendingInvite);
  const selectedTeam = teams.find((team) => String(team._id) === selectedTeamId);
  const modeOptions = [
    {
      id: "hierarchy" as const,
      label: "Add Member",
      icon: UserPlus,
      countLabel: `${matrix?.workspaces?.length ?? 0} workspaces`,
    },
    {
      id: "Contacts" as const,
      label: "Contacts",
      icon: Users,
      countLabel: `${availableContacts.length} available`,
    },
    {
      id: "team" as const,
      label: "Team",
      icon: GitBranch,
      countLabel: `${teams.length} saved`,
    },
  ];
  const actionLabel =
    mode === "Contacts"
      ? `Invite ${selectedContactIds.size} Contact${selectedContactIds.size === 1 ? "" : "s"}`
      : mode === "hierarchy"
        ? "Send hierarchy invitation"
        : "Invite entire team";
  const actionDisabled =
    isSubmitting ||
    !selectedRoleId ||
    (mode === "Contacts" && selectedContactIds.size === 0) ||
    (mode === "hierarchy" && !hierarchyEmail) ||
    (mode === "team" && !selectedTeamId);

  const toggleContactSelection = (ContactId: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(ContactId)) {
      newSet.delete(ContactId);
    } else {
      newSet.add(ContactId);
    }
    setSelectedContactIds(newSet);
  };

  const selectAllContacts = () => {
    setSelectedContactIds(new Set(availableContacts.map((f) => String(f._id))));
  };

  const clearSelection = () => {
    setSelectedContactIds(new Set());
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle bulk invite Contacts
  const handleBulkInviteContacts = async () => {
    if (selectedContactIds.size === 0 || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      const result = await bulkInviteContacts({
        workspaceId,
        ContactIds: Array.from(selectedContactIds) as Id<"users">[],
        roleId: selectedRoleId as Id<"roles">,
        message: message || undefined,
      });

      toast({
        title: "Invitations sent",
        description: `Successfully sent ${result.successCount} of ${result.totalInvites} invitations.`,
      });

      setSelectedContactIds(new Set());
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitations",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hierarchy invite
  const handleHierarchyInvite = async () => {
    if (!hierarchyEmail || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      // Prepare specific workspace IDs if in custom mode
      const specificWorkspaceIds = hierarchyMode === "custom"
        ? Array.from(selectedWorkspaceIds) as Id<"workspaces">[]
        : undefined;

      const result = await inviteToHierarchy({
        workspaceId,
        inviteeEmail: hierarchyEmail,
        baseRoleId: selectedRoleId as Id<"roles">,
        propagateToChildren: hierarchyMode === "all" ? propagateToChildren : false,
        propagationStrategy,
        message: message || undefined,
        specificWorkspaceIds,
      });

      toast({
        title: "Hierarchy invitation sent",
        description: `Successfully invited to ${result.successWorkspaces ?? result.successCount} of ${result.totalWorkspaces} workspaces.`,
      });

      setHierarchyEmail("");
      setSelectedWorkspaceIds(new Set());
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send hierarchy invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle team invite
  const handleTeamInvite = async () => {
    if (!selectedTeamId || !selectedRoleId) return;

    setIsSubmitting(true);
    try {
      const result = await inviteTeamToWorkspaces({
        teamId: selectedTeamId as Id<"userTeams">,
        workspaceIds: [workspaceId],
        roleId: selectedRoleId as Id<"roles">,
        message: message || undefined,
      });

      toast({
        title: "Team invited",
        description: `Successfully sent ${result.successCount} of ${result.totalInvites} invitations.`,
      });

      setSelectedTeamId("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="quick-invite-layout"
      className={cn(
        "grid min-h-0 grid-cols-1 gap-4 overflow-x-hidden min-[1100px]:grid-cols-[minmax(0,1fr)_360px]",
        className,
      )}
    >
      <div className="min-w-0 space-y-4 rounded-xl border bg-background p-4 shadow-sm sm:p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-muted/20 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold">{option.label}</span>
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {option.countLabel}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border bg-card/60 p-4">
          <div className="space-y-2">
            <Label>Role to assign</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role: any) => (
                  <SelectItem key={String(role._id)} value={String(role._id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: role.color ?? "#6366f1" }}
                      />
                      <span>{role.name}</span>
                      {role.level !== undefined ? (
                        <span className="text-xs text-muted-foreground">
                          Level {role.level}
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This role will be applied to every invitation sent from the
              current mode.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 p-4">
          {mode === "Contacts" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Invite existing contacts</h3>
                  <p className="text-sm text-muted-foreground">
                    Search your contact network and choose who should receive a
                    workspace invitation.
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {selectedContactIds.size} selected
                </Badge>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts by name or email..."
                    className="h-11 rounded-xl pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={selectAllContacts}>
                    Select all
                  </Button>
                  <Button variant="ghost" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mode === "hierarchy" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold">Invite by workspace hierarchy</h3>
                <p className="text-sm text-muted-foreground">
                  Add one member to the current workspace and optionally extend
                  the invitation into child workspaces.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={hierarchyEmail}
                  onChange={(e) => setHierarchyEmail(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    hierarchyMode === "all"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/10 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={hierarchyMode === "all"}
                      onChange={() => setHierarchyMode("all")}
                      className="accent-primary"
                    />
                    <span className="font-medium">Entire hierarchy</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start from this workspace and optionally propagate downward.
                  </p>
                </label>
                <label
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    hierarchyMode === "custom"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/10 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={hierarchyMode === "custom"}
                      onChange={() => setHierarchyMode("custom")}
                      className="accent-primary"
                    />
                    <span className="font-medium">Select workspaces</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose the exact workspaces that should receive the invite.
                  </p>
                </label>
              </div>

              {hierarchyMode === "all" ? (
                <div className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Label>Propagate to child workspaces</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Invite the user to this workspace and all child
                        workspaces reachable from the hierarchy.
                      </p>
                    </div>
                    <Switch
                      checked={propagateToChildren}
                      onCheckedChange={setPropagateToChildren}
                    />
                  </div>
                  {propagateToChildren ? (
                    <div className="mt-4 space-y-2">
                      <Label>Role propagation strategy</Label>
                      <Select
                        value={propagationStrategy}
                        onValueChange={(value) =>
                          setPropagationStrategy(value as PropagationStrategy)
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="same">
                            Same role in all workspaces
                          </SelectItem>
                          <SelectItem value="decreasing">
                            Decreasing role level in child workspaces
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/10 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <Label>Choose workspaces</Label>
                      <p className="text-sm text-muted-foreground">
                        Pick one or more workspaces from the current hierarchy.
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {selectedWorkspaceIds.size} selected
                    </Badge>
                  </div>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {matrix?.workspaces?.map((ws: Doc<"workspaces">) => (
                      <label
                        key={ws._id}
                        htmlFor={`ws-${ws._id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background/70 p-3"
                      >
                        <Checkbox
                          id={`ws-${ws._id}`}
                          checked={selectedWorkspaceIds.has(ws._id)}
                          onCheckedChange={(checked) => {
                            const next = new Set(selectedWorkspaceIds);
                            if (checked) next.add(ws._id);
                            else next.delete(ws._id);
                            setSelectedWorkspaceIds(next);
                          }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{ws.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ws.slug}
                          </p>
                        </div>
                      </label>
                    ))}
                    {(!matrix?.workspaces || matrix.workspaces.length === 0) ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        No child workspaces found.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "team" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Invite a saved team</h3>
                <p className="text-sm text-muted-foreground">
                  Apply one role and send workspace invitations to every member
                  in a team.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={String(team._id)} value={String(team._id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white"
                            style={{ backgroundColor: team.color ?? "#6366f1" }}
                          >
                            {team.name[0]}
                          </div>
                          <span>{team.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {team.memberCount ?? 0} members
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeam ? (
                <div className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: selectedTeam.color ?? "#6366f1" }}
                    >
                      {selectedTeam.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{selectedTeam.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTeam.memberCount ?? 0} members will receive this
                        invitation.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card/60 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between rounded-xl px-3"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced options
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showAdvanced ? (
            <div className="mt-4 space-y-2">
              <Label>Personal message (optional)</Label>
              <Textarea
                placeholder="Add a personal message to the invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="rounded-xl"
              />
            </div>
          ) : null}
        </div>

        <Button
          className="h-11 w-full gap-2 rounded-xl"
          disabled={actionDisabled}
          onClick={
            mode === "Contacts"
              ? handleBulkInviteContacts
              : mode === "hierarchy"
                ? handleHierarchyInvite
                : handleTeamInvite
          }
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {actionLabel}
        </Button>
      </div>

      <Card
        data-testid="quick-invite-side-rail"
        className="min-w-0 overflow-hidden rounded-xl border bg-muted/20 shadow-sm min-[1100px]:w-[360px]"
      >
        <CardHeader className="space-y-3 border-b bg-background/70 p-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            {mode === "Contacts" ? (
              <>
                <Users className="h-4 w-4" />
                Contact Invitation Queue
              </>
            ) : mode === "hierarchy" ? (
              <>
                <GitBranch className="h-4 w-4" />
                Hierarchy Invitation
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Team Invitation
              </>
            )}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {mode === "Contacts"
              ? "Invite people you already know, keep an eye on pending invitations, and build the workspace from your existing network."
              : mode === "hierarchy"
                ? "Great for parent workspaces that need to onboard someone across several connected workspaces in one pass."
                : "Use a saved team when the same group needs access to the current workspace together."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {mode === "Contacts" ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Available Contacts ({availableContacts.length})
                </h3>
                <Badge variant="secondary">
                  {selectedContactIds.size} selected
                </Badge>
              </div>
              <ScrollArea className="h-[320px] pr-3 min-[1100px]:h-[520px]">
                <div className="space-y-2">
                  {availableContacts.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-background/70 px-4 py-10 text-center text-muted-foreground">
                      <UserPlus className="mx-auto mb-3 h-10 w-10 opacity-50" />
                      <p className="text-sm font-medium">
                        No contacts available to invite
                      </p>
                      <p className="mt-1 text-xs">
                        Everyone is already a member or has a pending invitation.
                      </p>
                    </div>
                  ) : (
                    availableContacts.map((contact) => (
                      <div
                        key={String(contact._id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          selectedContactIds.has(String(contact._id))
                            ? "border-primary bg-primary/10"
                            : "bg-background/70 hover:bg-muted/30"
                        )}
                        onClick={() => toggleContactSelection(String(contact._id))}
                      >
                        <Checkbox
                          checked={selectedContactIds.has(String(contact._id))}
                          onClick={(event) => event.stopPropagation()}
                          onCheckedChange={() =>
                            toggleContactSelection(String(contact._id))
                          }
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {contact.name ?? "Unknown"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {pendingContacts.length > 0 ? (
                    <div className="pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Pending Invitations
                        </p>
                        <Badge variant="outline">{pendingContacts.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {pendingContacts.map((contact) => (
                          <div
                            key={String(contact._id)}
                            className="flex items-center gap-3 rounded-xl border border-dashed bg-background/60 p-3 opacity-70"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contact.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {contact.name ?? "Unknown"}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {contact.email}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </>
          ) : mode === "hierarchy" ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-background/70 p-4">
                <h4 className="mb-3 font-medium">How it works</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>User receives one invitation per target workspace.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>Role propagation can stay equal or step down in children.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>Everything is tracked from a single hierarchy invitation flow.</p>
                  </div>
                </div>
              </div>
              {propagateToChildren && propagationStrategy === "decreasing" ? (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900 dark:bg-orange-950/30">
                  <div className="flex items-start gap-2 text-orange-700 dark:text-orange-400">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">Decreasing role level enabled</p>
                      <p className="mt-1">
                        Child workspaces will receive the closest lower-privilege role available.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-background/70 p-4">
                <h4 className="mb-3 font-medium">What happens next</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>Every selected team member gets a workspace invitation.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>The same role is applied across the whole invite batch.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <p>Members already in the workspace are skipped automatically.</p>
                  </div>
                </div>
              </div>
              {selectedTeam ? (
                <div className="rounded-xl border bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Selected team
                  </p>
                  <p className="mt-2 text-lg font-semibold">{selectedTeam.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedTeam.memberCount ?? 0} members will be processed in
                    the current workspace.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  Pick a team to preview the invite scope here.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuickInvitePanel;
