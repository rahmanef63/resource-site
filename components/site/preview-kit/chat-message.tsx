import * as React from "react";
import { Bot, User, Wrench, Quote, CircleAlert } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatToolCall = {
  name: string;
  args?: string;
  result?: string;
  status?: "running" | "done" | "error";
};

export type ChatCitation = { label: string; href?: string };

export type ChatMessageProps = {
  role: ChatRole;
  content: React.ReactNode;
  timestamp?: string;
  status?: "streaming" | "done" | "error";
  toolCalls?: ChatToolCall[];
  citations?: ChatCitation[];
  /** Short initials/emoji used in the avatar fallback. */
  avatar?: string;
  actions?: React.ReactNode;
  className?: string;
};

const ROLE_ICON: Record<ChatRole, React.ComponentType<{ className?: string }>> = {
  user: User,
  assistant: Bot,
  system: CircleAlert,
  tool: Wrench,
};

/** Single chat row. Composes shadcn Avatar + Badge. Supports streaming
 *  indicator, tool-call inspector, and inline citations. */
export function ChatMessage({
  role,
  content,
  timestamp,
  status,
  toolCalls,
  citations,
  avatar,
  actions,
  className,
}: ChatMessageProps) {
  const Icon = ROLE_ICON[role];
  return (
    <article
      data-role={role}
      className={cn(
        "group/msg flex gap-3 px-4 py-4 sm:gap-4 sm:px-6",
        role === "user" && "bg-muted/30",
        className,
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback
          className={cn(
            "text-[10px] font-semibold",
            role === "assistant" && "bg-primary text-primary-foreground",
            role === "system" && "bg-warning/20 text-warning-foreground",
            role === "tool" && "bg-info/20 text-info",
          )}
        >
          {avatar ?? <Icon className="size-3.5" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <header className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium capitalize text-foreground">{role}</span>
          {status === "streaming" && (
            <span className="inline-flex items-center gap-1 text-info">
              <Spinner className="size-3" /> streaming
            </span>
          )}
          {status === "error" && <span className="text-danger">error</span>}
          {timestamp && <span className="ml-auto font-mono">{timestamp}</span>}
        </header>
        <div className="text-sm leading-relaxed text-foreground/90">{content}</div>
        {toolCalls && toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {toolCalls.map((t, i) => (
              <div
                key={i}
                className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="size-3 text-info" />
                  <span className="font-semibold">{t.name}</span>
                  {t.status === "running" && (
                    <Spinner className="size-3 text-muted-foreground" />
                  )}
                  {t.status === "done" && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                      done
                    </Badge>
                  )}
                  {t.status === "error" && (
                    <Badge
                      variant="secondary"
                      className="h-4 bg-danger/15 px-1.5 text-[9px] text-danger"
                    >
                      error
                    </Badge>
                  )}
                </div>
                {t.args && (
                  <pre className="mt-1 overflow-x-auto text-[10px] text-muted-foreground">
                    {t.args}
                  </pre>
                )}
                {t.result && (
                  <pre className="mt-1 overflow-x-auto text-[10px] text-foreground/80">
                    {t.result}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
        {citations && citations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Quote className="size-3 text-muted-foreground" />
            {citations.map((c, i) => (
              <Badge
                key={i}
                variant="outline"
                className="h-5 cursor-pointer rounded px-1.5 text-[10px] font-normal hover:bg-accent"
              >
                {c.label}
              </Badge>
            ))}
          </div>
        )}
        {actions && (
          <div className="flex flex-wrap items-center gap-1 pt-1 opacity-0 transition-opacity group-hover/msg:opacity-100">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
