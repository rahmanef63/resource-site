import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// SSOT: Keyboard shortcuts configuration
const SHORTCUTS = [
    {
        category: 'Canvas', shortcuts: [
            { keys: ['Ctrl', 'Z'], action: 'Undo' },
            { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
            { keys: ['Ctrl', 'C'], action: 'Copy selected' },
            { keys: ['Ctrl', 'X'], action: 'Cut selected' },
            { keys: ['Ctrl', 'V'], action: 'Paste' },
            { keys: ['Delete'], action: 'Delete selected' },
            { keys: ['Escape'], action: 'Deselect all' },
        ]
    },
    {
        category: 'View', shortcuts: [
            { keys: ['Ctrl', '+'], action: 'Zoom in' },
            { keys: ['Ctrl', '-'], action: 'Zoom out' },
            { keys: ['Ctrl', '0'], action: 'Fit to view' },
            { keys: ['Space'], action: 'Pan canvas (hold)' },
        ]
    },
    {
        category: 'General', shortcuts: [
            { keys: ['?'], action: 'Show shortcuts' },
            { keys: ['Ctrl', 'S'], action: 'Save project' },
            { keys: ['Ctrl', 'E'], action: 'Export JSON' },
        ]
    },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {SHORTCUTS.map((group) => (
                        <div key={group.category}>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                {group.category}
                            </h3>
                            <div className="space-y-2">
                                {group.shortcuts.map((shortcut) => (
                                    <div
                                        key={shortcut.action}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span>{shortcut.action}</span>
                                        <div className="flex gap-1">
                                            {shortcut.keys.map((key, idx) => (
                                                <React.Fragment key={key}>
                                                    <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded font-mono">
                                                        {key}
                                                    </kbd>
                                                    {idx < shortcut.keys.length - 1 && (
                                                        <span className="text-muted-foreground">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                    Press <kbd className="px-1.5 py-0.5 bg-muted border rounded font-mono">?</kbd> anytime to show this dialog
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to open shortcuts dialog with ? key
 */
export function useKeyboardShortcutsDialog() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user pressed ? (Shift + /) and not in an input
            if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { open, setOpen };
}
