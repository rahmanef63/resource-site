/**
 * Domain Configuration Step
 * Configure subdomain or custom domain
 */

import { useState, useEffect } from "react";
import { Globe, CheckCircle, XCircle, Loader2, Copy, AlertTriangle } from "lucide-react";
import { Input, Select } from "../../../../../shared/components/Form";
import { Button } from "../../../../../shared/components/Button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import type { WebsiteSettings, ValidationErrors } from "../types";
import { validateSubdomain, validateUrl } from "../utils/validators";

interface DomainStepProps {
  form: WebsiteSettings;
  setForm: (form: WebsiteSettings) => void;
  workspaceId: any;
  domainVerified: boolean;
  setDomainVerified: (verified: boolean) => void;
  verifyDomainMutation: (domain: string) => Promise<{ verified: boolean }>;
  errors: ValidationErrors;
}

export function DomainStep({
  form,
  setForm,
  workspaceId,
  domainVerified,
  setDomainVerified,
  verifyDomainMutation,
  errors,
}: DomainStepProps) {
  const { toast } = useToast();
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  // Check subdomain availability
  const subdomainAvailable = useQuery(
    api.features.cmsLite.website_settings.api.queries.isSubdomainAvailable,
    checkingSubdomain && form.subdomain
      ? { subdomain: form.subdomain, excludeWorkspaceId: workspaceId }
      : "skip"
  );

  // Handle subdomain validation
  useEffect(() => {
    setSubdomainError(null);

    const formatError = validateSubdomain(form.subdomain);
    if (formatError) {
      setSubdomainError(formatError);
      setCheckingSubdomain(false);
      return;
    }

    const timer = setTimeout(() => {
      setCheckingSubdomain(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [form.subdomain]);

  useEffect(() => {
    if (checkingSubdomain && subdomainAvailable !== undefined) {
      if (!subdomainAvailable) {
        setSubdomainError("This subdomain is already taken");
      } else {
        setSubdomainError(null);
      }
      setCheckingSubdomain(false);
    }
  }, [subdomainAvailable, checkingSubdomain]);

  const handleVerifyDomain = async () => {
    if (!form.customDomain) {
      toast({
        title: "Please enter a custom domain",
        variant: "destructive",
      });
      return;
    }

    setVerifyingDomain(true);
    try {
      const result = await verifyDomainMutation(form.customDomain);
      setDomainVerified(result.verified);
      toast({
        title: "✅ Domain verified!",
        description: `${form.customDomain} is now active`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Verification failed",
        description: message || "Please check your DNS settings",
        variant: "destructive",
      });
      setDomainVerified(false);
    } finally {
      setVerifyingDomain(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const currentUrl = form.useCustomDomain && form.customDomain
    ? `https://${form.customDomain}`
    : `https://${form.subdomain || 'yoursite'}.superspace.app`;

  return (
    <div className="space-y-6">
      {/* Current URL Display */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Your Website URL</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-mono font-semibold text-foreground hover:text-primary transition-colors"
          >
            {currentUrl}
          </a>
          <Button aria-label="Copy"
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(currentUrl, "URL")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Domain Type Toggle */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useCustomDomain}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, useCustomDomain: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium">Use Custom Domain</span>
        </label>
      </div>

      {/* Subdomain or Custom Domain */}
      {!form.useCustomDomain ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Subdomain <span className="text-red-500">*</span>
          </label>
          <div className={cn(
            "relative",
            subdomainError && "ring-2 ring-red-500 rounded-lg"
          )}>
            <Input
              value={form.subdomain}
              onChange={(value) =>
                setForm({
                  ...form,
                  subdomain: value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                })
              }
              placeholder="myawesomesite"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingSubdomain ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : subdomainError ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : form.subdomain && !checkingSubdomain ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : null}
            </div>
          </div>
          {subdomainError ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {subdomainError}
            </p>
          ) : form.subdomain && !checkingSubdomain && subdomainAvailable ? (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Available: {form.subdomain}.superspace.app
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Your website will be accessible at: <strong>{form.subdomain || 'yoursite'}.superspace.app</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom Domain Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Custom Domain <span className="text-red-500">*</span>
            </label>
            <div className={cn(
              errors.customDomain && "ring-2 ring-red-500 rounded-lg"
            )}>
              <Input
                value={form.customDomain || ''}
                onChange={(value) => setForm({ ...form, customDomain: value })}
                placeholder="www.mysite.com"
              />
            </div>
            {errors.customDomain && (
              <p className="text-sm text-red-500">{errors.customDomain}</p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyDomain}
            disabled={verifyingDomain || !form.customDomain}
            variant={domainVerified ? "secondary" : "primary"}
          >
            {verifyingDomain ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : domainVerified ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Domain Verified
              </>
            ) : (
              "Verify Domain"
            )}
          </Button>

          {/* DNS Instructions */}
          {form.customDomain && !domainVerified && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Configure DNS Records
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                    Add these records to your domain's DNS settings:
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded p-2">
                      <div className="text-xs">
                        <strong>Type:</strong> A Record<br />
                        <strong>Value:</strong> 76.76.21.21
                      </div>
                      <Button aria-label="Copy"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("76.76.21.21", "IP Address")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded p-2">
                      <div className="text-xs">
                        <strong>Type:</strong> CNAME<br />
                        <strong>Value:</strong> cname.superspace.app
                      </div>
                      <Button aria-label="Copy"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("cname.superspace.app", "CNAME")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
