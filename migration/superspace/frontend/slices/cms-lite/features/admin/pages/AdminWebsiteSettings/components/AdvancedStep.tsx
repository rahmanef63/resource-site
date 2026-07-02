/**
 * Advanced Configuration Step
 * Configure robots.txt, custom CSS, and custom head code
 */

import { Code, FileCode, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "../types";

interface AdvancedStepProps {
  form: WebsiteSettings;
  setForm: (form: WebsiteSettings) => void;
}

export function AdvancedStep({ form, setForm }: AdvancedStepProps) {
  return (
    <div className="space-y-6">
      {/* Robots.txt */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Shield className="w-4 h-4 text-primary" />
          Robots.txt
          <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <textarea
          value={form.robotsTxt || ''}
          onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })}
          placeholder="User-agent: *&#10;Allow: /"
          rows={6}
          className="w-full px-3 py-2 border border-input rounded-md bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Control how search engines crawl your site
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer text-primary hover:underline">
            View robots.txt examples
          </summary>
          <div className="mt-2 p-3 bg-muted/50 rounded space-y-2">
            <div>
              <strong>Allow all crawlers:</strong>
              <pre className="mt-1 p-2 bg-background rounded text-[10px]">
User-agent: *{'\n'}Allow: /
              </pre>
            </div>
            <div>
              <strong>Block specific paths:</strong>
              <pre className="mt-1 p-2 bg-background rounded text-[10px]">
User-agent: *{'\n'}Allow: /{'\n'}Disallow: /admin/{'\n'}Disallow: /private/
              </pre>
            </div>
          </div>
        </details>
      </div>

      {/* Custom CSS */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileCode className="w-4 h-4 text-primary" />
          Custom CSS
          <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <textarea
          value={form.customCss || ''}
          onChange={(e) => setForm({ ...form, customCss: e.target.value })}
          placeholder="/* Your custom CSS here */"
          rows={8}
          className="w-full px-3 py-2 border border-input rounded-md bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Add custom styling to your website
        </p>
        <div className="flex gap-2 text-xs">
          <span className="text-amber-600 dark:text-amber-400">⚠️</span>
          <p className="text-muted-foreground">
            Advanced users only. Invalid CSS may break your website styling.
          </p>
        </div>
      </div>

      {/* Custom Head Code */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Code className="w-4 h-4 text-primary" />
          Custom Head Code
          <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <textarea
          value={form.customHeadCode || ''}
          onChange={(e) => setForm({ ...form, customHeadCode: e.target.value })}
          placeholder="<!-- Custom meta tags, scripts, etc. -->"
          rows={8}
          className="w-full px-3 py-2 border border-input rounded-md bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Add custom HTML to the {'<head>'} section (meta tags, scripts, etc.)
        </p>
        <div className="flex gap-2 text-xs">
          <span className="text-red-600 dark:text-red-400">🔒</span>
          <p className="text-muted-foreground">
            Use with caution. Only add code from trusted sources.
          </p>
        </div>
      </div>

      {/* Advanced Tips */}
      <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          ⚙️ Advanced Configuration Tips
        </h4>
        <ul className="text-xs text-gray-800 dark:text-gray-200 space-y-1">
          <li>• Test custom code in a staging environment first</li>
          <li>• Keep robots.txt simple and focused</li>
          <li>• Use custom CSS for brand-specific styling</li>
          <li>• Add verification meta tags in custom head code</li>
          <li>• Always validate HTML/CSS before deploying</li>
        </ul>
      </div>
    </div>
  );
}
