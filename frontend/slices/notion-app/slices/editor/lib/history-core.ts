export interface TextHistory {
  record: (text: string, now?: number) => void;
  undo: (current: string) => string | null;
  redo: (current: string) => string | null;
  reset: (text: string) => void;
}

export function createTextHistory(initialText: string): TextHistory {
  let past: string[] = [];
  let future: string[] = [];
  let last = initialText;
  let lastPush = 0;
  return {
    record(text, now = Date.now()) {
      if (text === last) return;
      if (now - lastPush < 500 && !/\s$/.test(text)) { last = text; return; }
      past.push(last);
      if (past.length > 100) past.shift();
      last = text;
      lastPush = now;
      future = [];
    },
    undo(current) {
      const value = past.pop();
      if (value === undefined) return null;
      future.push(current); last = value; return value;
    },
    redo(current) {
      const value = future.pop();
      if (value === undefined) return null;
      past.push(current); last = value; return value;
    },
    reset(text) { past = []; future = []; last = text; lastPush = 0; },
  };
}
