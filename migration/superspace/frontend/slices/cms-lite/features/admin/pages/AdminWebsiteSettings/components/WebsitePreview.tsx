/**
 * Live Website Preview
 * Shows how the website will look with current settings
 * Includes compact SEO summary for quick reference
 */

import { ExternalLink, Globe, TrendingUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { WebsiteSettings, SEOScore } from "../types";
import { getSEOGrade } from "../utils/seoAnalyzer";

interface WebsitePreviewProps {
  settings: WebsiteSettings;
  seoScore?: SEOScore;
  className?: string;
}

export function WebsitePreview({ settings, seoScore, className }: WebsitePreviewProps) {
  const currentUrl = settings.useCustomDomain && settings.customDomain
    ? `https://${settings.customDomain}`
    : `https://${settings.subdomain || 'yoursite'}.superspace.app`;

  const grade = seoScore ? getSEOGrade(seoScore.overall) : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* SEO Summary Bar - Compact */}
      {seoScore && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-primary/20 dark:border-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">SEO Health</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: grade?.color }}>
                {seoScore.overall}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: grade?.color + '20',
                  color: grade?.color,
                }}
              >
                {grade?.grade}
              </span>
            </div>
          </div>
          
          {/* Compact Progress Bars */}
          <div className="space-y-2">
            {Object.entries(seoScore.breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize w-20 flex-shrink-0">
                  {key}
                </span>
                <div className="flex-1 h-1.5 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${value.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">
                  {value.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Website Preview */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-muted/50 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded px-3 py-1.5 mx-2">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{currentUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-[400px]">
        {/* Favicon + Title */}
          <div className="flex items-start gap-3">
          {settings.favicon ? (
            <Image
              src={settings.favicon}
              alt="Favicon"
              width={32}
              height={32}
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E";
              }}
              sizes="32px"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {settings.siteTitle || "Your Website Title"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentUrl}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-muted-foreground leading-relaxed">
            {settings.siteDescription || "Your website description will appear here. It should be compelling and descriptive to attract visitors."}
          </p>
        </div>

        {/* Keywords Tags */}
        {settings.keywords && (
          <div className="flex flex-wrap gap-2">
            {settings.keywords.split(',').map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {keyword.trim()}
              </span>
            ))}
          </div>
        )}

        {/* OG Image Preview */}
        {settings.ogImage && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Open Graph Image
            </p>
            <div className="relative aspect-[1.91/1] rounded-lg overflow-hidden border border-border bg-muted">
              <Image
                src={settings.ogImage}
                alt="OG Preview"
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </div>
        )}

        {/* Social Links */}
        {(settings.twitterHandle || settings.facebookPage || settings.linkedinPage) && (
          <div className="flex gap-3 pt-4 border-t border-border">
            {settings.twitterHandle && (
              <a
                href={`https://twitter.com/${settings.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {settings.facebookPage && (
              <a
                href={settings.facebookPage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {settings.linkedinPage && (
              <a
                href={settings.linkedinPage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
