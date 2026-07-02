/**
 * TeamListPanel
 * 
 * Displays teams and Contacts list for quick management.
 * Allows creating teams and adding members.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  Search,
  UserPlus,
  MoreHorizontal,
  Crown,
  Trash2,
  Loader2,
} from "lucide-react";
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
import type { Id } from "@convex/_generated/dataModel";
import type { Team, HierarchyMemberOverview, TeamMember } from "../types";
import { useCreateTeam, useContacts, useTeamMembers, useMembers, useAddTeamMember } from "../api";
import { useToast } from "@/hooks/use-toast";

interface TeamListPanelProps {
  workspaceId: Id<"workspaces">;
  teams: Team[];
  overview: HierarchyMemberOverview | null | undefined;
  className?: string;
}

export function TeamListPanel({
  workspaceId,
  teams,
  overview,
  className,
}: TeamListPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTeamId, setSelectedTeamId] = React.useState<Id<"userTeams"> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isAddingMember, setIsAddingMember] = React.useState(false);

  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamDescription, setNewTeamDescription] = React.useState("");
  const [selectedMemberId, setSelectedMemberId] = React.useState<string>("");

  const contacts = useContacts();
  const members = useMembers(workspaceId);
  const teamMembers = useTeamMembers(selectedTeamId ?? undefined);
  const createTeam = useCreateTeam();
  const addTeamMember = useAddTeamMember();
  const { toast } = useToast();

  // Get available members to add (everyone in workspace who is not already in team)
  const availableMembers = React.useMemo(() => {
    if (!members || !teamMembers) return [];
    const teamUserIds = new Set((teamMembers as TeamMember[]).map(m => m.userId));
    return members.filter((m: any) => !teamUserIds.has(m.user?._id as any));
  }, [members, teamMembers]);

  const handleAddMember = async () => {
    if (!selectedTeamId || !selectedMemberId) return;
    try {
      setIsAddingMember(true);
      // Find the user ID from the member ID selection (selectedMemberId might be member doc ID or user ID depending on dropdown)
      // Let's use User ID for the mutation
      const member = members?.find((m: any) => m.user?._id === selectedMemberId);
      if (!member || !member.user) return;

      await addTeamMember({
        teamId: selectedTeamId,
        userId: member.user._id,
      });
      toast({ title: "Member added", description: "User has been added to the team." });
      setIsAddMemberOpen(false);
      setSelectedMemberId("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsAddingMember(false);
    }
  };

  const filteredTeams = React.useMemo(() => {
    if (!searchQuery) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      await createTeam({
        workspaceId,
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });
      toast({
        title: "Team created",
        description: `Team "${newTeamName}" has been created successfully.`,
      });
      setNewTeamName("");
      setNewTeamDescription("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Left: Teams list */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Teams ({teams.length})
          </h3>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create Team
          </Button>
          <ResponsiveDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} variant="modal" size="sm">
            <ResponsiveDialog.Header>
              <ResponsiveDialog.Title>Create New Team</ResponsiveDialog.Title>
              <ResponsiveDialog.Description className="sr-only">Create a new team for workspace members.</ResponsiveDialog.Description>
            </ResponsiveDialog.Header>
            <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Marketing Team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description (optional)</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Describe the team's purpose..."
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </ResponsiveDialog.Body>
            <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
                Create Team
              </Button>
            </ResponsiveDialog.Footer>
          </ResponsiveDialog>
        </div>

        <ResponsiveDialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} variant="modal" size="sm">
          <ResponsiveDialog.Header>
            <ResponsiveDialog.Title>Add Team Member</ResponsiveDialog.Title>
            <ResponsiveDialog.Description className="sr-only">Pick a workspace member to add to this team.</ResponsiveDialog.Description>
          </ResponsiveDialog.Header>
          <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Member</Label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workspace member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((m: any) => (
                      <SelectItem key={m.user?._id} value={m.user?._id as string}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={m.user?.avatarUrl} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(m.user?.name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          {m.user?.name}
                        </div>
                      </SelectItem>
                    ))}
                    {availableMembers.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No available members to add
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ResponsiveDialog.Body>
          <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!selectedMemberId || isAddingMember}>
              {isAddingMember && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </ResponsiveDialog.Footer>
        </ResponsiveDialog>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-3">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No teams yet</p>
                <p className="text-xs">Create a team to group users for batch operations</p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <Card
                  key={String(team._id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTeamId === team._id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedTeamId(team._id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: team.color ?? "#6366f1" }}
                        >
                          {team.icon ?? getInitials(team.name)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.memberCount ?? 0} members
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="More options" variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Members
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Team members or Contacts */}
      <div className="w-1/2 flex flex-col border-l pl-4">
        {selectedTeamId ? (
          <>
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Team Members
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-3">
                {!teamMembers || teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No members yet</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setIsAddMemberOpen(true)}>
                      Add Members
                    </Button>
                  </div>
                ) : (
                  (teamMembers as TeamMember[]).map((member) => (
                    <div
                      key={String(member._id)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user?.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.user?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            {member.user?.name ?? "Unknown"}
                            {member.role === "leader" && (
                              <Crown className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.user?.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Contacts ({contacts?.length ?? 0})
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-3">
                {!contacts || contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No Contacts yet</p>
                    <p className="text-xs">Add Contacts to quickly invite them to workspaces</p>
                  </div>
                ) : (
                  contacts.map((Contactship: any) => (
                    <div
                      key={String(Contactship._id)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={Contactship.Contact?.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(Contactship.Contact?.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {Contactship.Contact?.name ?? "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Contactship.Contact?.email}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 gap-1">
                        <UserPlus className="w-3.5 h-3.5" />
                        Invite
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

export default TeamListPanel;
