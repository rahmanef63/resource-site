import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import ImportValidationModal from "../../../shared/components/ImportValidationModal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Upload, FileJson } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import type { ServiceItem } from "../../../types/cms-types";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

export default function AdminServices() {
  const { toast } = useToast();
  const servicesData = useQuery(api.features.cmsLite.services.api.queries.listAllServices, {});
  const services: ServiceItem[] = ((servicesData?.services ?? []) as any[]).map((svc) => ({
    ...svc,
    id: svc._id ?? svc.id,
    order: svc.displayOrder ?? svc.order ?? 0,
    name: svc.labelEn ?? svc.labelId ?? svc.slug,
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const loading = servicesData === undefined;

  const createServiceMutation = useMutation(api.features.cmsLite.services.api.mutations.createService);
  const updateServiceMutation = useMutation(api.features.cmsLite.services.api.mutations.updateService);
  const deleteServiceMutation = useMutation(api.features.cmsLite.services.api.mutations.deleteService);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const [form, setForm] = useState({
    slug: "",
    labelId: "",
    labelEn: "",
    labelAr: "",
  });

  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setEditingService(null);
    setForm({ slug: "", labelId: "", labelEn: "", labelAr: "" });
    setIsFormOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service);
    setForm({
      slug: service.slug,
      labelId: service.labelId ?? "",
      labelEn: service.labelEn ?? "",
      labelAr: service.labelAr ?? "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingService) {
        logger.update("service", "database/services table", { id: editingService.id, ...form });
        await updateServiceMutation({
          id: editingService.id as any,
          slug: form.slug,
          displayOrder: editingService.displayOrder ?? editingService.order ?? 0,
          labelId: form.labelId,
          labelEn: form.labelEn,
          labelAr: form.labelAr,
          active: editingService.active,
        });
        logger.updated("service", "database/services table");
        toast({ title: "Service updated successfully" });
      } else {
        logger.save("service baru", "database/services table", form);
        await createServiceMutation({
          slug: form.slug,
          displayOrder: services.length,
          labelId: form.labelId,
          labelEn: form.labelEn,
          labelAr: form.labelAr,
          active: true,
        });
        logger.saved("service baru", "database/services table");
        toast({ title: "Service created successfully" });
      }
      setIsFormOpen(false);
      // Convex useQuery reactively refreshes — no manual reload needed.
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(editingService ? "update" : "menyimpan", "service", err);
      toast({
        title: "Failed to save",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    logger.delete("service", "database/services table", id);
    try {
      await deleteServiceMutation({ id: id as any });
      logger.deleted("service", "database/services table");
      toast({ title: "Service deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "service", err);
      toast({
        title: "Failed to delete",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleMove = async (id: number | string, direction: "up" | "down") => {
    const index = services.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === services.length - 1)
    ) {
      return;
    }

    const newServices = [...services];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newServices[index], newServices[targetIndex]] = [
      newServices[targetIndex],
      newServices[index],
    ];

    try {
      await Promise.all(
        newServices.map((service, i) =>
          updateServiceMutation({
            id: service.id as any,
            slug: service.slug,
            displayOrder: i,
            labelId: service.labelId,
            labelEn: service.labelEn,
            labelAr: service.labelAr,
            active: service.active,
          })
        )
      );
      toast({ title: "Order updated successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast({
        title: "Failed to update order",
        description: message,
        variant: "destructive",
      });
    }
  };

  // TODO: backend mutation missing — cmsLite.services.exportJSON
  const handleExportJSON = async () => {
    const data = services.map((s) => ({
      slug: s.slug,
      displayOrder: s.displayOrder ?? 0,
      labelId: s.labelId,
      labelEn: s.labelEn,
      labelAr: s.labelAr,
      active: s.active,
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${data.length} service(s) to JSON` });
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.import("services", file.name);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        logger.error("import", "services", "Invalid JSON format: must be array");
        toast({
          title: "Invalid JSON format",
          description: "The JSON file must contain an array of services.",
          variant: "destructive",
        });
        return;
      }

      setImportData(data);
      setImportModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("import", "services", err);
      toast({
        title: "Import failed",
        description: message || "Failed to parse JSON file.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Services bulk-import is not a single backend mutation — loop the existing
  // createService mutation for each row. TODO: add a proper bulk endpoint if
  // needed for large imports.
  const handleConfirmImport = async (selectedItems: any[]) => {
    try {
      logger.action("Menyimpan imported services ke database...");
      let imported = 0;
      for (const [idx, row] of selectedItems.entries()) {
        await createServiceMutation({
          slug: row.slug,
          displayOrder: typeof row.displayOrder === "number" ? row.displayOrder : services.length + idx,
          labelId: row.labelId ?? "",
          labelEn: row.labelEn ?? "",
          labelAr: row.labelAr ?? "",
          active: row.active ?? true,
        });
        imported++;
      }
      logger.imported("services ke database", imported);
      toast({ title: `Imported ${imported} service(s) successfully` });
      setImportModalOpen(false);
      setImportData([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("import", "services", err);
      toast({
        title: "Import failed",
        description: message || "Failed to import services.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Services</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleImportJSON}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button size="sm" variant="ghost" onClick={handleExportJSON}>
              <FileJson className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </div>
        </div>
        {/* @dod:skip-primitive reason="cms-lite admin services JSON import is parsed client-side via FileReader for bulk-import preview; not a Convex storage upload" */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {services.length === 0 ? (
          <EmptyState
            title="No services yet"
            description="Create your first service"
            action={<Button onClick={handleCreate}>Create service</Button>}
          />
        ) : (
          <div className="bg-card border rounded-lg">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Slug</th>
                  <th className="text-left p-4">Label (ID)</th>
                  <th className="text-left p-4">Label (EN)</th>
                  <th className="text-left p-4">Label (AR)</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button aria-label="Collapse"
                          onClick={() => handleMove(service.id, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button aria-label="Expand"
                          onClick={() => handleMove(service.id, "down")}
                          disabled={index === services.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">{service.slug}</td>
                    <td className="p-4">{service.labelId}</td>
                    <td className="p-4">{service.labelEn}</td>
                    <td className="p-4">{service.labelAr}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button aria-label="Edit"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(service)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button aria-label="Delete"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(service.id)}
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
          title={editingService ? "Edit Service" : "Create Service"}
        >
          <div className="space-y-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <Input
              label="Label (Indonesian)"
              value={form.labelId}
              onChange={(value) => setForm({ ...form, labelId: value })}
              required
            />
            <Input
              label="Label (English)"
              value={form.labelEn}
              onChange={(value) => setForm({ ...form, labelEn: value })}
              required
            />
            <div dir="rtl">
              <Input
                label="Label (Arabic)"
                value={form.labelAr}
                onChange={(value) => setForm({ ...form, labelAr: value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                {editingService ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </Modal>

        <ImportValidationModal
          isOpen={importModalOpen}
          onClose={() => {
            setImportModalOpen(false);
            setImportData([]);
          }}
          onConfirm={handleConfirmImport}
          items={importData}
          entityType="service"
        />
      </div>
    </ErrorBoundary>
  );
}
