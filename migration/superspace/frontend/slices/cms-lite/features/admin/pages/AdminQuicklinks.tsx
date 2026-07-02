import { useEffect, useState } from "react";
import Image from "next/image";
import { useBackend, useQuery, api } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import type { Quicklink } from "../../../types/cms-types";
import { useToast } from "@/hooks/use-toast";
import { ImageEditor } from "../../../shared/components/ImageEditor";
import { logger } from "../../../shared/utils/logger";

export default function AdminQuicklinks() {
  const backend = useBackend();
  const { toast } = useToast();
  
  // Use Convex query for real-time data
  const quicklinksData = useQuery(api.features.cmsLite.quicklinks.api.queries.listAllQuicklinks, {});
  const quicklinks = quicklinksData?.quicklinks || [];
  const loading = quicklinksData === undefined;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuicklink, setEditingQuicklink] = useState<Quicklink | null>(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    icon: "",
  });

  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setEditingQuicklink(null);
    setForm({ title: "", url: "", icon: "" });
    setIsFormOpen(true);
  };

  const handleEdit = (quicklink: Quicklink) => {
    setEditingQuicklink(quicklink);
    setForm({
      title: quicklink.title,
      url: quicklink.url,
      icon: quicklink.icon || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingQuicklink) {
        logger.update("quicklink", "database/quicklinks table", { id: editingQuicklink.id, ...form });
        await backend.quicklinks.update({
          id: editingQuicklink.id,
          ...form,
        });
        logger.updated("quicklink", "database/quicklinks table");
        toast({ title: "Quicklink updated successfully" });
      } else {
        logger.save("quicklink baru", "database/quicklinks table", form);
        await backend.quicklinks.create(form);
        logger.saved("quicklink baru", "database/quicklinks table");
        toast({ title: "Quicklink created successfully" });
      }
      setIsFormOpen(false);
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(editingQuicklink ? "update" : "menyimpan", "quicklink", err);
      toast({
        title: "Failed to save quicklink",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this quicklink?")) return;

    logger.delete("quicklink", "database/quicklinks table", id);
    try {
      await backend.quicklinks.delete({ id });
      logger.deleted("quicklink", "database/quicklinks table");
      toast({ title: "Quicklink deleted successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "quicklink", err);
      toast({
        title: "Failed to delete quicklink",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (quicklink: Quicklink) => {
    try {
      await backend.quicklinks.update({
        id: quicklink.id,
        active: !quicklink.active,
      });
      toast({ title: "Quicklink status updated successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to update quicklink",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleMoveQuicklink = async (quicklink: Quicklink, direction: "up" | "down") => {
    const currentIndex = quicklinks.findIndex((q) => String(q.id) === String(quicklink.id));
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= quicklinks.length) return;

    const otherQuicklink = quicklinks[newIndex];
    const currentOrder = quicklink.displayOrder ?? quicklink.order ?? currentIndex;
    const otherOrder = (otherQuicklink as any).displayOrder ?? newIndex;
    
    try {
      await Promise.all([
        backend.quicklinks.update({
          id: quicklink.id,
          displayOrder: otherOrder,
        }),
        backend.quicklinks.update({
          id: otherQuicklink.id,
          displayOrder: currentOrder,
        }),
      ]);
      toast({ title: "Quicklinks reordered successfully" });
      // Data will automatically refresh via Convex real-time query
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to reorder quicklinks",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quick Links</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Quicklink
        </Button>
      </div>

      {quicklinks.length === 0 ? (
        <EmptyState
          title="No quicklinks yet"
          description="Add quicklinks for business cards and bio pages"
          action={
            <Button onClick={handleCreate}>
              Create your first quicklink
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Icon</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">URL</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Order</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quicklinks.map((quicklink, index) => (
                <tr key={quicklink.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    {quicklink.icon && (
                      <Image
                        src={quicklink.icon}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover rounded"
                        sizes="32px"
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{quicklink.title}</p>
                  </td>
                  <td className="p-4">
                    <a
                      href={quicklink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {quicklink.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(quicklink)}
                      className={`px-2 py-1 rounded text-xs ${
                        quicklink.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {quicklink.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button aria-label="Collapse"
                        onClick={() => handleMoveQuicklink(quicklink, "up")}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button aria-label="Expand"
                        onClick={() => handleMoveQuicklink(quicklink, "down")}
                        disabled={index === quicklinks.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button aria-label="Edit"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(quicklink)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button aria-label="Delete"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(quicklink.id as string | number)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingQuicklink ? "Edit Quicklink" : "Create Quicklink"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
            placeholder="My Portfolio"
            required
          />

          <Input
            label="URL"
            value={form.url}
            onChange={(value) => setForm({ ...form, url: value })}
            placeholder="https://example.com"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <ImageEditor
              value={form.icon}
              onChange={(value) => setForm({ ...form, icon: value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Quicklink"}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </ErrorBoundary>
  );
}
