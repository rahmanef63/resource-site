import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * Overview Agent
 * 
 * Helps users understand and navigate their workspace dashboard.
 * Provides:
 * - Workspace activity summaries
 * - Task and event insights
 * - Quick navigation suggestions
 * - Data overview and trends
 */
export function registerOverviewAgent() {
  const agent: SubAgent = {
    id: "overview-agent",
    name: "Overview Assistant",
    description: "Helps summarize workspace activity, understand dashboard data, and navigate your workspace.",
    featureId: "overview",
    tools: [
      {
        name: "summarize_workspace",
        description: "Summarize the current workspace activity and statistics.",
        parameters: {
          timeRange: {
            type: "string",
            description: "Time range for the summary (today, 7d, 30d, 90d)",
            required: false,
          },
        },
        handler: async (params, ctx) => {
          const timeRange = (params as any).timeRange || "30d"
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              timeRange,
              summary: {
                type: "workspace_summary",
                description: "Workspace activity summary",
              },
            },
            message: `Summarizing workspace activity for the last ${timeRange}`,
          }
        },
      },
      {
        name: "get_pending_tasks",
        description: "Get pending tasks that need attention.",
        parameters: {
          urgent: {
            type: "boolean",
            description: "Only show urgent/overdue tasks",
            required: false,
          },
        },
        handler: async (params, ctx) => {
          const urgent = (params as any).urgent || false
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              filter: urgent ? "urgent" : "all",
              type: "pending_tasks",
            },
            message: urgent
              ? "Finding urgent tasks that need immediate attention..."
              : "Finding all pending tasks...",
          }
        },
      },
      {
        name: "get_upcoming_events",
        description: "Get upcoming calendar events and deadlines.",
        parameters: {
          days: {
            type: "number",
            description: "Number of days to look ahead (default: 7)",
            required: false,
          },
        },
        handler: async (params, ctx) => {
          const days = (params as any).days || 7
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              lookAhead: days,
              type: "upcoming_events",
            },
            message: `Finding events in the next ${days} days...`,
          }
        },
      },
      {
        name: "get_recent_activity",
        description: "Get recent activity in the workspace.",
        parameters: {
          limit: {
            type: "number",
            description: "Number of recent activities to show (default: 10)",
            required: false,
          },
        },
        handler: async (params, ctx) => {
          const limit = (params as any).limit || 10
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              limit,
              type: "recent_activity",
            },
            message: `Fetching the ${limit} most recent activities...`,
          }
        },
      },
      {
        name: "get_team_overview",
        description: "Get team composition and member activity.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              type: "team_overview",
            },
            message: "Getting team composition and activity...",
          }
        },
      },
      {
        name: "suggest_next_action",
        description: "Suggest what the user should focus on next based on their workspace data.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              type: "next_action_suggestion",
            },
            message: "Analyzing your workspace to suggest what to focus on next...",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()

      // High confidence matches
      if (q.includes("overview") || q.includes("dashboard")) return 0.8
      if (q.includes("summarize") && (q.includes("workspace") || q.includes("activity"))) return 0.9
      if (q.includes("what's happening") || q.includes("what is happening")) return 0.8
      if (q.includes("my day") || q.includes("today")) return 0.7
      if (q.includes("this week") || q.includes("upcoming")) return 0.7

      // Medium confidence matches
      if (q.includes("pending") || q.includes("overdue")) return 0.6
      if (q.includes("team") && q.includes("activity")) return 0.6
      if (q.includes("recent") && q.includes("activity")) return 0.6
      if (q.includes("what should i") || q.includes("suggest")) return 0.5

      return 0
    },
    suggestions: [
      {
        label: "Summarize my day",
        prompt: "What do I have scheduled today and what tasks need attention?",
        category: "Planning",
      },
      {
        label: "Pending tasks",
        prompt: "Show me my pending tasks that need attention",
        category: "Tasks",
      },
      {
        label: "This week",
        prompt: "What's coming up this week?",
        category: "Planning",
      },
      {
        label: "Recent updates",
        prompt: "What happened in the workspace recently?",
        category: "Activity",
      },
    ],
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
