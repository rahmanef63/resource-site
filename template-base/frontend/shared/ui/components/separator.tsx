import { cn } from "@/lib/utils";

export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-foreground",
        orientation === "horizontal" ? "h-[2px] w-full" : "w-[2px] h-full",
        className,
      )}
    />
  );
}
