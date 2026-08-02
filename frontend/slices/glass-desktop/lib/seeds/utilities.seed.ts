// glass-desktop — seed copy for the "utilities" family widgets (Build Plan §7).
// LOC-exempt data module. Widgets must read from here — no literals in the TSX.

/** task-list: a checklist item, persisted under STORAGE.tasks once toggled. */
export interface TaskSeed {
  id: string;
  label: string;
  done: boolean;
}

export const taskListSeed = {
  title: "Tasks",
  items: [
    { id: "wireframes", label: "Ship the wireframes", done: true },
    { id: "review-pr", label: "Review open PRs", done: false },
    { id: "standup-notes", label: "Write standup notes", done: false },
    { id: "inbox-zero", label: "Clear the inbox", done: false },
  ] as TaskSeed[],
};
