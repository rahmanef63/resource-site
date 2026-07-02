export const FIELD_KEYWORDS = {
  title: ["name", "title", "task"],
  status: ["status", "state", "stage"],
  owner: ["owner", "assignee", "assigned", "person"],
  group: ["group", "team", "squad", "department"],
  product: ["product", "area", "stream"],
  initiative: ["initiative", "project", "program"],
  release: ["release", "milestone", "version"],
  start: ["start", "begin", "kickoff"],
  end: ["end", "finish", "due", "deadline", "complete"],
} as const;

export const DATE_FIELD_TYPES = new Set(["date"] as const);
export const SELECT_FIELD_TYPES = new Set(["select", "multiSelect"] as const);
export const PERSON_FIELD_TYPES = new Set(["person"] as const);
