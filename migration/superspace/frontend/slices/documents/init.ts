/**
 * Documents Feature Initialization
 * Registers documents settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { FileText, Share2, Users, Download } from "lucide-react"
import {
  DocumentsEditorSettings,
  DocumentsSharingSettings,
  DocumentsCollaborationSettings,
  DocumentsExportSettings,
} from "./settings"

import { registerDocumentsAgent } from "./agent"
import { Copy, Trash, ExternalLink } from "lucide-react"
import { toast } from "sonner"

registerFeatureSettings("documents", () => [
  {
    id: "documents-editor",
    label: "Editor",
    icon: FileText,
    order: 100,
    component: DocumentsEditorSettings,
  },
  {
    id: "documents-sharing",
    label: "Sharing",
    icon: Share2,
    order: 110,
    component: DocumentsSharingSettings,
  },
  {
    id: "documents-collaboration",
    label: "Collaboration",
    icon: Users,
    order: 120,
    component: DocumentsCollaborationSettings,
  },
  {
    id: "documents-export",
    label: "Export",
    icon: Download,
    order: 130,
    component: DocumentsExportSettings,
  },
])

registerDocumentsAgent()

import { registerCreateActions } from "@/frontend/shared/foundation/utils/registry/create-registry"
import { registerCommands } from "@/frontend/shared/foundation/utils/registry/command-registry"

registerCreateActions("documents", [
  {
    id: "create-document",
    label: "Document",
    icon: FileText,
    description: "Create a new collaborative document",
    shortcut: "N D",
    onClick: () => window.dispatchEvent(new Event("open-create-document-dialog")),
    order: 10
  }
])

registerCommands("documents", [
  {
    id: "create-document-cmd",
    label: "Create New Document",
    icon: FileText,
    shortcut: "N D",
    group: "actions",
    keywords: ["new", "doc", "page"],
    action: () => window.dispatchEvent(new Event("open-create-document-dialog"))
  },
  {
    id: "copy-link",
    label: "Copy Link",
    icon: Copy,
    group: "actions",
    action: () => {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  },
  {
    id: "open-new-tab",
    label: "Open in new tab",
    icon: ExternalLink,
    group: "actions",
    action: () => window.open(window.location.href, "_blank")
  },
  {
    id: "delete-document",
    label: "Delete",
    icon: Trash,
    variant: "destructive",
    group: "danger",
    action: () => {
      toast.error("Delete not implemented yet")
    }
  }
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}

