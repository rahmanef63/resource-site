/**
 * Studio Error Log Store
 *
 * Lightweight in-memory store for widget render errors.
 * WidgetErrorBoundary pushes errors here; the ErrorLog panel reads them.
 *
 * Uses a simple event-emitter pattern so the panel can subscribe without
 * needing a React context at the Renderer level.
 */

export interface StudioError {
    id: string;
    nodeId: string;
    message: string;
    stack?: string;
    timestamp: number;
}

type Listener = () => void;

class StudioErrorLogStore {
    private errors: StudioError[] = [];
    private listeners = new Set<Listener>();
    private counter = 0;

    push(nodeId: string, error: Error | any) {
        const entry: StudioError = {
            id: `err-${++this.counter}`,
            nodeId,
            message: error?.message ?? String(error),
            stack: error?.stack,
            timestamp: Date.now(),
        };
        this.errors = [entry, ...this.errors].slice(0, 100); // keep latest 100
        this.notify();
    }

    getErrors(): Readonly<StudioError[]> {
        return this.errors;
    }

    clear() {
        this.errors = [];
        this.notify();
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((l) => l());
    }
}

// Singleton
export const studioErrorLog = new StudioErrorLogStore();
