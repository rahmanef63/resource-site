/**
 * Import/Export Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { ArrowLeftRight, Upload, Download } from "lucide-react"
import { ImportExportGeneralSettings, ImportExportImportSettings } from "./settings"
import { registerImportExportAgent } from "./agent"

registerFeatureSettings("import-export", () => [
  {
    id: "import-export-export",
    label: "Export",
    icon: Download,
    order: 500,
    component: ImportExportGeneralSettings,
  },
  {
    id: "import-export-import",
    label: "Import",
    icon: Upload,
    order: 510,
    component: ImportExportImportSettings,
  },
])

registerImportExportAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
