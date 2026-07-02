import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useWorkspaceId } from "../../../shared/hooks/useWorkspaceId";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import { LoadingSpinner } from "../../../shared/components/Loading";
import { ErrorState } from "../../../shared/components/ErrorState";
import { Users as UsersIcon, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

interface WorkspaceUserRow {
  _id: string;
  email: string;
  name?: string;
  membership: {
    _id: string;
    userId: string;
    roleId: string;
    status: string;
    joinedAt?: number;
  };
}

interface RoleRow {
  _id: string;
  name: string;
  level: number;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();

  const usersData = useQuery(
    api.features.cmsLite.users.api.queries.listWorkspaceUsers,
    workspaceId ? { workspaceId } : "skip"
  );
  const rolesData = useQuery(
    api.workspace.roles.getAllRoles,
    workspaceId ? { workspaceId } : "skip"
  );

  const sendInvitation = useMutation(
    api.workspace.invitations.sendWorkspaceInvitation
  );
  const removeMember = useMutation(api.workspace.workspaces.removeMember);

  const loading =
    !workspaceId || usersData === undefined || rolesData === undefined;

  const users: WorkspaceUserRow[] = useMemo(
    () => (usersData ?? []).filter((u: any) => u?.membership?.status === "active") as WorkspaceUserRow[],
    [usersData]
  );
  const roles: RoleRow[] = (rolesData ?? []) as RoleRow[];
  const rolesByLevel = useMemo(
    () => [...roles].sort((a, b) => a.level - b.level),
    [roles]
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    roleId: "",
    message: "",
  });

  const openInviteForm = () => {
    // Default to the lowest-privilege non-owner role if available.
    const defaultRole =
      rolesByLevel.find((r) => r.level >= 30) ?? rolesByLevel[rolesByLevel.length - 1];
    setFormData({
      email: "",
      roleId: defaultRole?._id ?? "",
      message: "",
    });
    setIsFormOpen(true);
  };

  const handleInvite = async () => {
    if (!workspaceId) return;
    if (!formData.email.trim() || !formData.roleId) {
      toast({
        title: "Email and role are required",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    logger.save("invitation", "invitations table", formData);
    try {
      await sendInvitation({
        workspaceId,
        inviteeEmail: formData.email.trim().toLowerCase(),
        roleId: formData.roleId,
        message: formData.message || undefined,
      });
      logger.saved("invitation", "invitations table");
      toast({
        title: "Invitation sent",
        description: `Invite sent to ${formData.email}`,
      });
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menyimpan", "invitation", err);
      toast({
        title: "Failed to send invite",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (user: WorkspaceUserRow) => {
    if (!workspaceId) return;
    if (!confirm(`Remove ${user.email} from this workspace?`)) return;
    logger.delete("membership", "workspaceMemberships table", user._id);
    try {
      await removeMember({
        workspaceId,
        userId: user._id,
      });
      logger.deleted("membership", "workspaceMemberships table");
      toast({ title: "Member removed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "membership", err);
      toast({
        title: "Failed to remove",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!workspaceId) return <ErrorState message="No workspace selected" />;

  const getRoleName = (roleId: string) =>
    roles.find((r) => r._id === roleId)?.name ?? "—";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UsersIcon className="h-8 w-8" />
          Workspace Members
        </h1>
        <Button onClick={openInviteForm}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No members yet — invite your first collaborator.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleName(user.membership.roleId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.membership.joinedAt
                      ? new Date(user.membership.joinedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button aria-label="Delete"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(user)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Invite Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(value) =>
                setFormData({ ...formData, email: value })
              }
              placeholder="teammate@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: e.target.value })
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">Select a role...</option>
              {rolesByLevel.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name} (level {role.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Message (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              placeholder="Hey, join our workspace..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
