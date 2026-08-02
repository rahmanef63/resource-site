"use client";
// glass-desktop — task-list (utilities family, W wide). Ported from Lucent v4. A
// checklist whose done-state persists under STORAGE.tasks (keyed by instanceId so
// two instances don't collide) via usePersistentState. Toggles are shadcn
// Checkboxes are shadcn Checkbox. Content only — the canvas supplies the glass shell.
import { Checkbox } from "@/components/ui/checkbox";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { taskListSeed, type TaskSeed } from "@/features/glass-desktop/lib/seeds/utilities.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function TaskList({ instanceId }: WidgetProps) {
  const [tasks, setTasks] = usePersistentState<TaskSeed[]>(
    `${STORAGE.tasks}:${instanceId}`,
    taskListSeed.items,
  );
  const done = tasks.filter((t) => t.done).length;

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="flex h-full w-full flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-ink-low)" }}
        >
          {taskListSeed.title}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
        >
          {done}/{tasks.length}
        </span>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            <Checkbox
              id={`${instanceId}-${task.id}`}
              checked={task.done}
              onCheckedChange={() => toggle(task.id)}
              aria-label={task.label}
            />
            <label
              htmlFor={`${instanceId}-${task.id}`}
              className="min-w-0 flex-1 cursor-pointer truncate text-xs leading-none"
              style={{
                color: task.done ? "var(--color-ink-low)" : "var(--color-ink-hi)",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
