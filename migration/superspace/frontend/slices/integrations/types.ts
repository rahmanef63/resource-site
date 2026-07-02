export interface IntegrationDef {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color: string;
}

export interface ConnectedIntegration {
    _id: string;
    integrationId: string;
    workspaceId: string;
    status: 'active' | 'inactive' | 'error';
    createdAt: number;
    lastSyncAt?: number;
    config?: any;
}

export interface IntegrationsData {
    isLoading: boolean;
    integrations: ConnectedIntegration[];
    stats: {
        totalConnected: number;
        activeIntegrations: number;
        totalAvailable: number;
    };
}

export const INTEGRATION_CATEGORIES = [
    { id: "all", name: "All" },
    { id: "communication", name: "Communication" },
    { id: "storage", name: "Storage" },
    { id: "crm", name: "CRM" },
    { id: "marketing", name: "Marketing" },
    { id: "payment", name: "Payment" },
    { id: "development", name: "Development" },
    { id: "automation", name: "Automation" },
];

export const AVAILABLE_INTEGRATIONS: IntegrationDef[] = [
    { id: "slack", name: "Slack", icon: "💬", category: "communication", description: "Team communication and notifications", color: "bg-purple-500" },
    { id: "discord", name: "Discord", icon: "🎮", category: "communication", description: "Community chat and updates", color: "bg-indigo-500" },
    { id: "gdrive", name: "Google Drive", icon: "📁", category: "storage", description: "Cloud storage and file sync", color: "bg-yellow-500" },
    { id: "dropbox", name: "Dropbox", icon: "📦", category: "storage", description: "File sync and backup", color: "bg-blue-500" },
    { id: "salesforce", name: "Salesforce", icon: "☁️", category: "crm", description: "CRM and sales platform", color: "bg-blue-600" },
    { id: "hubspot", name: "HubSpot", icon: "🟠", category: "crm", description: "Marketing and sales CRM", color: "bg-orange-500" },
    { id: "mailchimp", name: "Mailchimp", icon: "📧", category: "marketing", description: "Email marketing automation", color: "bg-yellow-400" },
    { id: "stripe", name: "Stripe", icon: "💳", category: "payment", description: "Payment processing", color: "bg-purple-600" },
    { id: "zapier", name: "Zapier", icon: "⚡", category: "automation", description: "Workflow automation", color: "bg-orange-600" },
    { id: "github", name: "GitHub", icon: "🐙", category: "development", description: "Code repository and CI/CD", color: "bg-gray-800" },
    { id: "notion", name: "Notion", icon: "📝", category: "productivity", description: "Docs and knowledge base", color: "bg-gray-700" },
    { id: "jira", name: "Jira", icon: "🎯", category: "development", description: "Issue tracking", color: "bg-blue-700" },
];
