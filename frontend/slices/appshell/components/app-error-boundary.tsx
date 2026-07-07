"use client";

import { Component, type ReactNode } from "react";
import { ArrowClockwise as RotateCw, Warning as TriangleAlert } from "@phosphor-icons/react";
/* Isolates a crashing app to its own window. Without this, one app that throws
   during render takes down the whole shell (white screen). The boundary catches
   it, shows a recover button, and resets via a key bump so the app remounts
   clean. `resetKey` (the window's app id) also auto-resets when the window
   switches to a different app. */
type Props = { resetKey: string; children: ReactNode };
type State = { error: Error | null; tick: number };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, tick: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    // App in this window changed — drop the stale error so the new app renders.
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="grid h-full place-items-center p-6 text-center">
          <div className="max-w-sm space-y-3">
            <TriangleAlert className="mx-auto size-7 text-destructive" />
            <p className="text-sm font-medium text-foreground">This app crashed</p>
            <p className="text-xs text-muted-foreground break-words">
              {this.state.error.message || "Unexpected error"}
            </p>
            <button
              type="button"
              onClick={() => this.setState((s) => ({ error: null, tick: s.tick + 1 }))}
              className="mx-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <RotateCw className="size-3.5" /> Reload app
            </button>
          </div>
        </div>
      );
    }
    // Key bump forces a fresh mount of the subtree on manual reload.
    return <div key={this.state.tick} className="contents">{this.props.children}</div>;
  }
}
