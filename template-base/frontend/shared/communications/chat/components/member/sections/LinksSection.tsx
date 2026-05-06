import { Link as LinkIcon } from "lucide-react";
import type { SharedLinkItem } from "../types";

type LinksSectionProps = {
  isMobile: boolean;
  links?: SharedLinkItem[];
  isLoading?: boolean;
};

function extractHost(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    try {
      return new URL(`https://${url}`).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }
}

export function LinksSection({ isMobile, links, isLoading }: LinksSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="h-16 rounded-wa-lg border border-wa-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className={isMobile ? "py-6 text-center" : "py-8 text-center"}>
        <LinkIcon className={isMobile ? "mx-auto h-10 w-10 text-wa-muted" : "mx-auto h-12 w-12 text-wa-muted"} />
        <p className="mt-3 text-sm text-wa-muted">No links shared yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-start gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
        >
          <div
            className={[
              "flex-shrink-0 overflow-hidden rounded-wa-lg bg-primary text-primary-foreground",
              isMobile ? "h-12 w-16" : "h-12 w-20",
            ].join(" ")}
          >
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
              {extractHost(link.url).split(".")[0]}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium text-wa-text">{link.title ?? extractHost(link.url)}</p>
            <p className="text-sm text-wa-muted">{link.url}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
