export function humanizeFeatureId(featureId: string): string {
  return featureId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const CONTEXTUAL_LABELS: Record<string, string> = {
  overview: "Home",
  knowledge: "Knowledge",
  documents: "Docs",
  database: "Data",
  calendar: "Calendar",
  contacts: "Contacts",
  communications: "Comms",
  tasks: "Tasks",
  projects: "Projects",
  crm: "CRM",
  sales: "Sales",
  marketing: "Marketing",
  analytics: "Analytics",
  reports: "Insights",
  accounting: "Finance",
  inventory: "Inventory",
  hr: "People",
  forms: "Forms",
  content: "Content",
  support: "Support",
  approvals: "Approvals",
  ai: "AI",
}

export function generateWorkspaceFeatureLabel(
  featureId: string,
  options?: {
    workspaceName?: string
    fallbackName?: string
  },
): string {
  const baseLabel = options?.fallbackName?.trim() || humanizeFeatureId(featureId)
  const workspaceName = options?.workspaceName?.trim()

  if (!workspaceName) {
    return baseLabel
  }

  const contextualLabel = CONTEXTUAL_LABELS[featureId]
  if (!contextualLabel) {
    return baseLabel
  }

  const lowerBase = baseLabel.toLowerCase()
  const lowerWorkspace = workspaceName.toLowerCase()
  if (lowerBase.includes(lowerWorkspace)) {
    return baseLabel
  }

  return `${workspaceName} ${contextualLabel}`
}
