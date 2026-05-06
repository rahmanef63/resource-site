/**
 * Re-export from shared/builder/hooks for backward compatibility.
 * The canonical location is now @/frontend/shared/builder/hooks/useBuilderHistory.
 */
export {
    useBuilderHistory,
    useBuilderKeyboardShortcuts,
    type HistorySnapshot,
    type UseBuilderHistoryOptions,
    type UseBuilderHistoryReturn,
} from '@/frontend/shared/builder/hooks/useBuilderHistory';

export { default } from '@/frontend/shared/builder/hooks/useBuilderHistory';
