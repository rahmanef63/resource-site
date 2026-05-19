"use client";

/** <NotionPage /> — top-level page shell. Header + body slot. Drop in
 *  any React surface, pass data + change handlers, plug your own block
 *  list into `children`. Cover support is intentionally omitted in
 *  this rr lift — host renders its own cover above NotionPage when
 *  needed.
 */

import type { ReactNode } from "react";
import { NotionHeader, type NotionHeaderProps } from "./NotionHeader";
import { cn } from "rahman-shared/lib/utils";

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
  actions, children, className, headerless,
}: NotionPageProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
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
