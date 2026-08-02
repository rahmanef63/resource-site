"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CheckCircle as CheckCircle2, WarningCircle as AlertCircle, X, Bell } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound } from "@/features/appshell/lib/os-sounds";
import {
  useToasts,
  dismissToast,
  useNotifications,
  useApps,
  useResponsive,
  AppIcon,
  type ToastTone,
  type Toast,
  type AppDescriptor,
} from "@/features/appshell";

// Top-right glass toast stack on desktop; a real iOS banner on mobile — swap
// on the shared responsive seam. Mounted by DesktopChrome + MobileShell.

const toneIcon: Record<ToastTone, typeof CheckCircle2 | null> = {
  default: null,
  success: CheckCircle2,
  error: AlertCircle,
};

const toneColor: Record<ToastTone, string> = {
  default: "text-foreground",
  success: "text-emerald-500",
  error: "text-destructive",
};

export function ToastHost() {
  const toasts = useToasts();
  const { isMobile } = useResponsive();
  useNotifySound(toasts);
  if (toasts.length === 0) return null;
  return isMobile ? <MobileToastStack toasts={toasts} /> : <DesktopToastStack toasts={toasts} />;
}

// Plays the "notify" chime once per newly-created toast — a no-op while
// sounds are disabled (default). Tracked by id so re-renders from dismissing
// one toast never replay the sound for toasts already seen.
function useNotifySound(toasts: Toast[]) {
  const seen = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (const t of toasts) {
      if (seen.current.has(t.id)) continue;
      seen.current.add(t.id);
      playSound("notify");
    }
    const live = new Set(toasts.map((t) => t.id));
    for (const id of seen.current) if (!live.has(id)) seen.current.delete(id);
  }, [toasts]);
}

// Desktop: glass cards stacked top-right — byte-for-byte the original design.
function DesktopToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none absolute right-3.5 top-[calc(var(--menubar-h)+6px)] z-[1000] flex flex-col items-end gap-2">
      {toasts.map((t) => {
        const Icon = toneIcon[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="glass animate-in fade-in slide-in-from-top-2 pointer-events-auto flex max-w-[300px] items-center gap-2.5 rounded-[11px] border border-border px-3.5 py-2.5 text-[12.5px] font-medium shadow-xl duration-200"
            style={{ background: "var(--glass-menu)" }}
          >
            {Icon && <Icon className={cn("size-4 shrink-0", toneColor[t.tone])} />}
            <span className="flex-1 leading-snug">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  dismissToast(t.id);
                }}
                className="shrink-0 rounded-md bg-primary px-2 py-1 text-[11.5px] font-semibold text-primary-foreground hover:opacity-90"
              >
                {t.action.label}
              </button>
            )}
            <button
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
              className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-[var(--hover-strong)]"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Mobile (iOS banners): one full-width frosted card per toast, clearing the
// Dynamic Island (top-[54px], per the fidelity-audit fix). The app icon comes
// from cross-referencing the Notification Center log by id — toast() always
// logs alongside the transient toast under the same id, so this needs no
// change to the Toast type itself.
function MobileToastStack({ toasts }: { toasts: Toast[] }) {
  const log = useNotifications();
  const apps = useApps();
  return (
    <div className="pointer-events-none absolute inset-x-2 top-[54px] z-[1000] flex flex-col items-stretch gap-2">
      {toasts.map((t) => {
        const appId = log.find((n) => n.id === t.id)?.appId;
        const app = appId ? apps.find((a) => a.id === appId) : undefined;
        return <MobileToastCard key={t.id} toast={t} app={app} />;
      })}
    </div>
  );
}

function MobileToastCard({ toast: t, app }: { toast: Toast; app?: AppDescriptor }) {
  const [entered, setEntered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (startY.current === null) return;
    setDragY(Math.min(0, e.clientY - startY.current));
  };
  const onPointerEnd = () => {
    setDragging(false);
    startY.current = null;
    if (dragY < -40) dismissToast(t.id);
    else setDragY(0);
  };

  const Icon = toneIcon[t.tone];
  return (
    <div
      role="status"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onAnimationEnd={() => setEntered(true)}
      className={cn(
        "glass pointer-events-auto flex items-center gap-3 rounded-[24px] border-0 px-4 py-3 shadow-xl [touch-action:pan-x]",
        !entered && "[animation:toastSlideDown_.5s_cubic-bezier(.2,.8,.2,1)]",
      )}
      style={{
        background: "var(--glass-menu)",
        transform: dragY ? `translateY(${dragY}px)` : undefined,
        opacity: dragY ? Math.max(0.2, 1 + dragY / 120) : 1,
        transition: dragging ? "none" : "transform .25s ease-out, opacity .25s ease-out",
      }}
    >
      <span className="size-9 shrink-0">
        {app ? (
          <AppIcon app={app} />
        ) : (
          <span className="icon-tile grid size-full place-items-center bg-muted text-foreground">
            {Icon ? <Icon className={cn("size-4", toneColor[t.tone])} /> : <Bell className="size-4" />}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        {app ? (
          <>
            <div className="truncate text-[15px] font-bold">{app.title}</div>
            <div className="line-clamp-2 text-[13px] text-foreground/80">{t.message}</div>
          </>
        ) : (
          <div className="line-clamp-2 text-[13px] font-bold">{t.message}</div>
        )}
      </div>
      {t.action && (
        <Button
          type="button"
          onClick={() => {
            t.action?.onClick();
            dismissToast(t.id);
          }}
          className="h-auto shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold"
        >
          {t.action.label}
        </Button>
      )}
    </div>
  );
}
