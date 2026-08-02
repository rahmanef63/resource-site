import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { KanbanBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Kanban';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { KanbanSquare } from 'lucide-react';
import type { KanbanColumn } from '.';

const DEMO_COLUMNS: KanbanColumn[] = [
    {
        id: "backlog",
        title: "Backlog",
        items: [
            { id: "t1", title: "User research interviews", priority: "medium", tags: ["research"] },
            { id: "t2", title: "Competitor analysis", priority: "low" },
        ],
    },
    {
        id: "todo",
        title: "To Do",
        items: [
            { id: "t3", title: "Redesign onboarding flow", priority: "high", tags: ["design"], assignee: { fallback: "AK" }, dueDate: "Apr 8" },
            { id: "t4", title: "Write API documentation", priority: "medium", assignee: { fallback: "BL" } },
            { id: "t5", title: "Setup analytics dashboard", priority: "low", dueDate: "Apr 12" },
        ],
    },
    {
        id: "in-progress",
        title: "In Progress",
        items: [
            { id: "t6", title: "Auth middleware implementation", priority: "high", assignee: { fallback: "RA" }, dueDate: "Apr 7" },
            { id: "t7", title: "User permissions UI", priority: "medium", assignee: { fallback: "JD" }, tags: ["ui"], dueDate: "Apr 9" },
        ],
    },
    {
        id: "done",
        title: "Done",
        items: [
            { id: "t8", title: "CI/CD pipeline setup", priority: "low", assignee: { fallback: "MN" }, dueDate: "✓ Apr 3" },
            { id: "t9", title: "Auth token refresh logic", priority: "high", assignee: { fallback: "SP" }, dueDate: "✓ Apr 5" },
        ],
    },
]

export const kanbanManifest: WidgetConfig = {
    label: "Kanban",
    category: "Blocks",
    description: "Drag-and-drop task board with columns, cards, priorities, assignees, and optional localStorage persistence.",
    icon: KanbanSquare,
    defaults: {
        title: "Project Board",
        columns: DEMO_COLUMNS,
        persistStrategy: "none",
        persistKey: "",
        className: "",
    },
    render: (props) => (
        <KanbanBlock
            {...(props as any)}
            columns={
                Array.isArray(props.columns) && props.columns.length > 0
                    ? (props.columns as KanbanColumn[])
                    : DEMO_COLUMNS
            }
            persistStrategy={(props.persistStrategy as any) ?? "none"}
            persistKey={typeof props.persistKey === "string" && props.persistKey ? props.persistKey : undefined}
        />
    ),
    inspector: {
        fields: [
            createCustomField({ key: 'title', label: 'Title', type: 'text' }),
            createCustomField({
                key: 'columns',
                label: 'Columns (JSON)',
                type: 'json',
                placeholder: JSON.stringify([
                    {
                        id: "todo", title: "To Do",
                        items: [
                            { id: "t1", title: "Task title", priority: "medium", tags: ["tag"], assignee: { fallback: "JD" }, dueDate: "Apr 8" },
                        ],
                    },
                    { id: "done", title: "Done", items: [] },
                ], null, 2),
            }),
            createCustomField({
                key: 'persistStrategy',
                label: 'Persist Strategy',
                type: 'select',
                options: ['none', 'localStorage'],
                placeholder: 'none',
            }),
            createCustomField({
                key: 'persistKey',
                label: 'Persist Key (localStorage)',
                type: 'text',
                placeholder: 'studio-kanban-my-board',
            }),
        ],
    },
};
