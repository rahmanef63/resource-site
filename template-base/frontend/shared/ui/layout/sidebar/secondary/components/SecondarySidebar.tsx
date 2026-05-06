import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SecondarySidebarItem {
  id: string | number;
  label: string;
  icon?: React.ElementType;
  badge?: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export interface SecondarySidebarSectionProps {
  id?: string;
  title?: string;
  icon?: React.ElementType;
  description?: ReactNode;
  action?: ReactNode;
  items?: SecondarySidebarItem[];
  content?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export interface SecondarySidebarProps {
  sections?: SecondarySidebarSectionProps[];
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  variant?: "panel" | "minimal";
}

function SecondarySidebarListItem({
  label,
  icon: Icon,
  badge,
  description,
  trailing,
  href,
  onClick,
  disabled,
  active,
  className,
}: SecondarySidebarItem) {
  const content = (
    <div className="flex w-full items-center gap-2">
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <div className="flex flex-1 flex-col overflow-hidden text-left">
        <span className="truncate text-sm font-medium">{label}</span>
        {description ? (
          <span className="truncate text-xs text-muted-foreground">{description}</span>
        ) : null}
      </div>
      {badge ? <span className="shrink-0">{badge}</span> : null}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );

  const buttonClass = cn(
    "w-full justify-start px-2 py-2 text-sm",
    description ? "items-start gap-3" : "items-center gap-2",
    className,
  );

  if (href) {
    return (
      <Button
        asChild
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className={buttonClass}
        disabled={disabled}
      >
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </Button>
  );
}

function SecondarySidebarSection({
  title,
  icon: Icon,
  description,
  action,
  items,
  content,
  footer,
  className,
  variant,
}: SecondarySidebarSectionProps & { variant: "panel" | "minimal" }) {
  return (
    <section className={cn(variant === "minimal" ? "space-y-2" : "space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
            {title ? <span>{title}</span> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
      {content}
      {items ? (
        <div className="space-y-1">
          {items.map((item) => (
            <SecondarySidebarListItem key={item.id ?? item.label} {...item} />
          ))}
        </div>
      ) : null}
      {footer}
    </section>
  );
}

export function SecondarySidebar({
  sections = [],
  header,
  footer,
  className,
  headerClassName,
  footerClassName,
  contentClassName,
  variant = "panel",
}: SecondarySidebarProps) {
  const headerClasses =
    variant === "panel"
      ? cn("border-b border-border bg-background p-4", headerClassName)
      : cn("p-2", headerClassName);
  const contentClasses =
    variant === "panel"
      ? cn("flex-1 space-y-6 overflow-y-auto p-4", contentClassName)
      : cn("flex-1 space-y-4 overflow-y-auto px-2 py-2", contentClassName);
  const footerClasses =
    variant === "panel"
      ? cn("border-t border-border bg-background p-4", footerClassName)
      : cn("p-2", footerClassName);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {header ? <div className={headerClasses}>{header}</div> : null}
      <div className={contentClasses}>
        {sections.map((section, index) => (
          <SecondarySidebarSection
            key={section.id ?? `${section.title ?? "section"}-${index}`}
            variant={variant}
            {...section}
          />
        ))}
      </div>
      {footer ? <div className={footerClasses}>{footer}</div> : null}
    </div>
  );
}
