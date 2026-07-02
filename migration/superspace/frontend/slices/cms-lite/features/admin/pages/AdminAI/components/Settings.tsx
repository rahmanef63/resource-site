import { useState, useEffect } from "react";
import { useBackend } from "../../../../../shared/hooks/useBackend";
import { LoadingSpinner as Loading } from "../../../../../shared/components/Loading";
import { ErrorState } from "../../../../../shared/components/ErrorState";
import { Button } from "@/components/ui";
import { Input, Textarea, Select } from "../../../../../shared/components/Form";
import { Modal } from "../../../../../shared/components/Modal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, FileText } from "lucide-react";
import { logger } from "../../../../../shared/utils/logger";

// Placeholder type until backend is integrated
interface KBDocument {
  id: string | number;
  title: string;
  content: string;
  fileUrl?: string;
  category: string;
  active?: boolean;
  createdAt: Date;
}

export default function AdminAISettings() {
  const backend = useBackend();
  const [settings, setSettings] = useState<any>(null);
  const [kbDocuments, setKbDocuments] = useState<KBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "knowledge" | "prompts">("general");
  const { toast } = useToast();

  const [isKBFormOpen, setIsKBFormOpen] = useState(false);
  const [editingKBDoc, setEditingKBDoc] = useState<KBDocument | null>(null);
  const [kbForm, setKbForm] = useState({
    title: "",
    content: "",
    fileUrl: "",
    category: "general",
  });

  const [formData, setFormData] = useState({
    enabled: true,
    defaultLocale: "en",
    rateLimitPerMinute: 10,
    rateLimitPerHour: 100,
    systemPromptId: "",
    systemPromptEn: "",
    systemPromptAr: "",
    personality: "professional",
    customPersonality: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      logger.load("AI settings & knowledge base", "database/ai_settings & knowledge_base_documents tables");
      const [settingsData, kbData] = await Promise.all([
        backend.ai.getSettings(),
        backend.ai.listKBDocuments(),
      ]);
      setSettings(settingsData);
      setKbDocuments(kbData.documents);
      logger.loaded("AI settings", "database");
      logger.loaded("knowledge base documents", "database", kbData.documents.length);
      setFormData({
        enabled: settingsData.enabled,
        defaultLocale: settingsData.defaultLocale,
        rateLimitPerMinute: settingsData.rateLimitPerMinute,
        rateLimitPerHour: settingsData.rateLimitPerHour,
        systemPromptId: settingsData.systemPromptId || "",
        systemPromptEn: settingsData.systemPromptEn || "",
        systemPromptAr: settingsData.systemPromptAr || "",
        personality: settingsData.personality || "professional",
        customPersonality: settingsData.customPersonality || "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("mengambil", "AI settings", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      logger.save("AI settings", "database/ai_settings table", formData);
      await backend.ai.updateSettings(formData);
      logger.saved("AI settings", "database/ai_settings table");
      toast({ title: "AI settings updated successfully" });
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menyimpan", "AI settings", err);
      toast({ title: "Error updating settings", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKBDoc = () => {
    setEditingKBDoc(null);
    setKbForm({ title: "", content: "", fileUrl: "", category: "general" });
    setIsKBFormOpen(true);
  };

  const handleEditKBDoc = (doc: KBDocument) => {
    setEditingKBDoc(doc);
    setKbForm({
      title: doc.title,
      content: doc.content,
      fileUrl: doc.fileUrl || "",
      category: doc.category,
    });
    setIsKBFormOpen(true);
  };

  const handleSaveKBDoc = async () => {
    try {
      setSaving(true);
      if (editingKBDoc) {
        logger.update("knowledge base document", "database/knowledge_base_documents table", { id: editingKBDoc.id, ...kbForm });
        await backend.ai.updateKBDocument({
          id: editingKBDoc.id,
          ...kbForm,
        });
        logger.updated("knowledge base document", "database/knowledge_base_documents table");
        toast({ title: "Knowledge base document updated" });
      } else {
        logger.save("knowledge base document", "database/knowledge_base_documents table", kbForm);
        await backend.ai.createKBDocument(kbForm);
        logger.saved("knowledge base document", "database/knowledge_base_documents table");
        toast({ title: "Knowledge base document created" });
      }
      setIsKBFormOpen(false);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(editingKBDoc ? "update" : "menyimpan", "knowledge base document", err);
      toast({ title: "Error saving document", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKBDoc = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    logger.delete("knowledge base document", "database/knowledge_base_documents table", id);
    try {
      await backend.ai.deleteKBDocument({ id });
      logger.deleted("knowledge base document", "database/knowledge_base_documents table");
      toast({ title: "Document deleted" });
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("menghapus", "knowledge base document", err);
      toast({ title: "Error deleting document", description: message, variant: "destructive" });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">AI Chatbot Settings</h1>

      <div className="mb-6 flex gap-2 border-b">
        {(["general", "knowledge", "prompts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-primary font-medium"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">General Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="enabled" className="font-medium">
                  Enable AI Chatbot
                </label>
              </div>

              <Select
                label="Default Locale"
                value={formData.defaultLocale}
                onChange={(value) => setFormData({ ...formData, defaultLocale: value })}
                options={[
                  { value: "id", label: "Indonesian" },
                  { value: "en", label: "English" },
                  { value: "ar", label: "Arabic" },
                ]}
              />
            </div>
          </div>

          <div className="bg-card border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Personality</h2>

            <div className="space-y-4">
              <Select
                label="Personality Type"
                value={formData.personality}
                onChange={(value) => setFormData({ ...formData, personality: value })}
                options={[
                  { value: "professional", label: "Professional" },
                  { value: "Contactly", label: "Contactly" },
                  { value: "casual", label: "Casual" },
                  { value: "enthusiastic", label: "Enthusiastic" },
                  { value: "formal", label: "Formal" },
                  { value: "custom", label: "Custom" },
                ]}
              />

              {formData.personality === "custom" && (
                <Textarea
                  label="Custom Personality Instructions"
                  value={formData.customPersonality}
                  onChange={(value) => setFormData({ ...formData, customPersonality: value })}
                  rows={4}
                  placeholder="Describe the personality traits and behavior for the AI chatbot..."
                />
              )}
            </div>
          </div>

          <div className="bg-card border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Rate Limiting</h2>

            <div className="space-y-4">
              <Input
                label="Requests per Minute"
                type="number"
                value={String(formData.rateLimitPerMinute)}
                onChange={(value) => setFormData({ ...formData, rateLimitPerMinute: Number(value) })}
                min={1}
                max={100}
              />

              <Input
                label="Requests per Hour"
                type="number"
                value={String(formData.rateLimitPerHour)}
                onChange={(value) => setFormData({ ...formData, rateLimitPerHour: Number(value) })}
                min={1}
                max={1000}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-foreground/60">
              Upload custom documents to enhance the AI's knowledge base
            </p>
            <Button onClick={handleCreateKBDoc}>
              <Plus className="w-4 h-4" />
              Add Document
            </Button>
          </div>

          {kbDocuments.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center text-foreground/60">
              No custom knowledge base documents yet
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kbDocuments.map((doc) => (
                    <tr key={doc.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-foreground/60 line-clamp-1">
                              {doc.content.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            doc.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {doc.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditKBDoc(doc)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteKBDoc(doc.id)}
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
        </div>
      )}

      {activeTab === "prompts" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Custom System Prompts</h2>
            <p className="text-sm text-foreground/60 mb-4">
              Leave empty to use default prompts. Use placeholders to inject dynamic data:
            </p>
            
            <div className="bg-muted p-3 rounded mb-4 text-sm font-mono">
              <div><strong>Available placeholders:</strong></div>
              <div className="ml-4 mt-2">
                <div>• <code>{"{brand}"}</code> - Brand name from settings</div>
                <div>• <code>{"{knowledge}"}</code> - Full knowledge base (posts, products, services, etc.)</div>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                label="Indonesian Prompt"
                value={formData.systemPromptId}
                onChange={(value) => setFormData({ ...formData, systemPromptId: value })}
                rows={6}
                placeholder="Anda adalah asisten virtual untuk {brand}. Gunakan basis pengetahuan berikut:\n\n{knowledge}\n\nInstruksi: ..."
              />

              <Textarea
                label="English Prompt"
                value={formData.systemPromptEn}
                onChange={(value) => setFormData({ ...formData, systemPromptEn: value })}
                rows={6}
                placeholder="You are a virtual assistant for {brand}. Use the following knowledge base:\n\n{knowledge}\n\nInstructions: ..."
              />

              <Textarea
                label="Arabic Prompt"
                value={formData.systemPromptAr}
                onChange={(value) => setFormData({ ...formData, systemPromptAr: value })}
                rows={6}
                placeholder="أنت مساعد افتراضي لـ {brand}. استخدم قاعدة المعرفة التالية:\n\n{knowledge}\n\nالتعليمات: ..."
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The GROQ_API_KEY should be configured in Settings → Secrets
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Prompts"}
            </Button>
          </div>
        </form>
      )}

      <Modal
        isOpen={isKBFormOpen}
        onClose={() => setIsKBFormOpen(false)}
        title={editingKBDoc ? "Edit Knowledge Base Document" : "Add Knowledge Base Document"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={kbForm.title}
            onChange={(value) => setKbForm({ ...kbForm, title: value })}
            required
          />

          <Select
            label="Category"
            value={kbForm.category}
            onChange={(value) => setKbForm({ ...kbForm, category: value })}
            options={[
              { value: "general", label: "General" },
              { value: "services", label: "Services" },
              { value: "products", label: "Products" },
              { value: "policies", label: "Policies" },
              { value: "faq", label: "FAQ" },
            ]}
          />

          <Input
            label="File URL (optional)"
            value={kbForm.fileUrl}
            onChange={(value) => setKbForm({ ...kbForm, fileUrl: value })}
            placeholder="https://example.com/document.pdf"
          />

          <Textarea
            label="Content"
            value={kbForm.content}
            onChange={(value) => setKbForm({ ...kbForm, content: value })}
            rows={10}
            placeholder="Enter the document content here..."
            required
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsKBFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveKBDoc} disabled={saving}>
              {saving ? "Saving..." : "Save Document"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
