/**
 * View-related utility functions
 */

import type { DatabaseView, DatabaseViewType } from "../types";
import { APP_VIEW_TYPE_TO_DB, DB_VIEW_TYPE_TO_APP } from "../constants";

/**
 * Gets the default view type from a list of views
 */
export function getDefaultViewType(views: DatabaseView[]): DatabaseViewType {
  const defaultView = views.find((view) => view.isDefault);
  if (defaultView) {
    return DB_VIEW_TYPE_TO_APP[defaultView.type] ?? "table";
  }

  const tableView = views.find((view) => view.type === "table");
  if (tableView) {
    return "table";
  }

  return "table";
}

/**
 * Finds the active database view based on the app view type
 */
export function findActiveDbView(
  views: DatabaseView[],
  activeView: DatabaseViewType
): DatabaseView | null {
  const targetType = APP_VIEW_TYPE_TO_DB[activeView];
  return views.find((view) => view.type === targetType) ?? null;
}
