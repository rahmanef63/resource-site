export type StartHereApp = {
  id: string;
  title: string;
  description?: string;
};

export type StartHereStage = {
  title: string;
  blurb: string;
  appIds: string[];
};

export type StartHereAdapter = {
  mode: 'mock' | 'live';
  apps: StartHereApp[];
  open: (id: string) => void;
  stages?: StartHereStage[];
};

const mock: StartHereAdapter = {
  mode: 'mock',
  apps: [
    {
      id: 'home',
      title: 'Home',
      description: 'View your workspace dashboard.',
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Browse available resources and templates.',
    },
    {
      id: 'assistant',
      title: 'Assistant',
      description: 'Ask for help with your project work.',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Update your preferences and account details.',
    },
  ],
  open: () => {},
  stages: [
    {
      title: 'Get started',
      blurb: 'Start with the essentials.',
      appIds: ['home', 'library'],
    },
    {
      title: 'Get guided',
      blurb: 'Get help as you build.',
      appIds: ['assistant'],
    },
    {
      title: 'Keep organized',
      blurb: 'Manage project configuration.',
      appIds: ['settings'],
    },
  ],
};

let adapter: StartHereAdapter = mock;
const listeners = new Set<(api: StartHereApi) => void>();

export type StartHereApi = {
  readonly mode: StartHereAdapter['mode'];
  readonly apps: StartHereApp[];
  readonly stages: StartHereStage[];
  open: (id: string) => void;
  subscribe: (run: (api: StartHereApi) => void) => () => void;
};

const api: StartHereApi = {
  get mode() {
    return adapter.mode;
  },
  get apps() {
    return adapter.apps;
  },
  get stages() {
    return adapter.stages ?? [];
  },
  open(id) {
    adapter.open(id);
  },
  subscribe(run) {
    listeners.add(run);
    run(api);
    return () => {
      listeners.delete(run);
    };
  },
};

export const startHereApi = api;

export function configureStartHere(next: StartHereAdapter): void {
  adapter = next;
  listeners.forEach((listener) => listener(api));
}
