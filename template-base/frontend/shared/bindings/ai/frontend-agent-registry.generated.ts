// AUTO-GENERATED — kitab stub. After running the slice CLI's
// `sync-agents.ts` against actual kitab slices, this file is rewritten
// to import each slice's agent module. With only studio + example as
// kitab slices today (neither ships an `agent/` dir), the registry is
// empty.

export interface AgentFallback {
    name: string;
    description: string;
    icon: string;
    prompts?: any;
}

export const frontendAgentRegistry: Record<string, AgentFallback> = {};
