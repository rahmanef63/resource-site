import type { StartHereApp, StartHereStage } from './host';

export type ResolvedStartHereStage = {
  title: string;
  blurb: string;
  tiles: StartHereApp[];
};

export function resolveStartHereStages(
  apps: StartHereApp[],
  authoredStages: StartHereStage[],
): ResolvedStartHereStage[] {
  const appById = new Map<string, StartHereApp>(apps.map((app) => [app.id, app]));
  const placed = new Set<string>();

  const resolved = authoredStages
    .map((stage) => {
      const tiles = stage.appIds
        .map((id) => appById.get(id))
        .filter((app): app is StartHereApp => app != null);

      tiles.forEach((app) => placed.add(app.id));

      return {
        title: stage.title,
        blurb: stage.blurb,
        tiles,
      };
    })
    .filter((stage) => stage.tiles.length > 0);

  const leftovers = apps.filter((app) => !placed.has(app.id));

  if (leftovers.length > 0) {
    resolved.push({
      title: 'Everything else',
      blurb: 'More apps in your workspace.',
      tiles: leftovers,
    });
  }

  return resolved;
}
