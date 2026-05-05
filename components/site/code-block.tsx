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
    <div className={cn("group relative overflow-hidden rounded-lg border bg-muted/50", className)}>
      {filename ? (
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs">
          <span className="font-mono text-muted-foreground">{filename}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
      ) : null}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition group-hover:opacity-100">
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}
