/**
 * Analytics Configuration Step
 * Configure Google Analytics, Facebook Pixel, and social media
 */

import { BarChart, Facebook, Twitter, Linkedin } from "lucide-react";
import { Input } from "../../../../../shared/components/Form";
import { cn } from "@/lib/utils";
import type { WebsiteSettings, ValidationErrors } from "../types";

interface AnalyticsStepProps {
  form: WebsiteSettings;
  setForm: (form: WebsiteSettings) => void;
  errors: ValidationErrors;
}

export function AnalyticsStep({ form, setForm, errors }: AnalyticsStepProps) {
  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Analytics Tracking
        </h3>

        {/* Google Analytics */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            Google Analytics ID
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <div className={cn(
            errors.googleAnalyticsId && "ring-2 ring-red-500 rounded-lg"
          )}>
            <Input
              value={form.googleAnalyticsId || ''}
              onChange={(value) => setForm({ ...form, googleAnalyticsId: value })}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
            />
          </div>
          {errors.googleAnalyticsId && (
            <p className="text-sm text-red-500">{errors.googleAnalyticsId}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Format: G-XXXXXXXXXX (GA4) or UA-XXXXXXXXX (Universal Analytics)
          </p>
        </div>

        {/* Facebook Pixel */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Facebook className="w-4 h-4" />
            Facebook Pixel ID
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <div className={cn(
            errors.facebookPixelId && "ring-2 ring-red-500 rounded-lg"
          )}>
            <Input
              value={form.facebookPixelId || ''}
              onChange={(value) => setForm({ ...form, facebookPixelId: value })}
              placeholder="123456789012345"
            />
          </div>
          {errors.facebookPixelId && (
            <p className="text-sm text-red-500">{errors.facebookPixelId}</p>
          )}
          <p className="text-xs text-muted-foreground">
            15-16 digit number from your Facebook Pixel
          </p>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <h3 className="text-lg font-semibold">Social Media Links</h3>

        {/* Twitter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Twitter className="w-4 h-4 text-blue-400" />
            Twitter/X Handle
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">@</span>
            <div className="flex-1">
              <Input
                value={form.twitterHandle || ''}
                onChange={(value) => setForm({ ...form, twitterHandle: value.replace('@', '') })}
                placeholder="username"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your Twitter/X username without the @ symbol
          </p>
        </div>

        {/* Facebook Page */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Facebook className="w-4 h-4 text-blue-600" />
            Facebook Page URL
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <Input
            value={form.facebookPage || ''}
            onChange={(value) => setForm({ ...form, facebookPage: value })}
            placeholder="https://facebook.com/yourpage"
          />
          <p className="text-xs text-muted-foreground">
            Full URL to your Facebook business page
          </p>
        </div>

        {/* LinkedIn Page */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Linkedin className="w-4 h-4 text-blue-700" />
            LinkedIn Page URL
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <Input
            value={form.linkedinPage || ''}
            onChange={(value) => setForm({ ...form, linkedinPage: value })}
            placeholder="https://linkedin.com/company/yourcompany"
          />
          <p className="text-xs text-muted-foreground">
            Full URL to your LinkedIn company page
          </p>
        </div>
      </div>

      {/* Analytics Tips */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
          📊 Analytics Best Practices
        </h4>
        <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
          <li>• Set up conversion tracking to measure goals</li>
          <li>• Monitor bounce rate and time on page</li>
          <li>• Use UTM parameters for campaign tracking</li>
          <li>• Review analytics weekly to spot trends</li>
          <li>• Connect social accounts for better engagement insights</li>
        </ul>
      </div>
    </div>
  );
}
