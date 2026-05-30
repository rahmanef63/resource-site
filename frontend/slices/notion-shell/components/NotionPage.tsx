"use client";

/** <NotionPage /> — top-level page shell. Optional cover image band on
 *  top, then header (icon + title + actions slot), then body slot.
 *  Drop in any React surface, pass data + change handlers, plug your
 *  own block list into `children`.
 */

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotionHeader, type NotionHeaderProps } from "./NotionHeader";

export interface NotionPageProps {
  icon: string;
  title: string;
  onIconChange?: (icon: string) => void;
  onTitleChange?: (title: string) => void;
  /** Forwarded to NotionHeader — host-provided icon renderer. */
  renderIcon?: NotionHeaderProps["renderIcon"];
  /** Forwarded to NotionHeader — host-provided icon picker. */
  renderIconPicker?: NotionHeaderProps["renderIconPicker"];
  /** Right-side header actions slot (share / more / history). */
  actions?: NotionHeaderProps["actions"];
  /** Optional cover image URL. When set, renders a 200px image band
   *  above the header. `onCoverRemove` adds an X button on hover. */
  cover?: string;
  onCoverRemove?: () => void;
  /** Page body — your blocks list, database embed, etc. */
  children?: ReactNode;
  className?: string;
  /** Skip the header chrome (for embedded contexts). */
  headerless?: boolean;
}

export function NotionPage({
  icon, title,
  onIconChange, onTitleChange,
  renderIcon, renderIconPicker,
  actions, cover, onCoverRemove,
  children, className, headerless,
}: NotionPageProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {cover && (
        <div className="group/cover relative h-48 w-full shrink-0 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
          {onCoverRemove && (
            <Button
              variant="secondary"
              size="icon"
              aria-label="Remove cover"
              onClick={onCoverRemove}
              className="absolute right-3 top-3 h-7 w-7 opacity-0 transition group-hover/cover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
      {!headerless && (
        <NotionHeader
          icon={icon}
          title={title}
          onIconChange={onIconChange}
          onTitleChange={onTitleChange}
          renderIcon={renderIcon}
          renderIconPicker={renderIconPicker}
          actions={actions}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
