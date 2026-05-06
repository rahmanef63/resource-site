import { Users } from "lucide-react";
import Image from "next/image";
import type { CommonGroup } from "../types";

type GroupsSectionProps = {
  isMobile: boolean;
  groups?: CommonGroup[];
  isLoading?: boolean;
};

export function GroupsSection({ isMobile, groups, isLoading }: GroupsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="h-14 rounded-wa-lg border border-wa-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className={isMobile ? "py-8 text-center" : "py-12 text-center"}>
        <Users
          className={[
            "mx-auto text-wa-muted",
            isMobile ? "h-12 w-12" : "h-16 w-16",
          ].join(" ")}
        />
        <p className={isMobile ? "text-base text-wa-muted" : "text-lg text-wa-muted"}>
          No groups in common
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-wa-text">
          Groups in common ({groups.length})
        </h3>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
          >
            <div
              className={[
                "relative flex-shrink-0 overflow-hidden rounded-full bg-wa-muted",
                isMobile ? "h-10 w-10" : "h-12 w-12",
              ].join(" ")}
            >
              {group.avatar ? (
                <Image
                  src={group.avatar}
                  alt={group.name}
                  fill
                  className="object-cover"
                  sizes={isMobile ? "40px" : "48px"}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-wa-text">{group.name}</p>
              <p className="text-sm text-wa-muted">
                {group.members} members
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
