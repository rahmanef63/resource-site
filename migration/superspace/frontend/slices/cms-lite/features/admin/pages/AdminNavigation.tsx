import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useWorkspaceId } from "../../../shared/hooks/useWorkspaceId";
import { Button } from "../../../shared/components/Button";
import { Input, Select } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

interface NavItem {
  key: string;
  type: string;
  label: string;
  description?: string;
  path?: string;
  isExternal?: boolean;
  icon?: string;
  data?: any;
  children?: NavItem[];
}

const LOCALES = [
  { value: "id", label: "Indonesian" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
] as const;

export default function AdminNavigation() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();
  const [activeLocale, setActiveLocale] = useState<"id" | "en" | "ar">("id");

  const itemsData = useQuery(
    api.features.cmsLite.navigation.api.queries.listItems,
    workspaceId
      ? { workspaceId: String(workspaceId), locale: activeLocale }
      : "skip"
  );

  const upsertNavItemFlat = useMutation(
    api.features.cmsLite.navigation.api.mutations.upsertNavItemFlat
  );
  const deleteItem = useMutation(
    api.features.cmsLite.navigation.api.mutations.deleteItem
  );

  const items: NavItem[] = (itemsData ?? []) as NavItem[];
  const flatItems: NavItem[] = items.flatMap((item) => [
    item,
    ...(item.children ?? []),
  ]);
  const loading = !workspaceId || itemsData === undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    key: "",
    locale: "id" as "id" | "en" | "ar",
    label: "",
    description: "",
    path: "",
    icon: "",
    order: 0,
    parentKey: "",
    isExternal: false,
    status: "active",
  });

  const handleOpenModal = (item?: NavItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        key: item.key,
        locale: activeLocale,
        label: item.label,
        description: item.description ?? "",
        path: item.path ?? "",
        icon: item.icon ?? "",
        order: 0,
        parentKey: "",
        isExternal: item.isExternal ?? false,
        status: "active",
      });
    } else {
      setEditingItem(null);
      setFormData({
        key: "",
        locale: activeLocale,
        label: "",
        description: "",
        path: "",
        icon: "",
        order: flatItems.length,
        parentKey: "",
        isExternal: false,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!workspaceId) return;
    if (!formData.key.trim() || !formData.label.trim()) {
      toast({ title: "Key and label are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      logger.save("navigation item", "database/navigationItems table", formData);
      await upsertNavItemFlat({
        workspaceId: String(workspaceId),
        key: formData.key.trim(),
        locale: formData.locale,
        label: formData.label,
        description: formData.description || undefined,
        path: formData.path || undefined,
        icon: formData.icon || undefined,
        order: formData.order,
        parentKey: formData.parentKey || undefined,
        isExternal: formData.isExternal,
        status: formData.status,
      });
      logger.saved("navigation item", "database/navigationItems table");
      toast({ title: editingItem ? "Navigation updated" : "Navigation created" });
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(editingItem ? "update" : "menyimpan", "navigation item", err);
      toast({
        title: "Failed to save",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NavItem) => {
    if (!workspaceId) return;
    if (!confirm(`Delete "${item.label}" and its children?`)) return;
    logger.delete("navigation item", "database/navigationItems table", item.key);
    try {
      await deleteItem({ workspaceId: String(workspaceId), key: item.key });
      logger.deleted("navigation item", "database/navigationItems table");
      toast({ title: "Navigation item deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "navigation item", err);
      toast({
        title: "Failed to delete",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Navigation Menu</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Viewing labels in{" "}
            <strong>{LOCALES.find((l) => l.value === activeLocale)?.label}</strong>
          </p>
        </div>
        <div className="flex gap-2 items-end">
          <div className="w-40">
            <Select
              label="Language"
              value={activeLocale}
              onChange={(v) => setActiveLocale(v as "id" | "en" | "ar")}
              options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Add Navigation Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No navigation items"
          description="Add links that appear in your site header/footer"
          action={<Button onClick={() => handleOpenModal()}>Create item</Button>}
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Key</th>
                  <th className="text-left p-4">Label</th>
                  <th className="text-left p-4">Path</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flatItems.map((item) => (
                  <tr key={item.key} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-foreground/40" />
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.key}
                        </code>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-foreground/60">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {item.path ? (
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.path}
                        </code>
                      ) : (
                        <span className="text-xs text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.isExternal
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {item.isExternal ? "External" : "Internal"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button aria-label="Edit"
                          onClick={() => handleOpenModal(item)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button aria-label="Delete"
                          onClick={() => handleDelete(item)}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Key (stable identifier)"
              value={formData.key}
              onChange={(value) => setFormData({ ...formData, key: value })}
              placeholder="e.g. about-us"
              required
            />
            <Select
              label="Language"
              value={formData.locale}
              onChange={(v) =>
                setFormData({ ...formData, locale: v as "id" | "en" | "ar" })
              }
              options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>

          <Input
            label="Label (in selected language)"
            value={formData.label}
            onChange={(value) => setFormData({ ...formData, label: value })}
            required
          />

          <Input
            label="Path"
            value={formData.path}
            onChange={(value) => setFormData({ ...formData, path: value })}
            placeholder="/about"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              type="number"
              value={String(formData.order)}
              onChange={(value) =>
                setFormData({ ...formData, order: parseInt(value) || 0 })
              }
            />
            <div>
              <label className="block text-sm font-medium mb-2">Parent Key</label>
              <select
                value={formData.parentKey}
                onChange={(e) =>
                  setFormData({ ...formData, parentKey: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">None (Top Level)</option>
                {items
                  .filter((item) => item.key !== editingItem?.key)
                  .map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label} ({item.key})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isExternal}
                onChange={(e) =>
                  setFormData({ ...formData, isExternal: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">External Link</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
