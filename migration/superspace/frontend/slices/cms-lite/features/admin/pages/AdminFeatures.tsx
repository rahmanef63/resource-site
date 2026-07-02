import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useWorkspaceId } from "../../../shared/hooks/useWorkspaceId";
import { Button } from "../../../shared/components/Button";
import { Input, Textarea, Select } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

interface FeatureRow {
  _id: string;
  key: string;
  status: string;
  type: string;
  displayOrder: number;
  translations: Record<string, { title: string; description?: string; icon?: string }>;
}

const LOCALES = [
  { value: "id", label: "Indonesian" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
] as const;

const ICONS = [
  { value: "Camera", label: "Camera" },
  { value: "Award", label: "Award" },
  { value: "Clock", label: "Clock" },
  { value: "Star", label: "Star" },
  { value: "Shield", label: "Shield" },
  { value: "Heart", label: "Heart" },
];

export default function AdminFeatures() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();

  const featuresData = useQuery(
    api.features.cmsLite.features.api.queries.listAll,
    workspaceId ? { workspaceId: String(workspaceId), locale: "en" } : "skip"
  );

  const upsertFeatureFlat = useMutation(
    api.features.cmsLite.features.api.mutations.upsertFeatureFlat
  );
  const deleteFeature = useMutation(
    api.features.cmsLite.features.api.mutations.deleteFeature
  );
  const upsertFeature = useMutation(
    api.features.cmsLite.features.api.mutations.upsertFeature
  );

  const features: FeatureRow[] = (featuresData ?? []) as FeatureRow[];
  const loading = !workspaceId || featuresData === undefined;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    key: "",
    locale: "id" as "id" | "en" | "ar",
    icon: "Camera",
    title: "",
    description: "",
  });

  const handleCreate = () => {
    setEditingFeature(null);
    setForm({ key: "", locale: "id", icon: "Camera", title: "", description: "" });
    setIsFormOpen(true);
  };

  const handleEdit = (feature: FeatureRow) => {
    setEditingFeature(feature);
    const firstLocale = (Object.keys(feature.translations)[0] ?? "id") as "id" | "en" | "ar";
    const t = feature.translations[firstLocale] ?? { title: "", description: "", icon: "Camera" };
    setForm({
      key: feature.key,
      locale: firstLocale,
      icon: t.icon ?? "Camera",
      title: t.title ?? "",
      description: t.description ?? "",
    });
    setIsFormOpen(true);
  };

  const handleLocaleChange = (next: string) => {
    const locale = next as "id" | "en" | "ar";
    if (editingFeature) {
      const t = editingFeature.translations[locale] ?? { title: "", description: "", icon: form.icon };
      setForm({
        ...form,
        locale,
        icon: t.icon ?? form.icon,
        title: t.title ?? "",
        description: t.description ?? "",
      });
    } else {
      setForm({ ...form, locale });
    }
  };

  const handleSave = async () => {
    if (!workspaceId) return;
    if (!form.key.trim() || !form.title.trim()) {
      toast({ title: "Key and title are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      logger.save("feature", "database/features table", form);
      await upsertFeatureFlat({
        workspaceId: String(workspaceId),
        key: form.key.trim(),
        locale: form.locale,
        title: form.title,
        description: form.description,
        icon: form.icon,
      });
      logger.saved("feature", "database/features table");
      toast({ title: editingFeature ? "Feature updated" : "Feature created" });
      setIsFormOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(editingFeature ? "update" : "menyimpan", "feature", err);
      toast({
        title: "Failed to save feature",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (feature: FeatureRow) => {
    if (!workspaceId) return;
    if (!confirm(`Delete feature "${feature.key}"?`)) return;
    try {
      await deleteFeature({ workspaceId: String(workspaceId), key: feature.key });
      toast({ title: "Feature deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (feature: FeatureRow) => {
    if (!workspaceId) return;
    try {
      await upsertFeature({
        workspaceId: String(workspaceId),
        key: feature.key,
        status: feature.status === "active" ? "inactive" : "active",
        type: feature.type,
        displayOrder: feature.displayOrder,
        translations: feature.translations,
      });
      toast({ title: "Status updated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update status",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleMove = async (feature: FeatureRow, direction: "up" | "down") => {
    if (!workspaceId) return;
    const idx = features.findIndex((f) => f._id === feature._id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= features.length) return;
    const other = features[targetIdx];
    try {
      await Promise.all([
        upsertFeature({
          workspaceId: String(workspaceId),
          key: feature.key,
          status: feature.status,
          type: feature.type,
          displayOrder: other.displayOrder,
          translations: feature.translations,
        }),
        upsertFeature({
          workspaceId: String(workspaceId),
          key: other.key,
          status: other.status,
          type: other.type,
          displayOrder: feature.displayOrder,
          translations: other.translations,
        }),
      ]);
      toast({ title: "Order updated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to reorder",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Features</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Add Feature
          </Button>
        </div>

        {features.length === 0 ? (
          <EmptyState
            title="No features yet"
            description="Add features to showcase on your landing page"
            action={
              <Button onClick={handleCreate}>Create your first feature</Button>
            }
          />
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Key</th>
                  <th className="text-left p-4">Title (EN)</th>
                  <th className="text-left p-4">Languages</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Order</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => {
                  const primaryLocale = feature.translations.en
                    ? "en"
                    : (Object.keys(feature.translations)[0] ?? "en");
                  const primary = feature.translations[primaryLocale];
                  return (
                    <tr key={feature._id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {feature.key}
                        </code>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{primary?.title ?? feature.key}</p>
                          <p className="text-sm text-foreground/60 line-clamp-1">
                            {primary?.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {Object.keys(feature.translations).map((loc) => (
                            <span
                              key={loc}
                              className="px-2 py-1 bg-muted rounded text-xs uppercase"
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(feature)}
                          className={`px-2 py-1 rounded text-xs ${
                            feature.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {feature.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button aria-label="Collapse"
                            onClick={() => handleMove(feature, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-muted rounded disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button aria-label="Expand"
                            onClick={() => handleMove(feature, "down")}
                            disabled={index === features.length - 1}
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
                            onClick={() => handleEdit(feature)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(feature)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingFeature ? "Edit Feature" : "Create Feature"}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Key (stable identifier)"
              value={form.key}
              onChange={(value) => setForm({ ...form, key: value })}
              placeholder="e.g. fast-delivery"
              required
            />

            <Select
              label="Language"
              value={form.locale}
              onChange={handleLocaleChange}
              options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
            />

            <Select
              label="Icon"
              value={form.icon}
              onChange={(value) => setForm({ ...form, icon: value })}
              options={ICONS}
            />

            <Input
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
              required
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              rows={3}
            />

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Feature"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}
