"use client";

// glass-desktop — per-widget error boundary (Build Plan §6.1). One misbehaving
// widget must never take down the whole desktop, so every widget instance is
// wrapped in one of these. On error it renders a glass fallback tile that names
// the offending instanceId, so the failure is legible in place.
import { Component, type ErrorInfo, type ReactNode } from "react";
import { WidgetShell } from "@/features/glass-desktop/components/engine/widget-shell";

export interface WidgetErrorBoundaryProps {
  /** The instance whose subtree this boundary guards; shown in the fallback. */
  instanceId: string;
  children: ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  state: WidgetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Scoped, non-fatal: log for diagnostics; the desktop keeps running.
    if (process.env.NODE_ENV !== "production") {
      console.error(`[glass-desktop] widget "${this.props.instanceId}" crashed`, error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <WidgetShell title="Widget error">
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--color-ink-mid)" }}
            >
              Widget failed
            </span>
            <span
              className="max-w-full truncate text-[11px]"
              style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
              title={this.props.instanceId}
            >
              {this.props.instanceId}
            </span>
          </div>
        </WidgetShell>
      );
    }
    return this.props.children;
  }
}
