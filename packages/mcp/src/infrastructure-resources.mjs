import { getInfrastructureResources } from "./data-loader.mjs";

export function listInfrastructure({ provider } = {}) {
  return (getInfrastructureResources().resources ?? [])
    .filter((row) => !provider || row.provider === provider)
    .map(({ id, provider: providerId, fieldKey, label, purpose, secretClassification, inherit, automation, docsUrl, actionUrl }) => ({
      id,
      provider: providerId,
      fieldKey,
      label,
      purpose,
      secretClassification,
      inherit,
      automation,
      docsUrl,
      actionUrl,
    }));
}

export function getInfrastructure(id) {
  return (getInfrastructureResources().resources ?? []).find((row) => row.id === id) ?? null;
}
