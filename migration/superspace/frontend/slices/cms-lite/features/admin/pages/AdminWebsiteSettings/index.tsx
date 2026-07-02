/**
 * Website Settings - Main Component
 * Multi-step form with tabbed preview (Preview/SEO) and auto-switching
 */

import { useState, useEffect } from "react";
import { useWebsiteSettings } from "../../../../shared/hooks/useWebsiteSettings";
import { useWorkspaceId } from "../../../../shared/hooks/useWorkspaceId";
import { Button } from "../../../../shared/components/Button";
import { Save, ChevronLeft, ChevronRight, Globe, FileText, BarChart, Code, Sparkles } from "lucide-react";
import ErrorBoundary from "../../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../../shared/utils/logger";

// Components
import { ProgressBar } from "./components/ProgressBar";
import { DomainStep } from "./components/DomainStep";
import { SEOStep } from "./components/SEOStep";
import { AnalyticsStep } from "./components/AnalyticsStep";
import { AdvancedStep } from "./components/AdvancedStep";
import { MCPStep } from "./components/MCPStep";
import { WebsitePreview } from "./components/WebsitePreview";
import { SEOScoreCard } from "./components/SEOScoreCard";
import { RightPanelTabs } from "./components/RightPanelTabs";

// Types & Utils
import type { WebsiteSettings, ValidationErrors, FormStep, StepConfig, RightPanelTab } from "./types";
import { analyzeSEO } from "./utils/seoAnalyzer";
import {
  validateSubdomain,
  validateUrl,
  validateGoogleAnalyticsId,
  validateFacebookPixelId,
  validateMaxLength,
  validateRequired,
} from "./utils/validators";

const STEPS: StepConfig[] = [
  {
    id: 'domain',
    title: 'Domain',
    description: 'Configure your website domain',
    icon: Globe,
    fields: ['subdomain', 'customDomain', 'useCustomDomain'],
  },
  {
    id: 'seo',
    title: 'SEO',
    description: 'Optimize for search engines',
    icon: FileText,
    fields: ['siteTitle', 'siteDescription', 'keywords', 'favicon', 'ogImage'],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track and engage',
    icon: BarChart,
    fields: ['googleAnalyticsId', 'facebookPixelId', 'twitterHandle', 'facebookPage', 'linkedinPage'],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Custom code & settings',
    icon: Code,
    fields: ['robotsTxt', 'customCss', 'customHeadCode'],
  },
  {
    id: 'mcp',
    title: 'AI (MCP)',
    description: 'AI-powered editing',
    icon: Sparkles,
    fields: ['mcpEnabled', 'mcpApiKey', 'mcpAllowedActions', 'mcpAutoApprove'],
  },
];

export default function AdminWebsiteSettings() {
  const { toast } = useToast();
  const workspaceId = useWorkspaceId();
  
  const { settings, loading, updateSettings, verifyDomain: verifyDomainMutation } = useWebsiteSettings(
    workspaceId
  );
  
  const [currentStep, setCurrentStep] = useState<FormStep>('domain');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('preview');
  const [form, setForm] = useState<WebsiteSettings>({
    subdomain: "",
    useCustomDomain: false,
    siteTitle: "",
    siteDescription: "",
    customDomain: "",
    keywords: "",
    favicon: "",
    ogImage: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
    twitterHandle: "",
    facebookPage: "",
    linkedinPage: "",
    robotsTxt: "User-agent: *\nAllow: /",
    customCss: "",
    customHeadCode: "",
    mcpEnabled: false,
    mcpApiKey: "",
    mcpAllowedActions: [],
    mcpAutoApprove: false,
  });
  
  const [saving, setSaving] = useState(false);
  const [domainVerified, setDomainVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Load settings
  useEffect(() => {
    if (settings) {
      logger.loaded("website settings", "Convex");
      setForm({
        customDomain: settings.customDomain || "",
        subdomain: settings.subdomain || "yoursite",
        useCustomDomain: settings.useCustomDomain || false,
        siteTitle: settings.siteTitle || "",
        siteDescription: settings.siteDescription || "",
        keywords: settings.keywords || "",
        favicon: settings.favicon || "",
        ogImage: settings.ogImage || "",
        googleAnalyticsId: settings.googleAnalyticsId || "",
        facebookPixelId: settings.facebookPixelId || "",
        twitterHandle: settings.twitterHandle || "",
        facebookPage: settings.facebookPage || "",
        linkedinPage: settings.linkedinPage || "",
        robotsTxt: settings.robotsTxt || "User-agent: *\nAllow: /",
        customCss: settings.customCss || "",
        customHeadCode: settings.customHeadCode || "",
        mcpEnabled: settings.mcpEnabled || false,
        mcpApiKey: settings.mcpApiKey || "",
        mcpAllowedActions: settings.mcpAllowedActions || [],
        mcpAutoApprove: settings.mcpAutoApprove || false,
      });
      setDomainVerified(settings.domainVerified || false);
    }
  }, [settings]);

  // Auto-switch right panel tab based on step
  useEffect(() => {
    if (currentStep === 'seo') {
      setRightPanelTab('seo');
    } else if (currentStep === 'domain' || currentStep === 'analytics') {
      setRightPanelTab('preview');
    }
    // For 'advanced' and 'mcp', let user choose manually (don't auto-switch)
  }, [currentStep]);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [
    form.subdomain,
    form.customDomain,
    form.useCustomDomain,
    form.siteTitle,
    form.siteDescription,
    form.favicon,
    form.ogImage,
    form.googleAnalyticsId,
    form.facebookPixelId,
    form.mcpEnabled,
    form.mcpApiKey,
    domainVerified,
  ]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Required fields
    if (!form.subdomain && !form.useCustomDomain) {
      errors.subdomain = "Subdomain is required";
    }

    if (!form.useCustomDomain && form.subdomain) {
      const subdomainErr = validateSubdomain(form.subdomain);
      if (subdomainErr) errors.subdomain = subdomainErr;
    }

    if (form.useCustomDomain) {
      const domainErr = validateUrl(form.customDomain || "", "Custom domain");
      if (domainErr) errors.customDomain = domainErr;
      if (!domainVerified) errors.customDomain = "Custom domain must be verified";
    }

    // SEO validations
    const titleErr = validateRequired(form.siteTitle, "Site title");
    if (titleErr) errors.siteTitle = titleErr;

    const descErr = validateRequired(form.siteDescription, "Site description");
    if (descErr) errors.siteDescription = descErr;

    const descLengthErr = validateMaxLength(form.siteDescription, 160, "Description");
    if (descLengthErr) errors.siteDescription = descLengthErr;

    // URL validations
    const faviconErr = validateUrl(form.favicon || "", "Favicon URL");
    if (faviconErr) errors.favicon = faviconErr;

    const ogImageErr = validateUrl(form.ogImage || "", "OG Image URL");
    if (ogImageErr) errors.ogImage = ogImageErr;

    // Analytics validations
    const gaErr = validateGoogleAnalyticsId(form.googleAnalyticsId || "");
    if (gaErr) errors.googleAnalyticsId = gaErr;

    const fbErr = validateFacebookPixelId(form.facebookPixelId || "");
    if (fbErr) errors.facebookPixelId = fbErr;

    // MCP validations
    if (form.mcpEnabled) {
      const mcpKeyErr = validateRequired(form.mcpApiKey || "", "MCP API Key");
      if (mcpKeyErr) errors.mcpApiKey = mcpKeyErr;
      
      if (!form.mcpAllowedActions || form.mcpAllowedActions.length === 0) {
        errors.mcpAllowedActions = "Please select at least one allowed action";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!workspaceId) {
      toast({
        title: "No workspace found",
        description: "Please make sure you're logged in",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    logger.save("website settings", "Convex", form);
    
    try {
      await updateSettings(form);
      logger.saved("website settings", "Convex");
      toast({ 
        title: "✅ Settings saved!",
        description: "Your website settings have been updated",
      });
      setValidationErrors({});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("save", "website settings", err);
      toast({
        title: "Failed to save",
        description: message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Calculate SEO Score
  const seoScore = analyzeSEO(form);

  if (!workspaceId || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!workspaceId ? "Loading workspace..." : "Loading settings..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-muted-foreground">
            Configure your website domain, SEO, analytics, and more
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          steps={STEPS}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">{STEPS[currentStepIndex].title}</h2>
                <p className="text-sm text-muted-foreground">{STEPS[currentStepIndex].description}</p>
              </div>

              {/* Render Current Step */}
              {currentStep === 'domain' && (
                <DomainStep
                  form={form}
                  setForm={setForm}
                  workspaceId={workspaceId}
                  domainVerified={domainVerified}
                  setDomainVerified={setDomainVerified}
                  verifyDomainMutation={verifyDomainMutation}
                  errors={validationErrors}
                />
              )}

              {currentStep === 'seo' && (
                <SEOStep
                  form={form}
                  setForm={setForm}
                  errors={validationErrors}
                />
              )}

              {currentStep === 'analytics' && (
                <AnalyticsStep
                  form={form}
                  setForm={setForm}
                  errors={validationErrors}
                />
              )}

              {currentStep === 'advanced' && (
                <AdvancedStep
                  form={form}
                  setForm={setForm}
                />
              )}

              {currentStep === 'mcp' && (
                <MCPStep
                  form={form}
                  setForm={setForm}
                  errors={validationErrors}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
                disabled={isFirstStep}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {isLastStep ? (
                  <Button aria-label="Save"
                    onClick={handleSave}
                    disabled={saving || Object.keys(validationErrors).length > 0}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={goToNextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tabbed Preview & SEO */}
          <div className="space-y-4">
            <RightPanelTabs
              activeTab={rightPanelTab}
              onTabChange={setRightPanelTab}
              previewContent={<WebsitePreview settings={form} seoScore={seoScore} />}
              seoContent={<SEOScoreCard score={seoScore} />}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
