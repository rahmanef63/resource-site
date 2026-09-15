import type { Agent, Automation, Skill } from "./types";
import { PRESET_AGENTS, PRESET_AUTOMATIONS, PRESET_SKILLS } from "./presets";

const KEYS = {
  skills: "alfa.skills",
  agents: "alfa.agents",
  autos: "alfa.automations",
  active: "alfa.activeAgent",
} as const;

export type AssistantStoreState = {
  skills: Skill[];
  agents: Agent[];
  automations: Automation[];
  activeAgentId: string;
};

const clone = <T extends object>(value: T): T => ({ ...value });
const defaults = (): AssistantStoreState => ({
  skills: PRESET_SKILLS.map(clone),
  agents: PRESET_AGENTS.map(clone),
  automations: PRESET_AUTOMATIONS.map(clone),
  activeAgentId: PRESET_AGENTS[0].id,
});

let state = defaults();
let hydrated = false;
let storageBound = false;
const listeners = new Set<() => void>();
const uid = () => Math.random().toString(36).slice(2, 9);

function loadList<T extends object>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback.map(clone);
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed as T[];
  } catch {
    // Corrupt/unavailable storage falls back to presets.
  }
  return fallback.map(clone);
}

function readStorage(): AssistantStoreState {
  return {
    skills: loadList(KEYS.skills, PRESET_SKILLS),
    agents: loadList(KEYS.agents, PRESET_AGENTS),
    automations: loadList(KEYS.autos, PRESET_AUTOMATIONS),
    activeAgentId:
      (typeof window !== "undefined" && window.localStorage.getItem(KEYS.active)) ||
      PRESET_AGENTS[0].id,
  };
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEYS.skills, JSON.stringify(state.skills));
    window.localStorage.setItem(KEYS.agents, JSON.stringify(state.agents));
    window.localStorage.setItem(KEYS.autos, JSON.stringify(state.automations));
    window.localStorage.setItem(KEYS.active, state.activeAgentId);
  } catch {
    // Local persistence is best-effort; in-memory state remains usable.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

function commit(next: AssistantStoreState): void {
  state = next;
  persist();
  notify();
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") return;
  state = readStorage();
  hydrated = true;
  if (storageBound) return;
  storageBound = true;
  window.addEventListener("storage", (event) => {
    if (!Object.values(KEYS).includes(event.key as never)) return;
    state = readStorage();
    notify();
  });
}

export function subscribeAssistantStore(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAssistantStoreSnapshot(): AssistantStoreState {
  ensureHydrated();
  return state;
}

const SERVER_STATE = defaults();
export function getAssistantStoreServerSnapshot(): AssistantStoreState {
  return SERVER_STATE;
}

export function activeAgentOf(s: AssistantStoreState): Agent {
  return s.agents.find((agent) => agent.id === s.activeAgentId) ?? s.agents[0] ?? PRESET_AGENTS[0];
}

export const assistantStoreActions = {
  setActiveAgentId(id: string) {
    commit({ ...getAssistantStoreSnapshot(), activeAgentId: id });
  },
  addSkill(input: Omit<Skill, "id">): Skill {
    const item: Skill = { id: `sk_${uid()}`, builtin: false, ...input };
    const s = getAssistantStoreSnapshot();
    commit({ ...s, skills: [...s.skills, item] });
    return item;
  },
  updateSkill(id: string, patch: Partial<Skill>) {
    const s = getAssistantStoreSnapshot();
    commit({ ...s, skills: s.skills.map((item) => item.id === id ? { ...item, ...patch } : item) });
  },
  removeSkill(id: string) {
    const s = getAssistantStoreSnapshot();
    commit({
      ...s,
      skills: s.skills.filter((item) => item.id !== id),
      agents: s.agents.map((agent) => ({ ...agent, skills: agent.skills.filter((skill) => skill !== id) })),
    });
  },
  addAgent(input: Omit<Agent, "id">): Agent {
    const item: Agent = { id: `ag_${uid()}`, builtin: false, ...input };
    const s = getAssistantStoreSnapshot();
    commit({ ...s, agents: [...s.agents, item] });
    return item;
  },
  updateAgent(id: string, patch: Partial<Agent>) {
    const s = getAssistantStoreSnapshot();
    commit({ ...s, agents: s.agents.map((item) => item.id === id ? { ...item, ...patch } : item) });
  },
  removeAgent(id: string) {
    const s = getAssistantStoreSnapshot();
    const agents = s.agents.filter((item) => item.id !== id);
    const activeAgentId = s.activeAgentId === id ? (agents[0]?.id ?? s.activeAgentId) : s.activeAgentId;
    commit({ ...s, agents, activeAgentId });
  },
  addAutomation(input: Omit<Automation, "id">): Automation {
    const item: Automation = { id: `au_${uid()}`, builtin: false, ...input };
    const s = getAssistantStoreSnapshot();
    commit({ ...s, automations: [...s.automations, item] });
    return item;
  },
  updateAutomation(id: string, patch: Partial<Automation>) {
    const s = getAssistantStoreSnapshot();
    commit({ ...s, automations: s.automations.map((item) => item.id === id ? { ...item, ...patch } : item) });
  },
  removeAutomation(id: string) {
    const s = getAssistantStoreSnapshot();
    commit({ ...s, automations: s.automations.filter((item) => item.id !== id) });
  },
};
