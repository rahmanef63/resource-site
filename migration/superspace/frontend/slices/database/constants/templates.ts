import type { DatabaseFieldOptions, DatabaseFieldType, DatabaseSelectOption } from "../types"

export type DatabaseStarterTemplateId = "blank" | "tasks" | "crm" | "content_calendar"

export interface DatabaseStarterTemplateField {
  name: string
  type: DatabaseFieldType
  options?: DatabaseFieldOptions
  isRequired?: boolean
}

export interface DatabaseStarterTemplate {
  id: DatabaseStarterTemplateId
  name: string
  description: string
  defaultTableName: string
  defaultDescription?: string
  defaultIcon: string
  defaultIconColor: string
  fields: DatabaseStarterTemplateField[]
}

function selectOption(id: string, name: string, color: string): DatabaseSelectOption {
  return { id, name, color }
}

export const DATABASE_STARTER_TEMPLATES: DatabaseStarterTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch.",
    defaultTableName: "",
    defaultIcon: "Database",
    defaultIconColor: "default",
    fields: [],
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Track tasks with status, due dates, and owners.",
    defaultTableName: "Tasks",
    defaultIcon: "CheckSquare",
    defaultIconColor: "#22c55e",
    fields: [
      {
        name: "Status",
        type: "select",
        options: {
          selectOptions: [
            selectOption("todo", "Todo", "#6b7280"),
            selectOption("in-progress", "In Progress", "#0ea5e9"),
            selectOption("done", "Done", "#22c55e"),
          ],
        },
      },
      { name: "Due date", type: "date" },
      { name: "Assignee", type: "person" },
      {
        name: "Priority",
        type: "select",
        options: {
          selectOptions: [
            selectOption("low", "Low", "#22c55e"),
            selectOption("medium", "Medium", "#f59e0b"),
            selectOption("high", "High", "#ef4444"),
          ],
        },
      },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Manage contacts and deal stages.",
    defaultTableName: "Contacts",
    defaultIcon: "Users",
    defaultIconColor: "#3b82f6",
    fields: [
      { name: "Company", type: "text" },
      { name: "Email", type: "email" },
      { name: "Phone", type: "phone" },
      {
        name: "Stage",
        type: "select",
        options: {
          selectOptions: [
            selectOption("lead", "Lead", "#6b7280"),
            selectOption("qualified", "Qualified", "#0ea5e9"),
            selectOption("proposal", "Proposal", "#a855f7"),
            selectOption("won", "Won", "#22c55e"),
            selectOption("lost", "Lost", "#ef4444"),
          ],
        },
      },
      { name: "Next contact", type: "date" },
      { name: "Owner", type: "person" },
    ],
  },
  {
    id: "content_calendar",
    name: "Content calendar",
    description: "Plan publishing across channels.",
    defaultTableName: "Content calendar",
    defaultIcon: "Calendar",
    defaultIconColor: "#a855f7",
    fields: [
      {
        name: "Status",
        type: "select",
        options: {
          selectOptions: [
            selectOption("idea", "Idea", "#6b7280"),
            selectOption("draft", "Draft", "#f59e0b"),
            selectOption("ready", "Ready", "#0ea5e9"),
            selectOption("scheduled", "Scheduled", "#a855f7"),
            selectOption("published", "Published", "#22c55e"),
          ],
        },
      },
      { name: "Publish date", type: "date" },
      {
        name: "Channel",
        type: "select",
        options: {
          selectOptions: [
            selectOption("blog", "Blog", "#0ea5e9"),
            selectOption("twitter", "Twitter/X", "#1d4ed8"),
            selectOption("linkedin", "LinkedIn", "#3b82f6"),
            selectOption("instagram", "Instagram", "#ec4899"),
            selectOption("youtube", "YouTube", "#ef4444"),
          ],
        },
      },
      { name: "Author", type: "person" },
      { name: "URL", type: "url" },
    ],
  },
]

export function getDatabaseStarterTemplate(
  id: DatabaseStarterTemplateId | null | undefined
): DatabaseStarterTemplate {
  const fallback = DATABASE_STARTER_TEMPLATES.find((t) => t.id === "blank")
  const match = id ? DATABASE_STARTER_TEMPLATES.find((t) => t.id === id) : undefined
  return match ?? fallback!
}
