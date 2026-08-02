import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language = "tsx",
  filename,
  className,
}: {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}) {
  return (
    <div className={cn("group relative w-full min-w-0 overflow-hidden rounded-lg border bg-muted/50", className)}>
      {filename ? (
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 text-xs sm:px-4">
          <span className="truncate font-mono text-muted-foreground">{filename}</span>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
      ) : null}
      <div className="absolute right-2 top-2 z-10 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed sm:p-4 sm:text-[13px]">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}
