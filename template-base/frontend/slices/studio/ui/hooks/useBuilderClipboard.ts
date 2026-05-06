/**
 * Re-export from shared/builder/hooks for backward compatibility.
 * The canonical location is now @/frontend/shared/builder/hooks/useBuilderClipboard.
 */
export {
    useBuilderClipboard,
    useBuilderClipboardShortcuts,
    type ClipboardData,
    type UseBuilderClipboardOptions,
    type UseBuilderClipboardReturn,
} from '@/frontend/shared/builder/hooks/useBuilderClipboard';

export { default } from '@/frontend/shared/builder/hooks/useBuilderClipboard';
