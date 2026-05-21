/** Shared props contract for every view component (Table / Board /
 *  List / Gallery / Calendar / Feed). Each view receives the same
 *  shape so the host can swap views at runtime without rewiring. */

import type { ReactNode } from "react";
import type {
  Database, DatabaseViewConfig, Page, Property, PropertyValue,
} from "../../types";

export interface ViewProps {
  db: Database;
  view: DatabaseViewConfig;
  /** Pre-filtered + pre-sorted rows (caller applies viewData.applyView). */
  rows: Page[];
  readOnly?: boolean;
  onRowUpdate?: (rowId: string, propId: string, value: PropertyValue) => void;
  onRowRemove?: (rowId: string) => void;
  onRowAdd?: () => void;
  /** Render-prop for one cell — host passes a custom component (typically
   *  the per-cell NotionProperty / property-cells renderer) to keep each
   *  view file pure presentation. */
  renderCell: (prop: Property, row: Page) => ReactNode;
  /** Render-prop for one column header — host can wrap with
   *  ColumnHeaderMenu. */
  renderColumnHeader?: (prop: Property) => ReactNode;
}
