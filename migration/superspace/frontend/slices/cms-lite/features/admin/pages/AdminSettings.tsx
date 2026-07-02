import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext";
import { Button } from "../../../shared/components/Button";
import { Input, Select } from "../../../shared/components/Form";
import { Save, Download, Upload } from "lucide-react";
import type { Settings } from "../../../types/cms-types";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { createFileInput, importFromJSON } from "../../../shared/utils/exportImport";
import { ImageUrlInput } from "../../../shared/components/ImageUrlInput";
import { logger } from "../../../shared/utils/logger";
import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple";

export default function AdminSettings() {
  const { toast } = useToast();
  const { workspaceId } = useUnifiedWorkspaceContext();
  const settingsData = useQuery(
    api.features.cmsLite.settings.api.queries.getSettings,
    workspaceId ? { workspaceId } : "skip",
  );
  const upsertSettingsMutation = useMutation(api.features.cmsLite.settings.api.mutations.upsertSettings);

  const loading = settingsData === undefined;
  const [form, setForm] = useState({
    brandName: "Your Brand",
    defaultLocale: "id",
    heroImage: "",
    phone: "",
    email: "",
    instagram: "",
    whatsapp: "",
    logoUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setForm({
        brandName: settingsData.brandName || "Your Brand",
        defaultLocale: settingsData.defaultLocale || "id",
        heroImage: settingsData.heroImage || "",
        phone: settingsData.phone || "",
        email: settingsData.email || "",
        instagram: settingsData.instagram || "",
        whatsapp: settingsData.whatsapp || "",
        logoUrl: settingsData.logoUrl || "",
        primaryColor: settingsData.primaryColor || "#3b82f6",
        secondaryColor: settingsData.secondaryColor || "#8b5cf6",
      });
    }
  }, [settingsData]);

  const handleSave = async () => {
    setSaving(true);
    logger.save("settings", "database/settings table", form);
    try {
      await upsertSettingsMutation(form);
      logger.saved("settings", "database/settings table");
      toast({ title: "Settings saved successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menyimpan", "settings", err);
      toast({
        title: "Failed to save settings",
        description: message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // TODO: backend mutation missing — cmsLite.settings.exportAll (full workspace backup)
  const handleExportAll = async () => {
    setExporting(true);
    try {
      const payload = { version: 1, exportedAt: new Date().toISOString(), settings: settingsData ?? {} };
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Settings exported",
        description: "Full cross-feature export requires backend.settings.exportAll (TODO).",
      });
    } finally {
      setExporting(false);
    }
  };

  // TODO: backend mutation missing — cmsLite.settings.importAll (full workspace restore)
  const handleImportAll = () => {
    createFileInput("application/json", async (file) => {
      setImporting(true);
      logger.import("data", file.name);
      try {
        const result = await importFromJSON<any>(file);
        if (!result.success || !result.data) {
          toast({
            title: "Failed to import data",
            description: result.error || "Invalid file format",
            variant: "destructive",
          });
          return;
        }
        const importData = result.data as any;
        const incoming = importData.settings ?? importData.data ?? importData;
        if (incoming && typeof incoming === "object") {
          await upsertSettingsMutation({
            brandName: incoming.brandName ?? form.brandName,
            defaultLocale: incoming.defaultLocale ?? form.defaultLocale,
            heroImage: incoming.heroImage,
            phone: incoming.phone,
            email: incoming.email,
            instagram: incoming.instagram,
            whatsapp: incoming.whatsapp,
            logoUrl: incoming.logoUrl,
            primaryColor: incoming.primaryColor,
            secondaryColor: incoming.secondaryColor,
          });
          toast({ title: "Settings imported", description: "Cross-feature import is TODO." });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("import", "data", err);
        toast({
          title: "Failed to import data",
          description: message || "An error occurred.",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportAll} disabled={exporting} variant="secondary">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export All Data"}
          </Button>
          <Button onClick={handleImportAll} disabled={importing} variant="secondary">
            <Upload className="w-4 h-4" />
            {importing ? "Importing..." : "Import All Data"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Branding</h2>
          
          <Input
            label="Brand Name"
            value={form.brandName}
            onChange={(value) => setForm({ ...form, brandName: value })}
            placeholder="Your Brand Name"
          />

          <ImageUrlInput
            label="Logo URL"
            value={form.logoUrl}
            onChange={(value) => setForm({ ...form, logoUrl: value })}
            placeholder="https://example.com/logo.png"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <ColorPickerSimple
                value={form.primaryColor}
                onChange={(color) => setForm({ ...form, primaryColor: color })}
                placeholder="#3b82f6"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Used for: Buttons, Links, Active states, Hero CTA
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color</label>
              <ColorPickerSimple
                value={form.secondaryColor}
                onChange={(color) => setForm({ ...form, secondaryColor: color })}
                placeholder="#8b5cf6"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Used for: Service icons, Feature highlights, Accents
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Color Preview:</p>
            <div className="flex gap-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: form.primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: form.secondaryColor }}
              >
                Secondary Button
              </button>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ backgroundColor: form.primaryColor }}
                />
                <span className="text-sm">Primary Icon</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ backgroundColor: form.secondaryColor }}
                />
                <span className="text-sm">Secondary Icon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">General Settings</h2>
          
          <Select
            label="Default Language"
            value={form.defaultLocale}
            onChange={(value) => setForm({ ...form, defaultLocale: value })}
            options={[
              { value: "id", label: "Indonesian" },
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
            ]}
          />

          <ImageUrlInput
            label="Hero Image URL"
            value={form.heroImage}
            onChange={(value) => setForm({ ...form, heroImage: value })}
            placeholder="https://example.com/hero.jpg"
          />
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              placeholder="+1 234 567 8900"
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              placeholder="contact@example.com"
            />

            <Input
              label="Instagram"
              value={form.instagram}
              onChange={(value) => setForm({ ...form, instagram: value })}
              placeholder="@yourbrand"
            />

            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(value) => setForm({ ...form, whatsapp: value })}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}
