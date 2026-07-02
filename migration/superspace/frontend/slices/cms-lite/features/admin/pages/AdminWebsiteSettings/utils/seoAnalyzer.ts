/**
 * SEO Analyzer - Calculate SEO Score
 * Based on best practices and industry standards
 */

import type { WebsiteSettings, SEOScore } from "../types";

export function analyzeSEO(settings: WebsiteSettings): SEOScore {
  const scores: number[] = [];
  const suggestions: string[] = [];

  // 1. Title Analysis (25 points)
  const titleScore = analyzeTitleTag(settings.siteTitle, suggestions);
  
  // 2. Description Analysis (25 points)
  const descScore = analyzeDescription(settings.siteDescription, suggestions);
  
  // 3. Keywords Analysis (15 points)
  const keywordsScore = analyzeKeywords(settings.keywords, suggestions);
  
  // 4. Images/OG Analysis (20 points)
  const imagesScore = analyzeImages(settings, suggestions);
  
  // 5. Social Media Analysis (15 points)
  const socialScore = analyzeSocialMedia(settings, suggestions);

  const overall = Math.round(
    titleScore.score * 0.25 +
    descScore.score * 0.25 +
    keywordsScore.score * 0.15 +
    imagesScore.score * 0.20 +
    socialScore.score * 0.15
  );

  return {
    overall,
    breakdown: {
      title: titleScore,
      description: descScore,
      keywords: keywordsScore,
      images: imagesScore,
      social: socialScore,
    },
    suggestions,
  };
}

// Title Tag Analysis
function analyzeTitleTag(
  title: string,
  suggestions: string[]
): { score: number; message: string } {
  if (!title || title.trim().length === 0) {
    suggestions.push("Add a title tag - it's essential for SEO");
    return { score: 0, message: "No title tag" };
  }

  const length = title.length;

  // Optimal: 50-60 characters
  if (length < 30) {
    suggestions.push("Title is too short. Aim for 50-60 characters");
    return { score: 50, message: "Title too short" };
  }

  if (length > 70) {
    suggestions.push("Title is too long. Google truncates after ~60 characters");
    return { score: 70, message: "Title too long" };
  }

  // Check for brand/keyword
  const hasKeywords = /\w{4,}/.test(title);
  if (!hasKeywords) {
    suggestions.push("Include relevant keywords in your title");
    return { score: 60, message: "Add keywords to title" };
  }

  if (length >= 50 && length <= 60) {
    return { score: 100, message: "Perfect title length" };
  }

  return { score: 85, message: "Good title" };
}

// Meta Description Analysis
function analyzeDescription(
  description: string,
  suggestions: string[]
): { score: number; message: string } {
  if (!description || description.trim().length === 0) {
    suggestions.push("Add a meta description to improve click-through rates");
    return { score: 0, message: "No meta description" };
  }

  const length = description.length;

  // Optimal: 120-160 characters
  if (length < 70) {
    suggestions.push("Description is too short. Aim for 120-160 characters");
    return { score: 50, message: "Description too short" };
  }

  if (length > 160) {
    suggestions.push("Description exceeds 160 characters and will be truncated");
    return { score: 60, message: "Description too long" };
  }

  // Check for call-to-action
  const hasCTA = /(learn|discover|explore|get|find|shop|buy|start|try)/i.test(description);
  
  if (length >= 120 && length <= 160) {
    if (hasCTA) {
      return { score: 100, message: "Perfect description with CTA" };
    }
    return { score: 90, message: "Good description" };
  }

  return { score: 75, message: "Decent description" };
}

// Keywords Analysis
function analyzeKeywords(
  keywords: string | undefined,
  suggestions: string[]
): { score: number; message: string } {
  if (!keywords || keywords.trim().length === 0) {
    suggestions.push("Add relevant keywords to improve discoverability");
    return { score: 50, message: "No keywords" };
  }

  const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

  if (keywordList.length === 0) {
    suggestions.push("Add at least 3-5 relevant keywords");
    return { score: 50, message: "No valid keywords" };
  }

  if (keywordList.length < 3) {
    suggestions.push("Add more keywords (aim for 5-10)");
    return { score: 60, message: "Too few keywords" };
  }

  if (keywordList.length > 15) {
    suggestions.push("Too many keywords - focus on 5-10 most relevant");
    return { score: 70, message: "Too many keywords" };
  }

  // Check for long-tail keywords (2+ words)
  const longTailCount = keywordList.filter(k => k.split(' ').length >= 2).length;
  const longTailRatio = longTailCount / keywordList.length;

  if (longTailRatio >= 0.5) {
    return { score: 100, message: "Excellent keyword strategy" };
  }

  if (longTailRatio >= 0.3) {
    return { score: 85, message: "Good keyword mix" };
  }

  suggestions.push("Consider adding long-tail keywords (2-3 word phrases)");
  return { score: 70, message: "Add long-tail keywords" };
}

// Images/OG Analysis
function analyzeImages(
  settings: WebsiteSettings,
  suggestions: string[]
): { score: number; message: string } {
  let score = 0;
  const checks = [];

  // Favicon (20 points)
  if (settings.favicon && isValidUrl(settings.favicon)) {
    score += 20;
    checks.push("favicon");
  } else {
    suggestions.push("Add a favicon to improve brand recognition");
  }

  // OG Image (80 points - most important)
  if (settings.ogImage && isValidUrl(settings.ogImage)) {
    score += 80;
    checks.push("og-image");
    
    // Check if optimal dimensions mentioned (1200x630)
    if (settings.siteDescription?.includes("1200") || settings.siteDescription?.includes("630")) {
      suggestions.push("OG image looks good! Ensure it's 1200x630px");
    }
  } else {
    suggestions.push("Add an Open Graph image (1200x630px) for social media sharing");
  }

  if (score === 0) {
    return { score: 0, message: "No images configured" };
  }

  if (score === 20) {
    return { score: 20, message: "Add OG image" };
  }

  if (score === 100) {
    return { score: 100, message: "All images configured" };
  }

  return { score, message: "Images partially configured" };
}

// Social Media Analysis
function analyzeSocialMedia(
  settings: WebsiteSettings,
  suggestions: string[]
): { score: number; message: string } {
  let score = 0;
  let count = 0;

  if (settings.twitterHandle) {
    score += 33;
    count++;
  }

  if (settings.facebookPage) {
    score += 33;
    count++;
  }

  if (settings.linkedinPage) {
    score += 34;
    count++;
  }

  if (count === 0) {
    suggestions.push("Connect social media accounts to expand your reach");
    return { score: 30, message: "No social media links" };
  }

  if (count === 1) {
    suggestions.push("Add more social media profiles for better engagement");
    return { score, message: "Add more social profiles" };
  }

  if (count === 2) {
    return { score, message: "Good social presence" };
  }

  return { score: 100, message: "Excellent social coverage" };
}

// Helper: Validate URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

// Get SEO Grade
export function getSEOGrade(score: number): {
  grade: string;
  color: string;
  label: string;
} {
  if (score >= 90) {
    return { grade: "A", color: "text-green-600", label: "Excellent" };
  }
  if (score >= 80) {
    return { grade: "B", color: "text-blue-600", label: "Good" };
  }
  if (score >= 70) {
    return { grade: "C", color: "text-yellow-600", label: "Fair" };
  }
  if (score >= 60) {
    return { grade: "D", color: "text-orange-600", label: "Needs Work" };
  }
  return { grade: "F", color: "text-red-600", label: "Poor" };
}
