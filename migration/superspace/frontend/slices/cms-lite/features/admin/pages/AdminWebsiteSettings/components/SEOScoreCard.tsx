/**
 * SEO Score Card
 * Display SEO analysis with visual grade
 */

import { TrendingUp, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SEOScore } from "../types";
import { getSEOGrade } from "../utils/seoAnalyzer";

interface SEOScoreCardProps {
  score: SEOScore;
  className?: string;
}

export function SEOScoreCard({ score, className }: SEOScoreCardProps) {
  const grade = getSEOGrade(score.overall);

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">SEO Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{grade.label}</span>
        </div>
      </div>

      {/* Overall Score - Large Circle */}
      <div className="flex flex-col items-center justify-center py-8 relative">
        {/* Circular Progress */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - score.overall / 100)}`}
              className={cn(
                "transition-all duration-1000 ease-out",
                score.overall >= 90 && "text-green-500",
                score.overall >= 80 && score.overall < 90 && "text-blue-500",
                score.overall >= 70 && score.overall < 80 && "text-yellow-500",
                score.overall >= 60 && score.overall < 70 && "text-orange-500",
                score.overall < 60 && "text-red-500"
              )}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-5xl font-bold", grade.color)}>{score.overall}</span>
            <span className="text-sm text-muted-foreground mt-1">/ 100</span>
            <span className={cn("text-3xl font-bold mt-2", grade.color)}>{grade.grade}</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Breakdown
        </h4>

        {Object.entries(score.breakdown).map(([key, data]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize font-medium">{key}</span>
              <span className="text-muted-foreground">{data.score}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  data.score >= 90 && "bg-green-500",
                  data.score >= 70 && data.score < 90 && "bg-blue-500",
                  data.score >= 50 && data.score < 70 && "bg-yellow-500",
                  data.score < 50 && "bg-red-500"
                )}
                style={{ width: `${data.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Suggestions
          </h4>
          <div className="space-y-2">
            {score.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
