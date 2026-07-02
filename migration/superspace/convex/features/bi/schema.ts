/**
 * BI (Business Intelligence) Feature Schema
 * Comprehensive analytics dashboards, reports, and data visualization
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const biTables = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Dashboards (Customizable analytics dashboards)
  // ═══════════════════════════════════════════════════════════════════════════════
  biDashboards: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Layout configuration
    layout: v.optional(v.array(v.object({
      widgetId: v.string(),
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }))),
    
    // Widgets on this dashboard
    widgets: v.array(v.object({
      id: v.string(),
      type: v.string(), // chart, metric, table, text
      title: v.string(),
      config: v.record(v.string(), v.any()),
    })),
    
    // Settings
    isDefault: v.boolean(),
    isPublic: v.boolean(),
    refreshInterval: v.optional(v.number()), // seconds
    
    // Theme
    theme: v.optional(v.object({
      primaryColor: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      textColor: v.optional(v.string()),
    })),
    
    // Filters (global filters for dashboard)
    filters: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(), // date_range, select, multi_select
      field: v.string(),
      defaultValue: v.optional(v.any()),
    }))),
    
    // Sharing
    sharedWith: v.optional(v.array(v.id("users"))),
    publicToken: v.optional(v.string()), // For public sharing
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"])
    .index("by_public_token", ["publicToken"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Widgets (Reusable chart/metric components)
  // ═══════════════════════════════════════════════════════════════════════════════
  biWidgets: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Widget type
    type: v.union(
      v.literal("metric"),        // Single number with trend
      v.literal("line_chart"),    // Line/area chart
      v.literal("bar_chart"),     // Bar/column chart
      v.literal("pie_chart"),     // Pie/donut chart
      v.literal("table"),         // Data table
      v.literal("funnel"),        // Funnel visualization
      v.literal("gauge"),         // Gauge/progress
      v.literal("map"),           // Geographic map
      v.literal("heatmap"),       // Heatmap
      v.literal("scatter"),       // Scatter plot
      v.literal("treemap"),       // Treemap
      v.literal("text"),          // Rich text/markdown
      v.literal("image"),         // Image
      v.literal("embed")          // External embed
    ),
    
    // Data source
    dataSource: v.object({
      type: v.string(), // query, api, static
      table: v.optional(v.string()), // Convex table name
      query: v.optional(v.string()), // Custom query
      endpoint: v.optional(v.string()), // API endpoint
      staticData: v.optional(v.any()), // Static data
    }),
    
    // Query configuration
    queryConfig: v.optional(v.object({
      dimensions: v.optional(v.array(v.string())), // Group by fields
      measures: v.optional(v.array(v.object({
        field: v.string(),
        aggregation: v.string(), // sum, count, avg, min, max
        alias: v.optional(v.string()),
      }))),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      orderBy: v.optional(v.object({
        field: v.string(),
        direction: v.string(), // asc, desc
      })),
      limit: v.optional(v.number()),
    })),
    
    // Display configuration
    displayConfig: v.object({
      // Common
      title: v.optional(v.string()),
      subtitle: v.optional(v.string()),
      showLegend: v.optional(v.boolean()),
      
      // Colors
      colors: v.optional(v.array(v.string())),
      colorScheme: v.optional(v.string()),
      
      // Axes (for charts)
      xAxis: v.optional(v.object({
        label: v.optional(v.string()),
        format: v.optional(v.string()),
      })),
      yAxis: v.optional(v.object({
        label: v.optional(v.string()),
        format: v.optional(v.string()),
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      })),
      
      // Metric specific
      format: v.optional(v.string()), // number, currency, percent
      prefix: v.optional(v.string()),
      suffix: v.optional(v.string()),
      decimals: v.optional(v.number()),
      
      // Comparison
      showComparison: v.optional(v.boolean()),
      comparisonType: v.optional(v.string()), // previous_period, same_period_last_year
      
      // Thresholds
      thresholds: v.optional(v.array(v.object({
        value: v.number(),
        color: v.string(),
        label: v.optional(v.string()),
      }))),
      
      // Drill down
      drillDownEnabled: v.optional(v.boolean()),
      drillDownConfig: v.optional(v.record(v.string(), v.any())),
    }),
    
    // Size and position (for templates)
    defaultSize: v.optional(v.object({
      w: v.number(),
      h: v.number(),
    })),
    
    // Cache settings
    cacheEnabled: v.optional(v.boolean()),
    cacheDuration: v.optional(v.number()), // seconds
    lastCached: v.optional(v.number()),
    cachedData: v.optional(v.any()),
    
    // Is this a template widget?
    isTemplate: v.boolean(),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_template", ["workspaceId", "isTemplate"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Metrics (KPI definitions and tracking)
  // ═══════════════════════════════════════════════════════════════════════════════
  biMetrics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Metric type
    type: v.union(
      v.literal("count"),
      v.literal("sum"),
      v.literal("average"),
      v.literal("percentage"),
      v.literal("ratio"),
      v.literal("growth"),
      v.literal("custom")
    ),
    
    // Data source
    dataSource: v.string(), // Table name or data source ID
    field: v.optional(v.string()), // Field to aggregate
    
    // Calculation
    calculation: v.optional(v.object({
      formula: v.optional(v.string()), // Custom formula
      numerator: v.optional(v.string()), // For ratios
      denominator: v.optional(v.string()),
    })),
    
    // Filters
    filters: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
    }))),
    
    // Display settings
    format: v.optional(v.string()), // number, currency, percent
    unit: v.optional(v.string()),
    decimals: v.optional(v.number()),
    prefix: v.optional(v.string()),
    suffix: v.optional(v.string()),
    
    // Goals and thresholds
    goal: v.optional(v.number()),
    thresholds: v.optional(v.object({
      warning: v.optional(v.number()),
      critical: v.optional(v.number()),
      direction: v.optional(v.string()), // higher_is_better, lower_is_better
    })),
    
    // Current value (cached)
    currentValue: v.optional(v.number()),
    previousValue: v.optional(v.number()),
    changePercent: v.optional(v.number()),
    lastCalculated: v.optional(v.number()),
    
    // Schedule
    refreshSchedule: v.optional(v.string()), // cron expression
    
    // Category for grouping
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    
    // Visibility
    isPublic: v.optional(v.boolean()),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_data_source", ["dataSource"])
    .index("by_category", ["workspaceId", "category"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Reports (Scheduled and downloadable reports)
  // ═══════════════════════════════════════════════════════════════════════════════
  biReports: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Report type
    type: v.union(
      v.literal("dashboard_snapshot"),
      v.literal("data_export"),
      v.literal("custom_query"),
      v.literal("template")
    ),
    
    // Source
    dashboardId: v.optional(v.id("biDashboards")),
    queryConfig: v.optional(v.object({
      tables: v.array(v.string()),
      fields: v.array(v.string()),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      groupBy: v.optional(v.array(v.string())),
      orderBy: v.optional(v.array(v.object({
        field: v.string(),
        direction: v.string(),
      }))),
    })),
    
    // Format
    format: v.union(
      v.literal("pdf"),
      v.literal("excel"),
      v.literal("csv"),
      v.literal("html")
    ),
    
    // Schedule
    schedule: v.optional(v.object({
      enabled: v.boolean(),
      frequency: v.string(), // daily, weekly, monthly
      dayOfWeek: v.optional(v.number()), // 0-6
      dayOfMonth: v.optional(v.number()), // 1-31
      time: v.string(), // HH:MM
      timezone: v.string(),
    })),
    
    // Recipients
    recipients: v.optional(v.array(v.object({
      type: v.string(), // email, webhook
      value: v.string(),
    }))),
    
    // Last generated
    lastGenerated: v.optional(v.number()),
    lastGeneratedUrl: v.optional(v.string()),
    generationStatus: v.optional(v.string()),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_dashboard", ["dashboardId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Data Sources (External data connections)
  // ═══════════════════════════════════════════════════════════════════════════════
  biDataSources: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Type
    type: v.union(
      v.literal("convex"),       // Internal Convex tables
      v.literal("rest_api"),     // REST API
      v.literal("google_sheets"),
      v.literal("postgres"),
      v.literal("mysql"),
      v.literal("csv_upload"),
      v.literal("webhook")
    ),
    
    // Connection config (encrypted in production)
    connectionConfig: v.optional(v.object({
      url: v.optional(v.string()),
      apiKey: v.optional(v.string()),
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      database: v.optional(v.string()),
      spreadsheetId: v.optional(v.string()),
    })),
    
    // Schema
    schema: v.optional(v.array(v.object({
      name: v.string(),
      type: v.string(),
      nullable: v.optional(v.boolean()),
    }))),
    
    // Sync settings
    syncEnabled: v.optional(v.boolean()),
    syncFrequency: v.optional(v.string()),
    lastSynced: v.optional(v.number()),
    syncStatus: v.optional(v.string()),
    
    // Cache
    cacheEnabled: v.optional(v.boolean()),
    cacheDuration: v.optional(v.number()),
    
    // Status
    isActive: v.boolean(),
    lastError: v.optional(v.string()),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["workspaceId", "type"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Alerts (Metric-based alerts)
  // ═══════════════════════════════════════════════════════════════════════════════
  biAlerts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Alert condition
    metricId: v.optional(v.id("biMetrics")),
    condition: v.object({
      type: v.string(), // threshold, change, anomaly
      operator: v.string(), // gt, lt, eq, gte, lte
      value: v.number(),
      timeWindow: v.optional(v.number()), // For change-based alerts
    }),
    
    // Notification
    channels: v.array(v.object({
      type: v.string(), // email, slack, webhook
      config: v.record(v.string(), v.any()),
    })),
    
    // Status
    isActive: v.boolean(),
    lastTriggered: v.optional(v.number()),
    triggerCount: v.optional(v.number()),
    
    // Snooze
    snoozedUntil: v.optional(v.number()),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_metric", ["metricId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Metric History (Historical values for trending)
  // ═══════════════════════════════════════════════════════════════════════════════
  biMetricHistory: defineTable({
    metricId: v.id("biMetrics"),
    
    value: v.number(),
    
    // Time period
    period: v.string(), // hourly, daily, weekly, monthly
    timestamp: v.number(),
    
    // Additional context
    dimensions: v.optional(v.record(v.string(), v.any())),
    
    // Workspace
    workspaceId: v.id("workspaces"),
  })
    .index("by_metric", ["metricId"])
    .index("by_workspace_period", ["workspaceId", "period"])
    .index("by_metric_timestamp", ["metricId", "timestamp"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // BI Saved Queries (Reusable query definitions)
  // ═══════════════════════════════════════════════════════════════════════════════
  biSavedQueries: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Query definition
    query: v.object({
      tables: v.array(v.string()),
      fields: v.array(v.object({
        name: v.string(),
        alias: v.optional(v.string()),
        aggregation: v.optional(v.string()),
      })),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
        parameterized: v.optional(v.boolean()),
      }))),
      groupBy: v.optional(v.array(v.string())),
      orderBy: v.optional(v.array(v.object({
        field: v.string(),
        direction: v.string(),
      }))),
      limit: v.optional(v.number()),
    }),
    
    // Parameters (for parameterized queries)
    parameters: v.optional(v.array(v.object({
      name: v.string(),
      type: v.string(),
      defaultValue: v.optional(v.any()),
      required: v.boolean(),
    }))),
    
    // Tags for organization
    tags: v.optional(v.array(v.string())),
    
    // Sharing
    isPublic: v.boolean(),
    sharedWith: v.optional(v.array(v.id("users"))),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"]),
};

export default biTables;
