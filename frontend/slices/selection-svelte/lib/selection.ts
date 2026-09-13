export type SelectionSubscriber = (revision: number) => void;

export interface SelectionApi {
  readonly size: number;
  isSelected: (id: string) => boolean;
  snapshot: () => string[];
  selectOnly: (id: string) => void;
  toggle: (id: string) => void;
  selectRange: (id: string, orderedIds: string[]) => void;
  setIds: (ids: string[]) => void;
  clear: () => void;
  subscribe: (run: SelectionSubscriber) => () => void;
}

export function createSelectionApi(): SelectionApi {
  let selected = new Set<string>();
  let anchor: string | null = null;
  let revision = 0;
  const subscribers = new Set<SelectionSubscriber>();

  const notify = () => {
    revision += 1;
    for (const run of subscribers) run(revision);
  };
  const replace = (ids: Iterable<string>) => {
    selected = new Set(ids);
    notify();
  };

  return {
    get size() {
      return selected.size;
    },
    isSelected: (id) => selected.has(id),
    snapshot: () => [...selected],
    selectOnly(id) {
      anchor = id;
      replace([id]);
    },
    toggle(id) {
      anchor = id;
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      replace(next);
    },
    selectRange(id, orderedIds) {
      const from = orderedIds.indexOf(anchor ?? id);
      const to = orderedIds.indexOf(id);
      if (from < 0 || to < 0) {
        anchor = id;
        replace([id]);
        return;
      }
      const [lo, hi] = from < to ? [from, to] : [to, from];
      replace(orderedIds.slice(lo, hi + 1));
    },
    setIds(ids) {
      if (ids.length > 0) anchor = ids[ids.length - 1];
      replace(ids);
    },
    clear() {
      anchor = null;
      replace([]);
    },
    subscribe(run) {
      run(revision);
      subscribers.add(run);
      return () => subscribers.delete(run);
    },
  };
}
