"use client";

import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLikeProps = ComponentPropsWithoutRef<typeof Button>;

export interface ExportControlProps extends ButtonLikeProps {
  onExport?: () => void;
}

export const ExportControl = forwardRef<HTMLButtonElement, ExportControlProps>(
  (
    {
      onExport,
      children,
      onClick,
      variant = "ghost",
      size = "sm",
      className,
      ...props
    },
    ref,
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      onExport?.();
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={handleClick}
        {...props}
      >
        {children ?? (
          <>
            <Download className="h-4 w-4" />
            Export
          </>
        )}
      </Button>
    );
  },
);

ExportControl.displayName = "ExportControl";

export interface ImportControlProps extends ButtonLikeProps {
  onImport?: () => void;
}

export const ImportControl = forwardRef<HTMLButtonElement, ImportControlProps>(
  (
    {
      onImport,
      children,
      onClick,
      variant = "ghost",
      size = "sm",
      className,
      ...props
    },
    ref,
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      onImport?.();
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={handleClick}
        {...props}
      >
        {children ?? (
          <>
            <Upload className="h-4 w-4" />
            Import
          </>
        )}
      </Button>
    );
  },
);

ImportControl.displayName = "ImportControl";
