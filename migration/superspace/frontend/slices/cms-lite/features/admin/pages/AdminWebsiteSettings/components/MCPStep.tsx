/**
 * MCP Step Component
 * Configure Model Context Protocol for AI-driven website editing
 */

import { useState } from "react";
import { Input } from "../../../../../shared/components/Form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Sparkles, Lock, Zap, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebsiteSettings, ValidationErrors } from "../types";

interface MCPStepProps {
  form: WebsiteSettings;
  setForm: (form: WebsiteSettings) => void;
  errors: ValidationErrors;
}

const ALLOWED_ACTIONS = [
  { id: 'edit-content', label: 'Edit Content', description: 'AI can modify text, images, and media' },
  { id: 'update-styles', label: 'Update Styles', description: 'AI can change colors, fonts, and spacing' },
  { id: 'modify-layout', label: 'Modify Layout', description: 'AI can rearrange components and sections' },
];

export function MCPStep({ form, setForm, errors }: MCPStepProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleAction = (actionId: string) => {
    const current = form.mcpAllowedActions || [];
    const updated = current.includes(actionId)
      ? current.filter(a => a !== actionId)
      : [...current, actionId];
    setForm({ ...form, mcpAllowedActions: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 dark:from-purple-500/20 dark:via-blue-500/20 dark:to-pink-500/20 border border-purple-500/20 dark:border-purple-400/30 rounded-lg">
        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            AI-Powered Website Editing
          </h3>
          <p className="text-sm text-muted-foreground">
            Enable Model Context Protocol (MCP) to let AI Copilot directly edit your website elements.
            AI can understand context and make intelligent modifications based on your instructions.
          </p>
        </div>
      </div>

      {/* Enable MCP Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="mcp-enabled" className="text-base font-semibold cursor-pointer">
              Enable MCP
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow AI to make real-time changes to your website
            </p>
          </div>
        </div>
        <Switch
          id="mcp-enabled"
          checked={form.mcpEnabled || false}
          onCheckedChange={(checked: boolean) => setForm({ ...form, mcpEnabled: checked })}
        />
      </div>

      {form.mcpEnabled && (
        <>
          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="mcp-api-key" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              MCP API Key
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={form.mcpApiKey || ""}
                onChange={(value) => setForm({ ...form, mcpApiKey: value })}
                placeholder="mcp_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <button aria-label="Show"
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            {errors.mcpApiKey && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.mcpApiKey}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://modelcontextprotocol.io/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MCP Dashboard
              </a>
            </p>
          </div>

          {/* Allowed Actions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Allowed AI Actions
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Select which types of changes AI is allowed to make to your website
            </p>
            
            <div className="space-y-2">
              {ALLOWED_ACTIONS.map((action) => {
                const isChecked = (form.mcpAllowedActions || []).includes(action.id);
                
                return (
                  <div
                    key={action.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                      isChecked
                        ? "bg-primary/5 dark:bg-primary/10 border-primary/30 dark:border-primary/40"
                        : "bg-muted/20 dark:bg-muted/10 border-border/50 hover:border-border"
                    )}
                    onClick={() => toggleAction(action.id)}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAction(action.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-Approve Toggle */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/30 dark:border-yellow-400/40 rounded-lg">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="mcp-auto-approve" className="text-sm font-semibold cursor-pointer">
                  Auto-Approve AI Changes
                  <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
                </Label>
                <Switch
                  id="mcp-auto-approve"
                  checked={form.mcpAutoApprove || false}
                  onCheckedChange={(checked: boolean) => setForm({ ...form, mcpAutoApprove: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, AI changes are applied immediately without requiring manual approval.
                <span className="font-semibold text-yellow-700 dark:text-yellow-300 ml-1">
                  Use with caution on production sites.
                </span>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-400/40 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Security & Privacy</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• All AI actions are logged and can be reverted</li>
                <li>• Your API key is encrypted and never shared</li>
                <li>• AI only accesses content you explicitly allow</li>
                <li>• You can disable MCP at any time</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
