import type { ReactNode } from "react";
import { isValidElement } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Header } from "../../../header";

export interface SecondaryHeaderAction {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  buttonProps?: VariantProps<typeof buttonVariants> & ComponentProps<typeof Button>;
  disabled?: boolean;
}

export interface SecondarySidebarHeaderProps {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  breadcrumbs?: ReactNode;
  toolbar?: ReactNode;
  primaryAction?: SecondaryHeaderAction | ReactNode;
  secondaryActions?: ReactNode;
  /** Slot for settings button - placed in header right side */
  settingsSlot?: ReactNode;
  /** Feature slug for automatic settings button integration */
  featureSlug?: string;
  /** Feature name for settings button tooltip */
  featureName?: string;
  children?: ReactNode;
  className?: string;
}

function renderPrimaryAction(primaryAction?: SecondarySidebarHeaderProps["primaryAction"]) {
  if (!primaryAction) {
    return null;
  }

  if (isValidElement(primaryAction)) {
    return primaryAction;
  }

  const { label, icon: Icon, onClick, buttonProps, disabled } = primaryAction as SecondaryHeaderAction;
  const { className: buttonClassName, ...restButtonProps } = buttonProps ?? {};

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-2", buttonClassName)}
      {...restButtonProps}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </Button>
  );
}

export function SecondarySidebarHeader({
  title,
  description,
  meta,
  breadcrumbs,
  toolbar,
  primaryAction,
  secondaryActions,
  settingsSlot,
  featureSlug,
  featureName,
  children,
  className,
}: SecondarySidebarHeaderProps) {
  return (
    <Header 
      variant="default" 
      size="lg" 
      layout="stacked" 
      className={cn("gap-4", className)}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between w-full">
        <Header.Title 
          title={title} 
          subtitle={description as string} 
          size="lg"
        >
          {meta ? <div className="text-xs text-muted-foreground mt-1">{meta}</div> : null}
        </Header.Title>

        {secondaryActions || primaryAction || settingsSlot ? (
          <Header.Actions>
            {settingsSlot}
            {secondaryActions}
            {renderPrimaryAction(primaryAction)}
          </Header.Actions>
        ) : null}
      </div>

      {breadcrumbs ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs}
        </div>
      ) : null}

      {children ? <div className="flex flex-col gap-3 w-full">{children}</div> : null}
    </Header>
  );
}