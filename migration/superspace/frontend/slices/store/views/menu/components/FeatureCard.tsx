import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Download, Eye, Package, Settings, Play, Lock } from "lucide-react";
import { getIconComponent } from "@/frontend/shared/ui";
import type { AvailableFeatureMenu } from "../types";
import { STATUS_BADGE_VARIANTS } from "../constants";

interface FeatureCardProps {
  feature: AvailableFeatureMenu;
  isInstalling?: boolean;
  onInstall?: (slug: string) => void;
  onPreview?: (slug: string) => void;
  onSettings?: (slug: string) => void;
  onAction?: (slug: string) => void;
  isPreviewActive?: boolean;
  isLocked?: boolean;
  onLockedClick?: (slug: string) => void;
}

export function FeatureCard({
  feature,
  isInstalling,
  onInstall,
  onPreview,
  onSettings,
  onAction,
  isPreviewActive,
  isLocked,
  onLockedClick,
}: FeatureCardProps) {
  const IconComponent = getIconComponent(feature.icon);
  const isNotReady = feature.isReady === false;
  const statusVariant = feature.status
    ? STATUS_BADGE_VARIANTS[feature.status]
    : "default";

  const handleCardClick = () => {
    if (isLocked && onLockedClick) {
      onLockedClick(feature.slug);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "transition-all duration-300 hover:shadow-lg group relative border-border/60",
          "hover:-translate-y-1 hover:border-primary/20",
          isPreviewActive && "ring-2 ring-primary border-primary shadow-sm",
          isLocked && "opacity-75 cursor-pointer bg-muted/20 grayscale-[0.1]"
        )}
        onClick={isLocked ? handleCardClick : undefined}
      >
        {/* Lock indicator */}
        {isLocked && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {IconComponent ? (
                <IconComponent className="h-5 w-5 text-primary" />
              ) : (
                <Package className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-base">{feature.name}</CardTitle>
            </div>

            {/* Hover Action Buttons - 3 buttons */}
            <div className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200",
              "bg-background/90 backdrop-blur-sm rounded-md p-1 border shadow-sm",
              "absolute right-3 top-3 translate-y-2 group-hover:translate-y-0"
            )}>
              {onSettings && !isLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button aria-label="Settings"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSettings(feature.slug);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              )}

              {onPreview && !isLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button aria-label="Show"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(feature.slug);
                      }}
                    >
                      <Eye className={`h-4 w-4 ${isPreviewActive ? 'text-primary' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>
              )}

              {onAction && !isLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button aria-label="Play"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(feature.slug);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Status badge (moved to separate row) */}
          {feature.status && !isLocked && (
            <div className="mt-2">
              <Badge variant={statusVariant} className="text-[10px] uppercase">
                {feature.status}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {feature.version && (
                <Badge variant="outline" className="text-xs">
                  v{feature.version}
                </Badge>
              )}
              {feature.category && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {feature.category}
                </Badge>
              )}
            </div>
            {feature.tags && feature.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {feature.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {isNotReady && feature.expectedRelease && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Expected: {feature.expectedRelease}
              </p>
            )}

            {!isLocked && onInstall && (
              <Button aria-label="Download"
                onClick={() => onInstall(feature.slug)}
                disabled={isInstalling}
                className="w-full"
                size="sm"
                variant={isNotReady ? "outline" : "default"}
              >
                {isInstalling ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Installing...
                  </>
                ) : isNotReady ? (
                  <>
                    <Download className="mr-2 h-3 w-3" />
                    Install (Dev)
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3 w-3" />
                    Install
                  </>
                )}
              </Button>
            )}

            {isLocked && (
              <Button
                onClick={handleCardClick}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <Lock className="mr-2 h-3 w-3" />
                Enter Password to Access
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
